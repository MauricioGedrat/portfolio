"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * One scroll loop for the whole page:
 * - --progress on <html>: how far down the page you are (nav sweep bar)
 * - --sv on <html>: smoothed scroll speed 0..1 (headings widen while you scroll fast)
 * - [data-parallax="0.2"]: element drifts against the scroll by that factor
 * - [data-marquee]: ticker speeds up with scroll speed
 * Runs only while something is moving, and only parallaxes what is near the viewport.
 */
export function ScrollFx() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let sv = 0;
    let target = 0;

    const tick = (now: number) => {
      raf = 0;
      const y = window.scrollY;
      const dt = Math.max(now - lastT, 1);
      const v = Math.abs(y - lastY) / dt; // px per ms
      lastY = y;
      lastT = now;

      const max = Math.max(root.scrollHeight - window.innerHeight, 1);
      root.style.setProperty("--progress", (y / max).toFixed(4));

      if (!reduced) {
        target = Math.min(v / 2.6, 1);
        sv += (target - sv) * (target > sv ? 0.35 : 0.08);
        if (sv < 0.002) sv = 0;
        root.style.setProperty("--sv", sv.toFixed(3));

        const vh = window.innerHeight;
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const box = el.parentElement?.getBoundingClientRect();
          if (!box || box.bottom < -200 || box.top > vh + 200) return;
          const k = Number(el.dataset.parallax) || 0.15;
          const off = (box.top + box.height / 2 - vh / 2) * -k;
          el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
        });

        document.querySelectorAll<HTMLElement>("[data-marquee]").forEach((el) => {
          el.getAnimations().forEach((a) => (a.playbackRate = 1 + sv * 7));
        });
      }

      // keep running while the speed is still settling
      if (sv > 0 || target > 0) raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  return null;
}
