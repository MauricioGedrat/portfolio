"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

/**
 * Switches on every [data-reveal] element the first time it scrolls into view.
 * One observer for the whole page; new elements (client navigation) are picked
 * up by a MutationObserver. The inline script in the layout hides elements only
 * after it sets html.js-reveal, and removes that class if this never runs.
 */
export function RevealObserver() {
  useEffect(() => {
    window.__revealReady = true;
    const root = document.documentElement;

    // A fully clipped element never "intersects", so wipe targets are
    // triggered by their parent instead. trigger → elements it switches on.
    const targets = new Map<Element, Set<Element>>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          targets.get(entry.target)?.forEach((el) => el.setAttribute("data-shown", ""));
          targets.delete(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    const watch = (el: Element) => {
      const trigger = el.getAttribute("data-reveal") === "clip" ? (el.parentElement ?? el) : el;
      const set = targets.get(trigger) ?? new Set<Element>();
      set.add(el);
      targets.set(trigger, set);
      io.observe(trigger);
    };

    const scan = (scope: ParentNode) => {
      scope.querySelectorAll("[data-reveal]:not([data-shown])").forEach(watch);
    };
    scan(document);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches("[data-reveal]:not([data-shown])")) watch(n);
          scan(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // If the page was restored scrolled down (back/forward), show what's above too.
    const showAbove = () => {
      document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => {
        if (el.getBoundingClientRect().bottom < 0) {
          el.setAttribute("data-shown", "");
        }
      });
    };
    showAbove();
    root.classList.add("js-reveal");

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
