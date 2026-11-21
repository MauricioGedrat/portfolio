"use client";

import { useEffect, useRef } from "react";
import { damp, prefersReducedMotion } from "@/lib/motion";
import { getWave, onWave, shape, waveHex, waveLabel, type Wave } from "@/lib/waves";

const W = 1000;
const H = 560;
const DIV_X = 10;
const DIV_Y = 8;
const SAMPLES = 220;

/**
 * An oscilloscope screen. The visitor is the signal generator:
 * pointer X sets the frequency, pointer Y sets the amplitude, and the
 * trace eases toward the new setting like a real instrument settling.
 * Static (and cheaper) when reduced motion is on or the hero is off-screen.
 */
export function ScopeTrace({ className = "" }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = svg.current;
    const path = trace.current;
    if (!root || !path) return;

    const target = { f: 2.2, a: 0.32 };
    const state = { f: 2.2, a: 0.32, phase: 0, mix: 1 };
    let wave: Wave = getWave();
    let prev: Wave = wave;
    const paint = () => {
      const hex = waveHex(wave);
      path.setAttribute("stroke", hex);
      path.style.filter = `drop-shadow(0 0 6px ${hex}88)`;
    };
    paint();

    const draw = () => {
      let d = "";
      for (let i = 0; i <= SAMPLES; i++) {
        const x = i / SAMPLES;
        const w = 2 * Math.PI * state.f * x + state.phase;
        // Cross-fade between the previous and the new waveform after a switch.
        const y = shape(prev, w) * (1 - state.mix) + shape(wave, w) * state.mix;
        const py = H / 2 - y * state.a * (H / 2) * 0.92;
        d += `${i === 0 ? "M" : "L"}${(x * W).toFixed(1)} ${py.toFixed(1)}`;
      }
      path.setAttribute("d", d);
      if (readout.current) {
        const khz = (state.f * 1.25).toFixed(2);
        const vpp = (state.a * 2 * 4).toFixed(2);
        readout.current.textContent = `${waveLabel(wave)}  ${vpp} V   ${khz} kHz`;
      }
    };

    draw();
    const off = onWave((w) => {
      prev = wave;
      wave = w;
      state.mix = prefersReducedMotion() ? 1 : 0;
      paint();
      draw();
    });
    if (prefersReducedMotion()) return off;

    const onPointer = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const nx = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      const ny = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      target.f = 0.8 + nx * 4.2;
      target.a = 0.12 + (1 - ny) * 0.62;
    };

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      state.f = damp(state.f, target.f, 3.5, dt);
      state.a = damp(state.a, target.a, 3.5, dt);
      state.phase -= dt * 1.6;
      state.mix = Math.min(1, state.mix + dt * 3);
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible";
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(root);
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      off();
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div aria-hidden className={className}>
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <g stroke="var(--color-graticule)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {Array.from({ length: DIV_X + 1 }, (_, i) => (
          <line key={`x${i}`} x1={(i * W) / DIV_X} y1="0" x2={(i * W) / DIV_X} y2={H} vectorEffect="non-scaling-stroke" />
        ))}
        {Array.from({ length: DIV_Y + 1 }, (_, i) => (
          <line key={`y${i}`} x1="0" y1={(i * H) / DIV_Y} x2={W} y2={(i * H) / DIV_Y} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {/* Centre axes with minor ticks, like a real graticule. */}
      <g stroke="var(--color-rule)" strokeWidth="1">
        {Array.from({ length: DIV_X * 5 + 1 }, (_, i) => (
          <line key={`tx${i}`} x1={(i * W) / (DIV_X * 5)} y1={H / 2 - 5} x2={(i * W) / (DIV_X * 5)} y2={H / 2 + 5} vectorEffect="non-scaling-stroke" />
        ))}
        {Array.from({ length: DIV_Y * 5 + 1 }, (_, i) => (
          <line key={`ty${i}`} x1={W / 2 - 5} y1={(i * H) / (DIV_Y * 5)} x2={W / 2 + 5} y2={(i * H) / (DIV_Y * 5)} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <path
        ref={trace}
        fill="none"
        stroke="#e8d44d"
        strokeWidth="1.75"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="transition-[stroke] duration-500"
      />
    </svg>
      <p ref={readout} className="tabular absolute bottom-2 right-3 whitespace-pre text-xs text-dim" />
    </div>
  );
}
