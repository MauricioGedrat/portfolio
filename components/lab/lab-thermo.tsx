"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/content/types";
import { CH } from "@/lib/accent";

// NIST ITS-90 type K reference polynomials (EMF in mV, t in °C)
const POS = [
  -0.17600413686e-1, 0.38921204975e-1, 0.18558770032e-4, -0.99457592874e-7, 0.31840945719e-9, -0.56072844889e-12,
  0.56075059059e-15, -0.3202072e-18, 0.97151147152e-22, -0.12104721275e-25,
];
const NEG = [
  0, 0.3945012825e-1, 0.23622373598e-4, -0.32858906784e-6, -0.49904828777e-8, -0.67509059173e-10, -0.57410327428e-12,
  -0.31088872894e-14, -0.10451609365e-16, -0.19889266878e-19, -0.16322697486e-22,
];
function emfK(t: number) {
  if (t >= 0) {
    let e = 0;
    POS.forEach((c, i) => (e += c * t ** i));
    return e + 0.118597600000 * Math.exp(-0.1183432e-3 * (t - 126.9686) ** 2);
  }
  let e = 0;
  NEG.forEach((c, i) => (e += c * t ** i));
  return e;
}

// Project values (report): −10…120 °C → 0…1.300 V, INA128 with RG = 249 Ω
const T_MIN = -10;
const T_MAX = 120;
const G = 1 + 50_000 / 249; // INA128 gain ≈ 201.8
const SPAN_MV = emfK(T_MAX) - emfK(T_MIN); // 5.312 mV
const SEEBECK = SPAN_MV / (T_MAX - T_MIN); // ≈ 40.86 µV/°C, used to scale the LM35
const K_OUT = 1.3 / (G * SPAN_MV * 1e-3); // TL071 stage gain to land on 10 mV/°C
const V_ZERO = G * emfK(T_MIN) * 1e-3; // what the INA shows at −10 °C

function chain(th: number, tc: number) {
  const vtc = emfK(th) - emfK(tc); // what the wires actually deliver (mV)
  const vina = (G * vtc) / 1000; // INA128 output (V)
  const vlm35 = 10 * tc; // LM35: 10 mV/°C (mV)
  const comp = (G * SEEBECK * tc) / 1000; // TL071 adds the LM35 reading scaled to the INA side (V)
  const vout = (vina + comp - V_ZERO) * K_OUT; // TL071 also trims zero and gain (V)
  const tread = vout / 0.01 + T_MIN; // °C read on the meter
  return { vtc, vina, vlm35, comp, vout, tread, err: tread - th };
}

const fmt = (v: number, lang: Locale, d: number) =>
  v.toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const copy = {
  pt: {
    hot: "Ponta do termopar (junta quente)",
    cold: "Ambiente (junta fria, medida pelo LM35)",
    blocks: ["Termopar K", "INA128", "LM35", "TL071", "Saída"],
    sub: ["diferença de temperatura", `ganho ${fmt(G, "pt", 1)}`, "junta fria", "compensação, zero e ganho", "10 mV/°C"],
    read: "Leitura no multímetro",
    error: "Erro",
    limit: "limite do projeto: 2 % da faixa = 2,6 °C",
    curve: "Saída × temperatura: o ideal (reta) e o calculado (pontos)",
    note: "Modelo com a tabela NIST do termopar tipo K e os valores do projeto (ganho de 201,8 no INA128, saída de 0 a 1,300 V). O erro que aparece vem da curvatura do termopar e da compensação linear da junta fria; a incerteza dos componentes (0,59 % no projeto) não está incluída.",
    see: "Ver o projeto real",
  },
  en: {
    hot: "Thermocouple tip (hot junction)",
    cold: "Ambient (cold junction, read by the LM35)",
    blocks: ["Type K", "INA128", "LM35", "TL071", "Output"],
    sub: ["temperature difference", `gain ${fmt(G, "en", 1)}`, "cold junction", "compensation, zero and gain", "10 mV/°C"],
    read: "Meter reading",
    error: "Error",
    limit: "project limit: 2 % of span = 2.6 °C",
    curve: "Output vs temperature: ideal (line) and computed (dots)",
    note: "Model using the NIST type K table and the project values (INA128 gain of 201.8, 0 to 1.300 V output). The error shown comes from the thermocouple's curvature and the linear cold-junction compensation; component uncertainty (0.59 % in the project) is not included.",
    see: "See the real project",
  },
};

export function LabThermo({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const [th, setTh] = useState(75);
  const [tc, setTc] = useState(25);
  const r = useMemo(() => chain(th, tc), [th, tc]);

  const values = [
    `${fmt(r.vtc, lang, 3)} mV`,
    `${fmt(r.vina, lang, 3)} V`,
    `${fmt(r.vlm35, lang, 0)} mV`,
    `${fmt(r.vout, lang, 3)} V`,
    `${fmt(r.tread, lang, 1)} °C`,
  ];

  // curve: sample the whole range for the current ambient
  const pts = useMemo(() => {
    const out: { t: number; v: number }[] = [];
    for (let t = T_MIN; t <= T_MAX; t += 5) out.push({ t, v: chain(t, tc).vout });
    return out;
  }, [tc]);
  const X = (t: number) => 30 + ((t - T_MIN) / (T_MAX - T_MIN)) * 360;
  const Y = (v: number) => 150 - (v / 1.4) * 135;

  const errAbs = Math.abs(r.err);
  const errColor = errAbs < 1 ? CH.ch4 : errAbs < 2.6 ? CH.ch1 : "#f0846e";

  return (
    <div className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-10">
      <div className="col-span-12 space-y-7 text-sm lg:col-span-4">
        <Range label={c.hot} value={th} min={T_MIN} max={T_MAX} onChange={setTh} out={`${fmt(th, lang, 0)} °C`} />
        <Range label={c.cold} value={tc} min={0} max={45} onChange={setTc} out={`${fmt(tc, lang, 0)} °C`} />
        <div className="border-t border-graticule pt-5">
          <p className="text-dim">{c.read}</p>
          <p className="display mt-1 text-[clamp(2.6rem,5vw,3.8rem)] text-copper [font-stretch:80%] [text-shadow:0_0_24px_rgb(236_154_95/0.4)]">
            {fmt(r.tread, lang, 1)} °C
          </p>
          <p className="mt-2">
            {c.error}{" "}
            <span className="tabular font-semibold" style={{ color: errColor }}>
              {r.err >= 0 ? "+" : ""}
              {fmt(r.err, lang, 2)} °C
            </span>
          </p>
          <p className="mt-1 text-xs text-dim">{c.limit}</p>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8">
        {/* the signal, block by block */}
        <ol className="grid grid-cols-2 gap-px bg-graticule sm:grid-cols-5">
          {c.blocks.map((b, i) => (
            <li key={b} className="relative bg-screen p-4 last:col-span-2 sm:last:col-span-1">
              <span aria-hidden className="bg-accent absolute inset-x-0 top-0 h-0.5" style={{ opacity: 0.35 + (i / 4) * 0.65 }} />
              <p className="tabular text-xs text-dim">{String(i + 1).padStart(2, "0")}</p>
              <p className="condensed mt-3 font-semibold leading-tight">{b}</p>
              <p className="text-xs text-dim">{c.sub[i]}</p>
              <p className="tabular text-accent mt-3 text-base font-semibold">{values[i]}</p>
            </li>
          ))}
        </ol>

        <figure className="mt-6">
          <svg viewBox="0 0 400 170" className="h-auto w-full max-w-[600px]" role="img" aria-label={c.curve}>
            {[0, 0.4, 0.8, 1.2].map((v) => (
              <g key={v}>
                <line x1="30" x2="390" y1={Y(v)} y2={Y(v)} stroke="#262c32" />
                <text x="26" y={Y(v) + 4} textAnchor="end" fontSize="11" fill="#8b939a">
                  {fmt(v, lang, 1)} V
                </text>
              </g>
            ))}
            {[-10, 20, 50, 80, 110].map((t) => (
              <text key={t} x={X(t)} y="168" textAnchor="middle" fontSize="11" fill="#8b939a">
                {String(t).replace("-", "−")} °C
              </text>
            ))}
            <line x1={X(T_MIN)} y1={Y(0)} x2={X(T_MAX)} y2={Y(1.3)} stroke="#8b939a" strokeDasharray="3 3" />
            {pts.map((p) => (
              <circle key={p.t} cx={X(p.t)} cy={Y(p.v)} r="2.2" fill={CH.copper} fillOpacity="0.8" />
            ))}
            <line x1={X(th)} x2={X(th)} y1={Y(0)} y2={Y(r.vout)} stroke={CH.copper} strokeOpacity="0.5" />
            <circle cx={X(th)} cy={Y(r.vout)} r="5" fill="none" stroke={CH.copper} strokeWidth="2" />
          </svg>
          <figcaption className="mt-1 text-xs text-dim">{c.curve}</figcaption>
        </figure>

        <p className="measure mt-6 text-sm text-dim">
          {c.note}{" "}
          <Link href={`/${lang}/work/condicionador-termopar-k`} className="link-quiet text-ink">
            {c.see}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
  out,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  out: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3">
        <span className="text-dim">{label}</span>
        <output className="tabular shrink-0 text-ink">{out}</output>
      </span>
      <input type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="range mt-2 w-full" />
    </label>
  );
}
