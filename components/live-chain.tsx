"use client";

import { useEffect, useRef, useState } from "react";
import type { ChainNode, Locale } from "@/content/types";
import { t } from "@/lib/i18n";
import { prefersReducedMotion } from "@/lib/motion";

const STEP_MS = 900;

/**
 * The system as a live signal chain: a probe dot travels along the top rail
 * and each block lights up as the signal reaches it, then the sweep restarts.
 * Hover a block to hold the probe there. Static with reduced motion.
 */
export function LiveChain({ nodes, lang }: { nodes: ChainNode[]; lang: Locale }) {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1);
  const [held, setHeld] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running || held !== null) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % (nodes.length + 1)), STEP_MS);
    return () => clearInterval(id);
  }, [running, held, nodes.length]);

  const shown = held ?? active;
  const n = nodes.length;
  // the extra step (shown === n) is the pause after the last block
  const probeX = shown < 0 ? 0 : Math.min(shown, n - 1) + 0.5;

  return (
    <div className="relative">
      <div aria-hidden className="relative mb-px hidden h-3 md:block">
        <div className="absolute inset-x-0 top-1/2 h-px bg-graticule" />
        <div
          className="bg-accent absolute top-1/2 h-px opacity-60 transition-[width] ease-linear"
          style={{ width: `${(probeX / n) * 100}%`, transitionDuration: shown === 0 ? "0ms" : `${STEP_MS}ms` }}
        />
        <div
          className="bg-accent absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_2px_var(--accent)] transition-[left,opacity] ease-linear"
          style={{
            left: `${(probeX / n) * 100}%`,
            opacity: shown < 0 || shown >= n ? 0 : 1,
            transitionDuration: shown === 0 ? "0ms" : `${STEP_MS}ms`,
          }}
        />
      </div>
      <ol ref={ref} className="grid gap-px bg-graticule md:auto-cols-fr md:grid-flow-col">
        {nodes.map((node, i) => {
          const lit = i === shown;
          const passed = shown >= 0 && i < shown;
          return (
            <li
              key={node.id}
              onMouseEnter={() => setHeld(i)}
              onMouseLeave={() => setHeld(null)}
              className="relative bg-screen p-5 md:min-h-40"
            >
              <span
                aria-hidden
                className={`bg-accent absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] ${
                  lit ? "scale-x-100" : "scale-x-0"
                }`}
              />
              <span className={`tabular text-xs transition-colors ${lit ? "text-accent" : "text-dim"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                className={`condensed mt-6 text-lg font-semibold leading-tight transition-colors duration-[var(--dur-base)] ${
                  lit || passed || shown < 0 ? "text-ink" : "text-ink/55"
                }`}
              >
                {t(node.label, lang)}
              </p>
              {node.detail && <p className="mt-1 text-sm text-dim">{t(node.detail, lang)}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
