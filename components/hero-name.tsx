"use client";

import { useEffect, useRef } from "react";
import { damp, prefersReducedMotion } from "@/lib/motion";

/**
 * The name, set in Archivo's width axis. It widens as the pointer moves
 * right and condenses to the left — the same input that drives the scope's
 * frequency, so type and signal answer the visitor together.
 */
export function HeroName({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;

    let target = 100;
    let current = 100;
    let raf = 0;
    let last = performance.now();

    const onPointer = (e: PointerEvent) => {
      target = 84 + (e.clientX / window.innerWidth) * 30; // 84% … 114%
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      current = damp(current, target, 4, dt);
      el.style.fontStretch = `${current.toFixed(2)}%`;
      raf = Math.abs(current - target) > 0.05 ? requestAnimationFrame(tick) : 0;
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <h1
      ref={ref}
      className="display text-[15.5vw] uppercase will-change-[font-stretch] md:text-[clamp(3.6rem,13.2vw,13.5rem)]"
      aria-label={lines.join(" ")}
    >
      {lines.map((line) => (
        <span key={line} aria-hidden className="block">
          {line}
        </span>
      ))}
    </h1>
  );
}
