import type { CSSProperties } from "react";
import type { Locale } from "@/content/types";
import { cssVar, type Channel } from "@/lib/accent";
import { CountUp } from "./count-up";
import { Photo } from "./photo";

type Stat = { value: number; decimals?: number; suffix?: string; label: string; ch: Channel };

/** Full-bleed band of light waves with the numbers that sum the work up. */
export function StatsBand({ lang, projects }: { lang: Locale; projects: number }) {
  const pt = lang === "pt";
  const stats: Stat[] = [
    { value: 2, suffix: "º", label: pt ? "lugar em Ciências da Computação na 41ª MOSTRATEC-Liberato" : "place in Computer Science at the 41st MOSTRATEC-Liberato", ch: "ch1" },
    { value: projects, label: pt ? "projetos documentados, do circuito ao código" : "documented projects, from circuit to code", ch: "ch2" },
    { value: 121, suffix: " kHz", label: pt ? "frequência máxima medida no gerador de funções" : "highest frequency measured on the function generator", ch: "ch3" },
    { value: 0.59, decimals: 2, suffix: " %", label: pt ? "de incerteza no condicionador de termopar (a meta era 2 %)" : "uncertainty in the thermocouple conditioner (the target was 2 %)", ch: "ch4" },
  ];
  return (
    <section aria-label={pt ? "Em números" : "In numbers"} className="relative isolate overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div data-parallax="0.18" className="absolute inset-x-0 -inset-y-[18%]">
          <Photo name="lightWaves" lang={lang} sizes="100vw" className="h-full w-full object-cover opacity-70" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-screen via-screen/55 to-screen" />
      </div>
      <dl className="grid-frame gap-y-12">
        {stats.map((s, i) => (
          <div
            key={s.label}
            data-reveal
            style={{ "--d": `${i * 90}ms`, borderColor: cssVar(s.ch) } as CSSProperties}
            className="col-span-6 border-t-2 pt-4 lg:col-span-3"
          >
            <dd className="display text-[clamp(2.6rem,6vw,5rem)] [font-stretch:80%]" style={{ color: cssVar(s.ch), textShadow: `0 0 28px color-mix(in oklab, ${cssVar(s.ch)} 45%, transparent)` }}>
              <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} lang={lang} />
            </dd>
            <dt className="measure mt-3 max-w-[22ch] text-sm text-ink/85">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
