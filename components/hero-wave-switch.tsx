"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/types";
import { getWave, nextWave, onWave, setWave, waveHex, waveLabel, waves, type Wave } from "@/lib/waves";

const paths: Record<Wave, string> = {
  sine: "M1 8 C4 1, 7 1, 10 8 S16 15, 19 8",
  square: "M1 12 V4 H7 V12 H13 V4 H19",
  triangle: "M1 12 L5.5 4 L10 12 L14.5 4 L19 12",
  saw: "M1 12 L9 4 V12 L17 4 V12",
};

const names: Record<Locale, Record<Wave, string>> = {
  pt: { sine: "Senoidal", square: "Quadrada", triangle: "Triangular", saw: "Dente-de-serra" },
  en: { sine: "Sine", square: "Square", triangle: "Triangle", saw: "Sawtooth" },
};

/**
 * Picks the hero scope's waveform; each one is drawn on its own channel colour.
 * Clicking empty space in the hero also steps to the next waveform, and a
 * ring pulses out from where you clicked, like a trigger.
 */
export function HeroWaveSwitch({ lang }: { lang: Locale }) {
  const [wave, set] = useState<Wave>("sine");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    set(getWave());
    const off = onWave(set);
    const hero = ref.current?.closest("section");
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("a, button, input, textarea, select, label")) return;
      nextWave();
      if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = hero.getBoundingClientRect();
      const ring = document.createElement("span");
      ring.setAttribute("aria-hidden", "true");
      ring.className = "trigger-ring";
      ring.style.left = `${e.clientX - r.left}px`;
      ring.style.top = `${e.clientY - r.top}px`;
      ring.style.setProperty("--ring", waveHex(getWave()));
      hero.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove());
    };
    hero?.addEventListener("click", onClick);
    return () => {
      off();
      hero?.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={ref} className="mt-6 flex flex-wrap items-center gap-3 text-xs text-dim">
      <div role="group" aria-label={lang === "pt" ? "Forma de onda do osciloscópio" : "Oscilloscope waveform"} className="flex gap-1">
        {waves.map((w) => {
          const on = w === wave;
          return (
            <button
              key={w}
              type="button"
              aria-pressed={on}
              title={`${names[lang][w]} · ${waveLabel(w)}`}
              onClick={() => setWave(w)}
              className="grid size-9 place-items-center border transition-[border-color,background-color] duration-[var(--dur-fast)]"
              style={{
                borderColor: on ? waveHex(w) : "var(--color-rule)",
                background: on ? `color-mix(in oklab, ${waveHex(w)} 14%, transparent)` : "transparent",
              }}
            >
              <span className="sr-only">{names[lang][w]}</span>
              <svg viewBox="0 0 20 16" className="h-4 w-5" aria-hidden>
                <path d={paths[w]} fill="none" stroke={on ? waveHex(w) : "var(--color-dim)"} strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </button>
          );
        })}
      </div>
      <span>{lang === "pt" ? "ou clique no osciloscópio" : "or click the scope"}</span>
    </div>
  );
}
