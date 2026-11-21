"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Marks the row nearest the middle of the screen with data-active, so the
 * text you are reading lights up and the others step back. Rows: [data-focus-row].
 */
export function FocusRows({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rows = [...el.querySelectorAll<HTMLElement>("[data-focus-row]")];
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const r of rows) {
        const b = r.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = r;
        }
      }
      rows.forEach((r) => r.toggleAttribute("data-active", r === best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <dl ref={ref} className={className}>
      {children}
    </dl>
  );
}
