"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/content/types";

type Wave = "square" | "triangle" | "sine";

const M = 1024; // samples per period
const HARM = 10;
const SLEW = 0.5e6; // LM324: 0.5 V/µs
const RAIL = 12;

const copy = {
  pt: {
    wave: "Forma de onda",
    waves: { square: "Quadrada", triangle: "Triangular", sine: "Senoidal" },
    freq: "Frequência (P1)",
    sym: "Simetria (P2)",
    amp: "Amplitude (P3)",
    off: "Nível DC (P4)",
    slew: "Limitar pelo slew-rate do LM324",
    slewNote: "0,5 V/µs: em frequência alta a quadrada vira trapézio, como nas fotos do relatório.",
    fft: "FFT: harmônicas em relação à fundamental",
    thd: "THD",
    duty: "ciclo",
    model:
      "Simulação no navegador do comportamento do gerador de funções. A senoide sai de um modelo simplificado do conformador a diodos, então os números são aproximados.",
    see: "Ver o projeto real",
    clip: "saturando em ±12 V",
  },
  en: {
    wave: "Waveform",
    waves: { square: "Square", triangle: "Triangle", sine: "Sine" },
    freq: "Frequency (P1)",
    sym: "Symmetry (P2)",
    amp: "Amplitude (P3)",
    off: "DC level (P4)",
    slew: "Limit by the LM324 slew rate",
    slewNote: "0.5 V/µs: at high frequency the square becomes a trapezoid, as in the report photos.",
    fft: "FFT: harmonics relative to the fundamental",
    thd: "THD",
    duty: "duty",
    model:
      "A browser simulation of how the function generator behaves. The sine comes from a simplified model of the diode shaper, so the numbers are approximate.",
    see: "See the real project",
    clip: "clipping at ±12 V",
  },
};

/** One steady-state period of the output, in volts. */
function synth(wave: Wave, f: number, sym: number, amp: number, off: number, slew: boolean) {
  const T = 1 / f;
  const dt = T / M;
  const base = new Float32Array(M);
  for (let i = 0; i < M; i++) {
    const ph = i / M;
    // triangle: rises during `sym` of the period, falls during the rest
    const tri = ph < sym ? -1 + (2 * ph) / sym : 1 - (2 * (ph - sym)) / (1 - sym);
    let w: number;
    if (wave === "square") w = ph < sym ? 1 : -1;
    else if (wave === "triangle") w = tri;
    else w = Math.tanh(1.55 * tri) / Math.tanh(1.55);
    base[i] = Math.max(-RAIL, Math.min(RAIL, amp * w + off));
  }
  if (!slew) return base;
  // run three periods through a slew limiter and keep the last (steady state)
  const out = new Float32Array(M);
  const maxStep = SLEW * dt;
  let v = base[0];
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < M; i++) {
      const d = base[i] - v;
      v += Math.abs(d) > maxStep ? Math.sign(d) * maxStep : d;
      if (k === 2) out[i] = v;
    }
  }
  return out;
}

/** Amplitude of harmonics 1..HARM (exact bins, since we hold one period). */
function harmonics(x: Float32Array) {
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  const out: number[] = [];
  for (let n = 1; n <= HARM; n++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < x.length; i++) {
      const a = (2 * Math.PI * n * i) / x.length;
      re += (x[i] - mean) * Math.cos(a);
      im -= (x[i] - mean) * Math.sin(a);
    }
    out.push((2 / x.length) * Math.hypot(re, im));
  }
  return out;
}

const fmtNum = (v: number, lang: Locale, d = 2) =>
  v.toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export function LabGenerator({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const [wave, setWave] = useState<Wave>("sine");
  const [fk, setFk] = useState(2.4); // kHz
  const [sym, setSym] = useState(50); // %
  const [amp, setAmp] = useState(3);
  const [off, setOff] = useState(0);
  const [slew, setSlew] = useState(true);

  const f = fk * 1000;
  const sig = useMemo(() => synth(wave, f, sym / 100, amp, off, slew), [wave, f, sym, amp, off, slew]);
  const h = useMemo(() => harmonics(sig), [sig]);
  const thd = h[0] > 1e-6 ? (Math.sqrt(h.slice(1).reduce((a, v) => a + v * v, 0)) / h[0]) * 100 : 0;
  const vmax = Math.max(...sig);
  const vmin = Math.min(...sig);
  const clipping = Math.abs(amp) + Math.abs(off) > RAIL;

  // scope scale: 8 vertical divisions, choose 1/2/5 V/div to fit
  const span = Math.max(Math.abs(vmax), Math.abs(vmin), 0.01);
  const vdiv = [0.5, 1, 2, 5].find((v) => v * 4 >= span * 1.05) ?? 5;
  const T = 1 / f;
  const tdivUs = ((2.5 * T) / 10) * 1e6;

  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    const g = cv.getContext("2d")!;
    g.scale(dpr, dpr);
    g.clearRect(0, 0, W, H);
    g.strokeStyle = "#262c32";
    g.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = Math.round((i * W) / 10) + 0.5;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, H);
      g.stroke();
    }
    for (let j = 0; j <= 8; j++) {
      const y = Math.round((j * H) / 8) + 0.5;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W, y);
      g.stroke();
    }
    g.strokeStyle = "#343b42";
    for (let i = 0; i <= 50; i++) {
      const x = Math.round((i * W) / 50) + 0.5;
      g.beginPath();
      g.moveTo(x, H / 2 - 4);
      g.lineTo(x, H / 2 + 4);
      g.stroke();
    }
    // trace: 2.5 periods across the screen
    g.strokeStyle = "#e8d44d";
    g.lineWidth = 1.75;
    g.shadowColor = "rgba(232,212,77,0.45)";
    g.shadowBlur = 6;
    g.beginPath();
    const pts = 900;
    for (let k = 0; k <= pts; k++) {
      const ph = (k / pts) * 2.5;
      const idx = Math.floor((ph % 1) * M);
      const v = sig[idx];
      const x = (k / pts) * W;
      const y = H / 2 - (v / (vdiv * 4)) * (H / 2);
      if (k === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }, [sig, vdiv]);

  const db = h.map((v) => (h[0] > 0 && v > 0 ? 20 * Math.log10(v / h[0]) : -80));

  return (
    <div className="col-span-12 mt-10 grid grid-cols-12 gap-x-[var(--gutter)] gap-y-10 md:col-span-11 md:col-start-2">
      <form className="col-span-12 space-y-7 text-sm lg:col-span-4" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="text-dim">{c.wave}</legend>
          <div className="mt-2 flex border border-rule">
            {(["square", "triangle", "sine"] as Wave[]).map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={wave === w}
                onClick={() => setWave(w)}
                className={`flex-1 px-3 py-2 transition-colors ${wave === w ? "bg-ink text-screen" : "text-dim hover:text-ink"}`}
              >
                {c.waves[w]}
              </button>
            ))}
          </div>
        </fieldset>
        <Slider label={c.freq} value={fk} min={0.9} max={12} step={0.05} onChange={setFk} out={`${fmtNum(fk, lang)} kHz`} />
        <Slider label={c.sym} value={sym} min={10} max={90} step={1} onChange={setSym} out={`${sym} % ${c.duty}`} />
        <Slider label={c.amp} value={amp} min={0} max={6} step={0.05} onChange={setAmp} out={`${fmtNum(amp, lang)} V`} />
        <Slider label={c.off} value={off} min={-5} max={5} step={0.05} onChange={setOff} out={`${fmtNum(off, lang)} V`} />
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={slew}
            onChange={(e) => setSlew(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--color-ch1)]"
          />
          <span>
            {c.slew}
            <span className="mt-1 block text-dim">{c.slewNote}</span>
          </span>
        </label>
      </form>

      <div className="col-span-12 lg:col-span-8">
        <div className="relative aspect-[10/8] w-full border border-graticule bg-[#0b0e10]">
          <canvas
            ref={canvas}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`${c.waves[wave]}, ${fmtNum(fk, lang)} kHz, ${fmtNum(vmax - vmin, lang)} V pp`}
          />
          <p className="tabular absolute bottom-2 left-3 text-xs text-dim">
            CH1 {fmtNum(vdiv, lang, vdiv < 1 ? 1 : 0)} V/div · {fmtNum(tdivUs, lang, tdivUs < 10 ? 1 : 0)} µs/div
          </p>
          <p className="tabular absolute bottom-2 right-3 text-right text-xs text-ink">
            {fmtNum(f / 1000, lang)} kHz · {fmtNum(vmax - vmin, lang)} Vpp
            {clipping && <span className="block text-danger">{c.clip}</span>}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between text-sm">
            <p className="text-dim">{c.fft}</p>
            <p className="tabular">
              {c.thd} <span className="text-ch1">{fmtNum(thd, lang, 1)} %</span>
            </p>
          </div>
          <svg viewBox="0 0 400 110" className="mt-3 h-28 w-full" role="img" aria-label={`${c.thd} ${fmtNum(thd, lang, 1)} %`}>
            {[0, -20, -40, -60].map((d) => (
              <g key={d}>
                <line x1="24" x2="400" y1={8 + (-d / 60) * 84} y2={8 + (-d / 60) * 84} stroke="#262c32" />
                <text x="20" y={11 + (-d / 60) * 84} textAnchor="end" fontSize="8" fill="#8b939a">
                  {d}
                </text>
              </g>
            ))}
            {db.map((d, i) => {
              const x = 30 + i * 37;
              const hgt = Math.max(0, ((Math.max(d, -60) + 60) / 60) * 84);
              return (
                <g key={i}>
                  <rect x={x} y={92 - hgt} width="22" height={hgt} rx="1.5" fill={i === 0 ? "#e8d44d" : "#8b939a"} />
                  <text x={x + 11} y="104" textAnchor="middle" fontSize="8" fill="#8b939a">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <p className="measure mt-6 text-sm text-dim">
          {c.model}{" "}
          <Link href={`/${lang}/work/gerador-de-funcoes`} className="link-quiet text-ink">
            {c.see}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  out,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  out: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between">
        <span className="text-dim">{label}</span>
        <output className="tabular text-ink">{out}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-2 w-full"
      />
    </label>
  );
}
