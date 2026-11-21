"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/content/types";
import { CH } from "@/lib/accent";

// Same letters and PWM values as firmware/carrinho_web.ino
type Mov = "F" | "B" | "S";
type Dir = "L" | "R" | "C";
type Cmd = Mov | Dir | "1" | "2" | "3" | "H" | "h";
const VEL_FRENTE = [140, 190, 255];
const VEL_RE = 170;
const VEL_DIRECAO = 200;
const TEMPO_PISCA = 400; // ms

type State = { mov: Mov; vel: 1 | 2 | 3; dir: Dir; farol: boolean };

const copy = {
  pt: {
    forward: "Frente",
    back: "Ré",
    left: "Esquerda",
    right: "Direita",
    speed: "Velocidade",
    light: "Farol",
    keys: "Clique na pista e use as setas ou WASD, 1/2/3 e H.",
    tx: "Estado que o ESP32 devolve (TX)",
    rx: "Letras enviadas ao ESP32 (RX)",
    driver: "Ponte H L298N",
    leds: "LEDs",
    ledNames: { farol: "farol", esq: "pisca esq.", dir: "pisca dir.", freio: "freio" },
    status: (s: State) => (s.mov === "F" ? `Andando para frente na velocidade ${s.vel}` : s.mov === "B" ? "Dando ré" : "Parado, com freio"),
    note: "Simulação no navegador com o mesmo protocolo e os mesmos valores de PWM do firmware do carrinho. Ao sair da página ou trocar de aba, ele para, como o real.",
    see: "Ver o projeto real",
    arena: "Pista do carrinho simulado",
  },
  en: {
    forward: "Forward",
    back: "Reverse",
    left: "Left",
    right: "Right",
    speed: "Speed",
    light: "Headlight",
    keys: "Click the track, then use the arrows or WASD, 1/2/3 and H.",
    tx: "State the ESP32 sends back (TX)",
    rx: "Letters sent to the ESP32 (RX)",
    driver: "L298N H-bridge",
    leds: "LEDs",
    ledNames: { farol: "headlight", esq: "left blink", dir: "right blink", freio: "brake" },
    status: (s: State) => (s.mov === "F" ? `Driving forward at speed ${s.vel}` : s.mov === "B" ? "Reversing" : "Stopped, braking"),
    note: "A browser simulation using the same protocol and PWM values as the car's firmware. Leaving the page or switching tabs stops it, like the real one.",
    see: "See the real project",
    arena: "Simulated car track",
  },
};

const KEY_MOV: Record<string, "F" | "B"> = { ArrowUp: "F", w: "F", W: "F", ArrowDown: "B", s: "B", S: "B" };
const KEY_DIR: Record<string, "L" | "R"> = { ArrowLeft: "L", a: "L", A: "L", ArrowRight: "R", d: "R", D: "R" };

export function LabCar({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const [st, setSt] = useState<State>({ mov: "S", vel: 1, dir: "C", farol: false });
  const [log, setLog] = useState<string[]>([]);
  const [blink, setBlink] = useState(false);
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

  // Car physics + drawing
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const g = cv.getContext("2d")!;
    const car = { x: 0.5, y: 0.62, h: -Math.PI / 2, v: 0, steer: 0 };
    const trail: { x: number; y: number }[] = [];
    let raf = 0;
    let last = performance.now();
    let blinkOn = false;
    let blinkT = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = stRef.current;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      if (cv.width !== Math.round(W * devicePixelRatio)) {
        cv.width = Math.round(W * devicePixelRatio);
        cv.height = Math.round(H * devicePixelRatio);
      }
      g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      // duty cycle → target speed (fraction of the track per second)
      const duty = s.mov === "F" ? VEL_FRENTE[s.vel - 1] / 255 : s.mov === "B" ? -VEL_RE / 255 : 0;
      const target = duty * 0.32;
      const k = s.mov === "S" ? 9 : 2.5; // the L298N brake stops it faster than coasting
      car.v += (target - car.v) * Math.min(1, dt * k);
      const steerTarget = s.dir === "L" ? -0.45 : s.dir === "R" ? 0.45 : 0;
      car.steer += (steerTarget - car.steer) * Math.min(1, dt * 8);
      car.h += (car.v / 0.08) * Math.tan(car.steer) * dt;
      car.x += Math.cos(car.h) * car.v * dt * (H / W);
      car.y += Math.sin(car.h) * car.v * dt;
      car.x = (car.x + 1) % 1;
      car.y = (car.y + 1) % 1;
      if (Math.abs(car.v) > 0.01) {
        trail.push({ x: car.x, y: car.y });
        if (trail.length > 240) trail.shift();
      }
      blinkT += dt * 1000;
      if (blinkT >= TEMPO_PISCA) {
        blinkT = 0;
        blinkOn = !blinkOn;
      }

      // floor
      g.clearRect(0, 0, W, H);
      g.strokeStyle = "#1d2328";
      g.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < W; x += step) {
        g.beginPath();
        g.moveTo(x + 0.5, 0);
        g.lineTo(x + 0.5, H);
        g.stroke();
      }
      for (let y = 0; y < H; y += step) {
        g.beginPath();
        g.moveTo(0, y + 0.5);
        g.lineTo(W, y + 0.5);
        g.stroke();
      }
      // trail
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        if (Math.abs(a.x - b.x) > 0.5 || Math.abs(a.y - b.y) > 0.5) continue;
        g.strokeStyle = `rgba(95, 214, 144, ${(i / trail.length) * 0.5})`;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(a.x * W, a.y * H);
        g.lineTo(b.x * W, b.y * H);
        g.stroke();
      }

      // car (top view): 44 × 26 px body
      g.save();
      g.translate(car.x * W, car.y * H);
      g.rotate(car.h);
      const L = 46;
      const Wd = 26;
      if (s.farol) {
        const beam = g.createLinearGradient(L / 2, 0, L / 2 + 120, 0);
        beam.addColorStop(0, "rgba(232,212,77,0.45)");
        beam.addColorStop(1, "rgba(232,212,77,0)");
        g.fillStyle = beam;
        g.beginPath();
        g.moveTo(L / 2, -Wd / 2 + 3);
        g.lineTo(L / 2 + 120, -Wd / 2 - 34);
        g.lineTo(L / 2 + 120, Wd / 2 + 34);
        g.lineTo(L / 2, Wd / 2 - 3);
        g.closePath();
        g.fill();
      }
      // wheels
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
      // body
      g.fillStyle = "#e6e8e3";
      g.beginPath();
      g.roundRect(-L / 2, -Wd / 2 + 2, L, Wd - 4, 6);
      g.fill();
      g.fillStyle = "#151a1e";
      g.fillRect(-6, -Wd / 2 + 6, 16, Wd - 12);
      // lights
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

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard, only while the track has focus (so arrows still scroll the page elsewhere).
  const held = useRef<{ mov: string | null; dir: string | null }>({ mov: null, dir: null });
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.repeat) return;
    if (KEY_MOV[e.key]) {
      e.preventDefault();
      held.current.mov = e.key;
      send(KEY_MOV[e.key]);
    } else if (KEY_DIR[e.key]) {
      e.preventDefault();
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
    <div className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-8">
      <div className="col-span-12 lg:col-span-8">
        <div
          ref={box}
          tabIndex={0}
          role="application"
          aria-label={`${c.arena}. ${c.keys}`}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onBlur={() => {
            // keys held when focus leaves will never fire keyup: release them
            if (held.current.mov) send("S");
            if (held.current.dir) send("C");
            held.current = { mov: null, dir: null };
          }}
          className="relative aspect-[4/3] w-full overflow-hidden border border-graticule bg-[#0b0e10] outline-offset-2 focus-visible:outline-2 focus-visible:outline-ch4 sm:aspect-[16/10]"
        >
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
          <p className="tabular absolute left-3 top-3 text-xs text-dim">{c.status(st)}</p>
          <p className="absolute bottom-3 left-3 hidden text-xs text-dim [@media(pointer:fine)]:block">{c.keys}</p>
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
