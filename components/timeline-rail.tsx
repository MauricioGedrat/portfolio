"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A vertical rail beside the timeline. As the page scrolls, a CH1 sweep fills
 * the rail and each entry's marker lights up when the sweep reaches it.
 * Rows mark themselves with data-row; lit rows get data-lit.
 */
export function TimelineRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const bar = fill.current;
    if (!el || !bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      const p = Math.min(Math.max((mid - r.top) / Math.max(r.height, 1), 0), 1);
      bar.style.transform = `scaleY(${p})`;
      el.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
        const rr = row.getBoundingClientRect();
        if (rr.top + 28 < mid) row.setAttribute("data-lit", "");
        else row.removeAttribute("data-lit");
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <ol ref={ref} className={`relative ${className}`}>
      <div aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-graticule">
        <div ref={fill} className="h-full w-full origin-top scale-y-0 bg-ch1/70" />
      </div>
      {children}
    </ol>
  );
}
