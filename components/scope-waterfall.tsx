"use client";

import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { damp } from "@/lib/motion";
import { getWave, onWave, shape, waveHex, waveLabel, type Wave } from "@/lib/waves";

// Screen in world units: 10 × 8 divisions, like the 2D scope.
const HALF_W = 5;
const HALF_H = 4;
const SAMPLES = 180;
const HISTORY = 42; // traces kept behind the live one
const DZ = 0.46; // depth between two traces
const SNAP_MS = 70; // how often the live trace is copied into history

const CH1 = new Color("#e8d44d");
const RULE = new Color("#343b42");
const GRATICULE = new Color("#262c32");

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * The hero's oscilloscope with persistence in depth: the live trace sits on the
 * front graticule (pointer X = frequency, Y = amplitude, as in the 2D version)
 * and every ~70 ms a copy of it slides back into a waterfall, so the screen
 * keeps a 3D history of what the visitor did. Scrolling out of the hero damps
 * the signal until every trace converges into one flat line.
 */
export function ScopeWaterfall({ onReady }: { onReady?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";

    const scene = new Scene();
    const camera = new PerspectiveCamera(28, 1, 0.1, 100);
    const look = { x: 0.4, y: 0.2, z: -7 };

    // ── Front graticule + depth rails ───────────────────────────────
    const grid: number[] = [];
    for (let i = 0; i <= 10; i++) {
      const x = -HALF_W + i;
      grid.push(x, -HALF_H, 0, x, HALF_H, 0);
    }
    for (let j = 0; j <= 8; j++) {
      const y = -HALF_H + j;
      grid.push(-HALF_W, y, 0, HALF_W, y, 0);
    }
    const depth = HISTORY * DZ;
    // floor lines running back, every two divisions, and a few cross ties
    for (let i = 0; i <= 10; i += 2) grid.push(-HALF_W + i, -HALF_H, 0, -HALF_W + i, -HALF_H, -depth);
    for (let k = 1; k <= 4; k++) {
      const z = -(depth * k) / 4;
      grid.push(-HALF_W, -HALF_H, z, HALF_W, -HALF_H, z);
    }
    const gridGeo = new BufferGeometry();
    gridGeo.setAttribute("position", new BufferAttribute(new Float32Array(grid), 3));
    const gridMat = new LineBasicMaterial({ color: GRATICULE, transparent: true, opacity: 0.9 });
    scene.add(new LineSegments(gridGeo, gridMat));

    // centre-axis ticks on the front screen
    const ticks: number[] = [];
    for (let i = 0; i <= 50; i++) {
      const x = -HALF_W + i * 0.2;
      ticks.push(x, -0.1, 0.001, x, 0.1, 0.001);
    }
    for (let j = 0; j <= 40; j++) {
      const y = -HALF_H + j * 0.2;
      ticks.push(-0.1, y, 0.001, 0.1, y, 0.001);
    }
    const tickGeo = new BufferGeometry();
    tickGeo.setAttribute("position", new BufferAttribute(new Float32Array(ticks), 3));
    const tickMat = new LineBasicMaterial({ color: RULE });
    scene.add(new LineSegments(tickGeo, tickMat));

    // ── History traces (thin, fading toward the back) ───────────────
    type Hist = { line: Line; pos: Float32Array; mat: LineBasicMaterial; base: Color };
    const hist: Hist[] = [];
    for (let k = 0; k < HISTORY; k++) {
      const pos = new Float32Array((SAMPLES + 1) * 3);
      for (let i = 0; i <= SAMPLES; i++) pos[i * 3] = -HALF_W + (i / SAMPLES) * HALF_W * 2;
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(pos, 3));
      const mat = new LineBasicMaterial({ color: CH1.clone(), transparent: true, opacity: 0, depthWrite: false });
      const line = new Line(geo, mat);
      line.frustumCulled = false;
      scene.add(line);
      hist.push({ line, pos, mat, base: CH1.clone() });
    }

    // ── Live trace: a fat line plus a soft wide halo ────────────────
    const live = new Float32Array((SAMPLES + 1) * 3);
    const liveGeo = new LineGeometry();
    liveGeo.setPositions(live);
    const liveMat = new LineMaterial({ color: CH1.getHex(), linewidth: 2.2, transparent: true });
    const haloMat = new LineMaterial({ color: CH1.getHex(), linewidth: 10, transparent: true, opacity: 0.12, depthWrite: false });
    const halo = new Line2(liveGeo, haloMat);
    const liveLine = new Line2(liveGeo, liveMat);
    halo.position.z = liveLine.position.z = 0.01;
    scene.add(halo, liveLine);

    // ── Signal model (same feel as the 2D scope) ────────────────────
    const target = { f: 2.2, a: 0.32, px: 0.5, py: 0.5 };
    const state = { f: 2.2, a: 0.32, phase: 0, px: 0.5, py: 0.5, conv: 0, mix: 1 };
    let wave: Wave = getWave();
    let prev: Wave = wave;
    const liveColor = new Color(waveHex(wave));
    const targetColor = liveColor.clone();
    const offWave = onWave((w) => {
      prev = wave;
      wave = w;
      state.mix = 0;
      targetColor.set(waveHex(w));
    });

    const sample = (out: Float32Array, a: number) => {
      for (let i = 0; i <= SAMPLES; i++) {
        const x = i / SAMPLES;
        const w = 2 * Math.PI * state.f * x + state.phase;
        out[i * 3] = -HALF_W + x * HALF_W * 2;
        out[i * 3 + 1] = (shape(prev, w) * (1 - state.mix) + shape(wave, w) * state.mix) * a * HALF_H * 0.92;
        out[i * 3 + 2] = 0;
      }
    };

    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.px = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      target.py = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      target.f = 0.8 + target.px * 4.2;
      target.a = 0.12 + (1 - target.py) * 0.62;
    };

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      liveMat.resolution.set(width, height);
      haloMat.resolution.set(width, height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const hero = el.closest("section");
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let lastSnap = last;
    let ready = false;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Scroll out of the hero → converge.
      let p = 0;
      if (hero) {
        const r = hero.getBoundingClientRect();
        p = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
      }
      state.conv = damp(state.conv, smoothstep(0.02, 0.7, p), 6, dt);

      state.f = damp(state.f, target.f, 3.5, dt);
      state.a = damp(state.a, target.a, 3.5, dt);
      state.px = damp(state.px, target.px, 2.5, dt);
      state.py = damp(state.py, target.py, 2.5, dt);
      state.phase -= dt * 1.6;
      state.mix = Math.min(1, state.mix + dt * 2.5);
      liveColor.lerp(targetColor, Math.min(1, dt * 6));
      liveMat.color.copy(liveColor);
      haloMat.color.copy(liveColor);

      const amp = state.a * (1 - state.conv);
      sample(live, amp);
      liveGeo.setPositions(live);

      if (now - lastSnap >= SNAP_MS) {
        lastSnap = now;
        const oldest = hist.pop()!;
        oldest.pos.set(live);
        oldest.base.copy(liveColor);
        (oldest.line.geometry.getAttribute("position") as BufferAttribute).needsUpdate = true;
        hist.unshift(oldest);
      }

      const frac = (now - lastSnap) / SNAP_MS;
      const spacing = DZ * (1 - 0.85 * state.conv);
      for (let k = 0; k < HISTORY; k++) {
        const h = hist[k];
        const t = (k + frac) / HISTORY;
        h.line.position.z = -(k + 1 + frac) * spacing;
        h.mat.color.copy(h.base).lerp(RULE, Math.min(1, t * 1.15));
        h.mat.opacity = Math.pow(1 - t, 1.6) * 0.7;
      }

      // Camera: three-quarter view from the right, with a little pointer parallax.
      camera.position.set(9.0 + (state.px - 0.5) * 1.4, 4.2 - (state.py - 0.5) * 1.0 - state.conv * 2.2, 19.5);
      camera.lookAt(look.x, look.y - state.conv * 0.8, look.z);

      renderer.render(scene, camera);

      if (readout.current) {
        const khz = (state.f * 1.25).toFixed(2);
        const vpp = (amp * 2 * 4).toFixed(2);
        readout.current.textContent = `${waveLabel(wave)}  ${vpp} V   ${khz} kHz`;
      }
      if (!ready) {
        ready = true;
        onReady?.();
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const resume = () => {
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible";
      resume();
    });
    io.observe(el);
    const onVis = () => {
      visible = document.visibilityState === "visible";
      resume();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      offWave();
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      hist.forEach((h) => {
        h.line.geometry.dispose();
        h.mat.dispose();
      });
      liveGeo.dispose();
      liveMat.dispose();
      haloMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      tickGeo.dispose();
      tickMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady]);

  return (
    <div
      ref={box}
      aria-hidden
      className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
    >
      <p ref={readout} className="tabular absolute bottom-2 right-3 z-10 whitespace-pre text-xs text-dim" />
    </div>
  );
}
