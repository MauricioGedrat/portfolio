"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/types";
import { prefersReducedMotion } from "@/lib/motion";

/** A number that counts up from zero the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, lang, suffix = "" }: { value: number; decimals?: number; lang: Locale; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen: leave it
    setN(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const run = (now: number) => {
          const t = Math.min((now - t0) / 1400, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          setN(value * eased);
          if (t < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  const text = n.toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className="tabular">
      {text}
      {suffix}
    </span>
  );
}
