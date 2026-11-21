"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/content/types";
import { cssVar, type Channel } from "@/lib/accent";
import { LabCar } from "./lab-car";
import { LabGenerator } from "./lab-generator";
import { LabThermo } from "./lab-thermo";

type Exp = { id: string; ch: Channel; name: Record<Locale, string>; hint: Record<Locale, string> };

const exps: Exp[] = [
  {
    id: "gerador",
    ch: "ch1",
    name: { pt: "Gerador de funções", en: "Function generator" },
    hint: { pt: "Mexa nos potenciômetros e veja a onda e as harmônicas.", en: "Turn the pots and watch the wave and its harmonics." },
  },
  {
    id: "carrinho",
    ch: "ch4",
    name: { pt: "Controle do carrinho", en: "Car remote" },
    hint: {
      pt: "Dirija pelo mesmo protocolo do site real: as letras que vão para o ESP32 e o estado que ele devolve.",
      en: "Drive with the same protocol as the real site: the letters sent to the ESP32 and the state it sends back.",
    },
  },
  {
    id: "termopar",
    ch: "copper",
    name: { pt: "Condicionador de termopar", en: "Thermocouple conditioner" },
    hint: {
      pt: "Esquente a ponta do termopar e acompanhe o sinal do milivolt até a saída de 10 mV/°C.",
      en: "Heat the thermocouple tip and follow the signal from millivolts to the 10 mV/°C output.",
    },
  },
];

/** Three small instruments, one per project, behind accessible tabs. */
export function LabTabs({ lang }: { lang: Locale }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + exps.length) % exps.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const exp = exps[active];
  return (
    <div className="col-span-12 mt-10 md:col-span-11 md:col-start-2">
      <div role="tablist" aria-label={lang === "pt" ? "Experimentos" : "Experiments"} className="flex flex-wrap gap-2" onKeyDown={onKey}>
        {exps.map((x, i) => {
          const on = i === active;
          return (
            <button
              key={x.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`lab-tab-${x.id}`}
              aria-selected={on}
              aria-controls={`lab-panel-${x.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-colors duration-[var(--dur-fast)]"
              style={{
                borderColor: on ? cssVar(x.ch) : "var(--color-rule)",
                background: on ? `color-mix(in oklab, ${cssVar(x.ch)} 14%, transparent)` : "transparent",
                color: on ? "var(--color-ink)" : "var(--color-dim)",
              }}
            >
              <span className="tabular text-xs" style={{ color: cssVar(x.ch) }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {x.name[lang]}
            </button>
          );
        })}
      </div>
      <p className="measure mt-4 text-sm text-dim">{exp.hint[lang]}</p>
      <div
        role="tabpanel"
        id={`lab-panel-${exp.id}`}
        aria-labelledby={`lab-tab-${exp.id}`}
        className="mt-8"
        style={{ "--accent": cssVar(exp.ch) } as React.CSSProperties}
      >
        {exp.id === "gerador" && <LabGenerator lang={lang} />}
        {exp.id === "carrinho" && <LabCar lang={lang} />}
        {exp.id === "termopar" && <LabThermo lang={lang} />}
      </div>
    </div>
  );
}
