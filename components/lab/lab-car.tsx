"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/content/types";
import { CH } from "@/lib/accent";
import { drawCity, drawMinimap, hits, START, TARGET, WORLD_H, WORLD_W } from "./car-city";

// Same letters and PWM values as firmware/carrinho_web.ino
type Mov = "F" | "B" | "S";
type Dir = "L" | "R" | "C";
type Cmd = Mov | Dir | "1" | "2" | "3" | "H" | "h";
const VEL_FRENTE = [140, 190, 255];
const VEL_RE = 170;
const VEL_DIRECAO = 200;
const TEMPO_PISCA = 400; // ms
const SPEED = 220; // px/s at 100 % duty (simulation scale)

type State = { mov: Mov; vel: 1 | 2 | 3; dir: Dir; farol: boolean };
type Evt = "crash" | "parked" | null;

const copy = {
  pt: {
    forward: "Frente",
    back: "Ré",
    left: "Esquerda",
    right: "Direita",
    speed: "Velocidade",
    light: "Farol",
    keys: "Clique na cidade e use as setas ou WASD, 1/2/3 e H.",
    crash: "Bateu! Dê ré para sair.",
    parked: "Estacionou certinho na vaga.",
    tx: "Estado que o ESP32 devolve (TX)",
    rx: "Letras enviadas ao ESP32 (RX)",
    driver: "Ponte H L298N",
    leds: "LEDs",
    ledNames: { farol: "farol", esq: "pisca esq.", dir: "pisca dir.", freio: "freio" },
    status: (s: State) => (s.mov === "F" ? `Andando para frente na velocidade ${s.vel}` : s.mov === "B" ? "Dando ré" : "Parado, com freio"),
    note: "A cidade é fictícia, mas o protocolo e os valores de PWM são os mesmos do firmware do carrinho. Tem uma vaga livre no estacionamento, marcada em verde no minimapa, para treinar. Ao sair da página ou trocar de aba, ele para, como o real.",
    see: "Ver o projeto real",
    arena: "Cidadezinha do carrinho simulado",
  },
  en: {
    forward: "Forward",
    back: "Reverse",
    left: "Left",
    right: "Right",
    speed: "Speed",
    light: "Headlight",
    keys: "Click the town, then use the arrows or WASD, 1/2/3 and H.",
    crash: "Bumped into something. Back up to get out.",
    parked: "Parked right in the spot.",
    tx: "State the ESP32 sends back (TX)",
    rx: "Letters sent to the ESP32 (RX)",
    driver: "L298N H-bridge",
    leds: "LEDs",
    ledNames: { farol: "headlight", esq: "left blink", dir: "right blink", freio: "brake" },
    status: (s: State) => (s.mov === "F" ? `Driving forward at speed ${s.vel}` : s.mov === "B" ? "Reversing" : "Stopped, braking"),
    note: "The town is made up, but the protocol and PWM values are the same as the car's firmware. There's a free spot in the parking lot, marked in green on the minimap, to practise. Leaving the page or switching tabs stops it, like the real one.",
    see: "See the real project",
    arena: "Little town for the simulated car",
  },
};

const KEY_MOV: Record<string, "F" | "B"> = { ArrowUp: "F", w: "F", W: "F", ArrowDown: "B", s: "B", S: "B" };
const KEY_DIR: Record<string, "L" | "R"> = { ArrowLeft: "L", a: "L", A: "L", ArrowRight: "R", d: "R", D: "R" };

export function LabCar({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const [st, setSt] = useState<State>({ mov: "S", vel: 1, dir: "C", farol: false });
  const [log, setLog] = useState<string[]>([]);
  const [blink, setBlink] = useState(false);
  const [evt, setEvt] = useState<Evt>(null);
  const evtRef = useRef<Evt>(null);
  const stRef = useRef(st);
  useLayoutEffect(() => {
    stRef.current = st;
  }, [st]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // "Send" a letter: update the state exactly like the firmware would, and log it.
  const send = useCallback((cmd: Cmd) => {
    setLog((l) => [...l.slice(-15), cmd]);
    setSt((s) => {
      switch (cmd) {
        case "F":
        case "B":
        case "S":
          return { ...s, mov: cmd };
        case "L":
        case "R":
        case "C":
          return { ...s, dir: cmd };
        case "1":
        case "2":
        case "3":
          return { ...s, vel: Number(cmd) as 1 | 2 | 3 };
        case "H":
          return { ...s, farol: true };
        case "h":
          return { ...s, farol: false };
      }
    });
  }, []);

  // Safety, like the real site: stop when the window loses focus or the tab is hidden.
  useEffect(() => {
    const stop = () => {
      if (stRef.current.mov !== "S") send("S");
      if (stRef.current.dir !== "C") send("C");
    };
    const vis = () => document.visibilityState === "hidden" && stop();
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", vis);
    return () => {
      stop();
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [send]);

  // Blinkers: toggle every 400 ms while turning (millis() in the firmware).
  useEffect(() => {
    if (st.dir === "C") return;
    const id = setInterval(() => setBlink((b) => !b), TEMPO_PISCA);
    return () => clearInterval(id);
  }, [st.dir]);

  // Car physics, camera and drawing over the little town
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const g = cv.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const zoomFor = (w: number) => Math.max(0.5, Math.min(1, w / 760));

    // the town is drawn once to an offscreen canvas; each frame only copies the visible part
    const scale = Math.min(1.5, Math.max(1, dpr * zoomFor(cv.clientWidth)));
    const city = document.createElement("canvas");
    city.width = Math.round(WORLD_W * scale);
    city.height = Math.round(WORLD_H * scale);
    const cg = city.getContext("2d")!;
    cg.scale(scale, scale);
    drawCity(cg);
    const MW = 120;
    const MH = (MW * WORLD_H) / WORLD_W;
    const mini = document.createElement("canvas");
    mini.width = Math.round(MW * dpr);
    mini.height = Math.round(MH * dpr);
    const mg = mini.getContext("2d")!;
    mg.scale(dpr, dpr);
    drawMinimap(mg, MW, MH);

    const car = { x: START.x, y: START.y, h: START.h, v: 0, steer: 0 };
    const cam = { x: car.x, y: car.y };
    const trail: { x: number; y: number }[] = [];
    let crashAt = -1e9;
    let blocked = false;
    let raf = 0;
    let last = performance.now();
    let blinkOn = false;
    let blinkT = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const s = stRef.current;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const z = zoomFor(W);

      // duty cycle → speed (px/s); the L298N brake stops it faster than coasting
      const duty = s.mov === "F" ? VEL_FRENTE[s.vel - 1] / 255 : s.mov === "B" ? -VEL_RE / 255 : 0;
      car.v += (duty * SPEED - car.v) * Math.min(1, dt * (s.mov === "S" ? 9 : 2.5));
      const steerTarget = s.dir === "L" ? -0.6 : s.dir === "R" ? 0.6 : 0;
      car.steer += (steerTarget - car.steer) * Math.min(1, dt * 8);
      const nh = car.h + (car.v / 32) * Math.tan(car.steer) * dt;
      const nx = car.x + Math.cos(nh) * car.v * dt;
      const ny = car.y + Math.sin(nh) * car.v * dt;
      if (hits(nx, ny, nh)) {
        if (Math.abs(car.v) > 30) crashAt = now;
        car.v = 0;
        blocked = true;
      } else {
        blocked = false;
        car.x = nx;
        car.y = ny;
        car.h = nh;
      }
      const lt = trail[trail.length - 1];
      if (!lt || Math.hypot(lt.x - car.x, lt.y - car.y) > 4) {
        trail.push({ x: car.x, y: car.y });
        if (trail.length > 500) trail.shift();
      }
      blinkT += dt * 1000;
      if (blinkT >= TEMPO_PISCA) {
        blinkT = 0;
        blinkOn = !blinkOn;
      }

      // events shown in the overlay (only touch React state when they change)
      const parked =
        car.x > TARGET.x && car.x < TARGET.x + TARGET.w && car.y > TARGET.y && car.y < TARGET.y + TARGET.h && Math.abs(Math.cos(car.h)) < 0.4 && Math.abs(car.v) < 4;
      const e: Evt = blocked || now - crashAt < 1400 ? "crash" : parked ? "parked" : null;
      if (e !== evtRef.current) {
        evtRef.current = e;
        setEvt(e);
      }

      // camera follows the car, clamped to the town
      const vw = W / z;
      const vh = H / z;
      const k = Math.min(1, dt * 5);
      cam.x += (car.x - cam.x) * k;
      cam.y += (car.y - cam.y) * k;
      const sx = Math.min(Math.max(cam.x - vw / 2, 0), WORLD_W - vw);
      const sy = Math.min(Math.max(cam.y - vh / 2, 0), WORLD_H - vh);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.drawImage(city, sx * scale, sy * scale, vw * scale, vh * scale, 0, 0, W, H);

      g.save();
      g.scale(z, z);
      g.translate(-sx, -sy);
      // the free parking spot, pulsing
      const pulse = parked ? 1 : 0.5 + 0.5 * Math.sin(now / 300);
      g.fillStyle = `rgba(95,214,144,${parked ? 0.28 : 0.08 + pulse * 0.1})`;
      g.fillRect(TARGET.x + 3, TARGET.y + 3, TARGET.w - 6, TARGET.h - 6);
      g.strokeStyle = `rgba(95,214,144,${0.45 + pulse * 0.45})`;
      g.lineWidth = 2;
      g.setLineDash([6, 5]);
      g.strokeRect(TARGET.x + 3, TARGET.y + 3, TARGET.w - 6, TARGET.h - 6);
      g.setLineDash([]);
      // trail
      g.lineWidth = 2;
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        g.strokeStyle = `rgba(95, 214, 144, ${(i / trail.length) * 0.45})`;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }

      // car (top view): 46 × 26 px body
      g.translate(car.x, car.y);
      g.rotate(car.h);
      const L = 46;
      const Wd = 26;
      if (s.farol) {
        g.save();
        g.globalCompositeOperation = "lighter";
        const beam = g.createLinearGradient(L / 2, 0, L / 2 + 150, 0);
        beam.addColorStop(0, "rgba(232,212,77,0.42)");
        beam.addColorStop(1, "rgba(232,212,77,0)");
        g.fillStyle = beam;
        g.beginPath();
        g.moveTo(L / 2, -Wd / 2 + 3);
        g.lineTo(L / 2 + 150, -Wd / 2 - 42);
        g.lineTo(L / 2 + 150, Wd / 2 + 42);
        g.lineTo(L / 2, Wd / 2 - 3);
        g.closePath();
        g.fill();
        g.restore();
      }
      g.fillStyle = "rgba(0,0,0,0.5)";
      g.beginPath();
      g.roundRect(-L / 2 + 3, -Wd / 2 + 6, L, Wd - 4, 6);
      g.fill();
      g.fillStyle = "#0b0d0f";
      const wheel = (x: number, y: number, rot: number) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.fillRect(-7, -3.5, 14, 7);
        g.restore();
      };
      wheel(-L / 2 + 9, -Wd / 2, 0);
      wheel(-L / 2 + 9, Wd / 2, 0);
      wheel(L / 2 - 9, -Wd / 2, car.steer);
      wheel(L / 2 - 9, Wd / 2, car.steer);
      g.fillStyle = "#e6e8e3";
      g.beginPath();
      g.roundRect(-L / 2, -Wd / 2 + 2, L, Wd - 4, 6);
      g.fill();
      g.fillStyle = "#151a1e";
      g.fillRect(-6, -Wd / 2 + 6, 16, Wd - 12);
      const dot = (x: number, y: number, color: string, on: boolean) => {
        g.fillStyle = on ? color : "#3a4148";
        g.shadowColor = on ? color : "transparent";
        g.shadowBlur = on ? 12 : 0;
        g.beginPath();
        g.arc(x, y, 3, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;
      };
      dot(L / 2 - 2, -Wd / 2 + 6, CH.ch1, s.farol);
      dot(L / 2 - 2, Wd / 2 - 6, CH.ch1, s.farol);
      const freio = s.mov !== "F"; // firmware: LED_FREIO = movimento != FRENTE
      dot(-L / 2 + 2, -Wd / 2 + 6, "#f0846e", freio);
      dot(-L / 2 + 2, Wd / 2 - 6, "#f0846e", freio);
      dot(4, -Wd / 2 + 2, "#ec9a5f", s.dir === "L" && blinkOn);
      dot(4, Wd / 2 - 2, "#ec9a5f", s.dir === "R" && blinkOn);
      g.restore();

      // minimap with the visible area and the car
      const mw = Math.min(MW, W * 0.3);
      const mh = (mw * WORLD_H) / WORLD_W;
      const m = mw / WORLD_W;
      const mx = W - mw - 10;
      const my = 10;
      g.globalAlpha = 0.92;
      g.drawImage(mini, mx, my, mw, mh);
      g.globalAlpha = 1;
      g.strokeStyle = "rgba(230,232,227,0.25)";
      g.lineWidth = 1;
      g.strokeRect(mx + 0.5, my + 0.5, mw - 1, mh - 1);
      g.strokeStyle = "rgba(230,232,227,0.6)";
      g.strokeRect(mx + sx * m, my + sy * m, vw * m, vh * m);
      g.fillStyle = CH.ch4;
      g.beginPath();
      g.arc(mx + car.x * m, my + car.y * m, 3, 0, Math.PI * 2);
      g.fill();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  // Keyboard, only while the track has focus (so arrows still scroll the page elsewhere).
  const held = useRef<{ mov: string | null; dir: string | null }>({ mov: null, dir: null });
  const onKeyDown = (e: React.KeyboardEvent) => {
    // block page scrolling for every drive key, including the auto-repeat while held
    if (KEY_MOV[e.key] || KEY_DIR[e.key]) e.preventDefault();
    if (e.repeat) return;
    if (KEY_MOV[e.key]) {
      held.current.mov = e.key;
      send(KEY_MOV[e.key]);
    } else if (KEY_DIR[e.key]) {
      held.current.dir = e.key;
      send(KEY_DIR[e.key]);
    } else if (e.key === "1" || e.key === "2" || e.key === "3") send(e.key);
    else if (e.key === "h" || e.key === "H") send(stRef.current.farol ? "h" : "H");
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === held.current.mov) {
      held.current.mov = null;
      send("S");
    } else if (e.key === held.current.dir) {
      held.current.dir = null;
      send("C");
    }
  };

  const tx = `${st.mov}${st.vel}${st.dir}${st.farol ? 1 : 0}`;
  const ena = st.mov === "F" ? VEL_FRENTE[st.vel - 1] : st.mov === "B" ? VEL_RE : 255;
  const in1 = st.mov === "F" ? 1 : 0;
  const in2 = st.mov === "B" ? 1 : 0;
  const enb = st.dir === "C" ? 0 : VEL_DIRECAO;
  const in3 = st.dir === "L" ? 1 : 0;
  const in4 = st.dir === "R" ? 1 : 0;

  return (
    <div
      className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-8"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={(e) => {
        // focus left the whole widget: keys still held will never fire keyup, so release them
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        if (held.current.mov) send("S");
        if (held.current.dir) send("C");
        held.current = { mov: null, dir: null };
      }}
    >
      <div className="col-span-12 lg:col-span-8">
        <div
          ref={box}
          tabIndex={0}
          role="application"
          aria-label={`${c.arena}. ${c.keys}`}
          className="relative aspect-[4/3] w-full overflow-hidden border border-graticule bg-[#0b0e10] outline-offset-2 focus-visible:outline-2 focus-visible:outline-ch4 sm:aspect-[16/10]"
        >
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
          <p
            className={`tabular absolute left-2.5 top-2.5 bg-screen/85 px-2 py-1 text-xs ${evt === "crash" ? "text-[#f0846e]" : evt === "parked" ? "text-ch4" : "text-dim"}`}
            aria-live="polite"
          >
            {evt === "crash" ? c.crash : evt === "parked" ? c.parked : c.status(st)}
          </p>
          <p className="absolute bottom-2.5 left-2.5 hidden bg-screen/85 px-2 py-1 text-xs text-dim [@media(pointer:fine)]:block">{c.keys}</p>
        </div>

        {/* on-screen controls: hold to drive, like the real site */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-3 gap-1.5">
            <span />
            <Hold label={c.forward} on={st.mov === "F"} press={() => send("F")} release={() => send("S")}>
              <Arrow rot={0} />
            </Hold>
            <span />
            <Hold label={c.left} on={st.dir === "L"} press={() => send("L")} release={() => send("C")}>
              <Arrow rot={-90} />
            </Hold>
            <Hold label={c.back} on={st.mov === "B"} press={() => send("B")} release={() => send("S")}>
              <Arrow rot={180} />
            </Hold>
            <Hold label={c.right} on={st.dir === "R"} press={() => send("R")} release={() => send("C")}>
              <Arrow rot={90} />
            </Hold>
          </div>
          <div className="ml-auto flex flex-col gap-2 text-sm">
            <div role="group" aria-label={c.speed} className="flex border border-rule">
              {([1, 2, 3] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={st.vel === v}
                  onClick={() => send(String(v) as Cmd)}
                  className={`px-4 py-2 font-semibold transition-colors ${st.vel === v ? "bg-ch4 text-screen" : "text-dim hover:text-ink"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={st.farol}
              onClick={() => send(st.farol ? "h" : "H")}
              className={`border px-4 py-2 transition-colors ${st.farol ? "border-ch1 bg-ch1/15 text-ink" : "border-rule text-dim hover:text-ink"}`}
            >
              {c.light}
            </button>
          </div>
        </div>
      </div>

      <div className="col-span-12 space-y-6 text-sm lg:col-span-4">
        <div>
          <p className="text-dim">{c.tx}</p>
          <p className="display mt-1 text-[clamp(2.4rem,5vw,3.6rem)] tracking-[0.08em] text-ch4 [text-shadow:0_0_24px_rgb(95_214_144/0.4)]">{tx}</p>
        </div>
        <div>
          <p className="text-dim">{c.rx}</p>
          <p className="tabular mt-1 min-h-6 break-all font-semibold tracking-[0.2em] text-ink/90" aria-live="off">
            {log.length ? log.join(" ") : "—"}
          </p>
        </div>
        <div>
          <p className="text-dim">{c.driver}</p>
          <table className="tabular mt-2 w-full text-left">
            <tbody>
              {[
                ["IN1", in1, "IN3", in3],
                ["IN2", in2, "IN4", in4],
                ["ENA", `${Math.round((ena / 255) * 100)}%`, "ENB", `${Math.round((enb / 255) * 100)}%`],
              ].map((r) => (
                <tr key={r[0] as string} className="rule-b">
                  <th scope="row" className="py-1.5 font-normal text-dim">
                    {r[0]}
                  </th>
                  <td className="py-1.5">{r[1]}</td>
                  <th scope="row" className="py-1.5 font-normal text-dim">
                    {r[2]}
                  </th>
                  <td className="py-1.5">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p className="text-dim">{c.leds}</p>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            <Led on={st.farol} color={CH.ch1} label={c.ledNames.farol} />
            <Led on={st.mov !== "F"} color="#f0846e" label={c.ledNames.freio} />
            <Led on={st.dir === "L" && blink} color={CH.copper} label={c.ledNames.esq} />
            <Led on={st.dir === "R" && blink} color={CH.copper} label={c.ledNames.dir} />
          </ul>
        </div>
        <p className="text-dim">
          {c.note}{" "}
          <Link href={`/${lang}/work/carrinho-web-bluetooth`} className="link-quiet text-ink">
            {c.see}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Hold({ label, on, press, release, children }: { label: string; on: boolean; press: () => void; release: () => void; children: ReactNode }) {
  const down = useRef(false);
  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    down.current = true;
    press();
  };
  const end = () => {
    if (!down.current) return;
    down.current = false;
    release();
  };
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onPointerDown={start}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          down.current = true;
          press();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") end();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`grid size-14 touch-none select-none place-items-center border transition-colors ${
        on ? "border-ch4 bg-ch4/20 text-ch4" : "border-rule text-dim hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const Arrow = ({ rot }: { rot: number }) => (
  <svg viewBox="0 0 24 24" className="size-6" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
    <path d="M12 4 L20 15 H14.5 V20 H9.5 V15 H4 Z" fill="currentColor" />
  </svg>
);

function Led({ on, color, label }: { on: boolean; color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden
        className="size-3 rounded-full border transition-[background-color,box-shadow] duration-100"
        style={{ borderColor: color, background: on ? color : "transparent", boxShadow: on ? `0 0 10px ${color}` : "none" }}
      />
      <span className={on ? "text-ink" : "text-dim"}>{label}</span>
    </li>
  );
}
