"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { ScopeTrace } from "./scope-trace";

type Waterfall = ComponentType<{ onReady?: () => void }>;

function canUse3D() {
  if (prefersReducedMotion()) return false;
  if (!window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Server-renders the 2D scope (fast, works everywhere). On desktops with
 * WebGL and motion allowed, the 3D waterfall is downloaded after load and
 * cross-fades in on its first frame; the 2D trace then fades out.
 */
export function HeroScope({ className = "" }: { className?: string }) {
  const [Waterfall, setWaterfall] = useState<Waterfall | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  // Once the 3D view has faded in, drop the 2D loop entirely.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setDone(true), 1000);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (!canUse3D()) return;
    let cancelled = false;
    const load = () =>
      import("./scope-waterfall").then((m) => {
        if (!cancelled) setWaterfall(() => m.ScopeWaterfall);
      });
    // Don't compete with the first paint.
    const idle = typeof window.requestIdleCallback === "function";
    const id = idle ? window.requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 600);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id as number);
      else clearTimeout(id);
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className={className}>
      {!done && (
        <div
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-out-expo)] ${ready ? "opacity-0" : "opacity-100"}`}
        >
          <ScopeTrace className="absolute inset-0" />
        </div>
      )}
      {Waterfall && (
        <div
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-out-expo)] ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <Waterfall onReady={onReady} />
        </div>
      )}
    </div>
  );
}
