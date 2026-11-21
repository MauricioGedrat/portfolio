"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Same coordinate space as the plate image (912 × 512), traced from its copper line.
const W = 912;
const H = 512;
const TRACE = "M0 293 L284 293 L366 229 L522 226 L654 120 L912 111";

const TRAVEL_MS = 2600; // pulse crosses the board
const REST_MS = 1800; // dark pause before the next one
const TRAIL = 120; // trail length in plate pixels

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Decorative backdrop: a still macro of a circuit board (AI-generated plate)
 * with a signal pulse drawn in code along one copper trace. The plate stays still; only the pulse moves.
 * Pauses off-screen; with reduced motion the pulse is not drawn.
 */
export function PcbPulse({ className = "", children }: { className?: string; children?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = box.current;
    const path = trail.current;
    const dot = head.current;
    if (!el || !path || !dot || prefersReducedMotion()) return;

    const len = path.getTotalLength();
    let raf = 0;
    let start = 0;
    let visible = false;

    const frame = (now: number) => {
      if (!start) start = now;
      const t = (now - start) % (TRAVEL_MS + REST_MS);
      const moving = t < TRAVEL_MS;
      const s = moving ? easeInOut(t / TRAVEL_MS) * (len + TRAIL) : len + TRAIL;
      const at = Math.min(s, len);
      const p = path.getPointAtLength(at);

      // Head fades out as it leaves the right edge.
      const fade = moving ? Math.min(1, (len + TRAIL - s) / TRAIL) : 0;
      dot.setAttribute("transform", `translate(${p.x} ${p.y})`);
      dot.style.opacity = String(s > len ? 0 : fade);

      // Dash trick: a visible dash of TRAIL length ending at the head.
      path.style.strokeDasharray = `${TRAIL} ${len + TRAIL}`;
      path.style.strokeDashoffset = String(TRAIL - s);
      path.style.opacity = String(fade);

      if (visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={box} aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      <img
        src="/media/pcb-plate.webp"
        srcSet="/media/pcb-plate.webp 912w, /media/pcb-plate@2x.webp 1824w"
        sizes="100vw"
        width={W}
        height={H}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full mix-blend-screen"
      >
        <defs>
          <filter id="pcb-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="pcb-head">
            <stop offset="0" stopColor="#fffbe0" />
            <stop offset="0.35" stopColor="#e8d44d" />
            <stop offset="1" stopColor="#e8d44d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          ref={trail}
          d={TRACE}
          fill="none"
          stroke="#e8d44d"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pcb-glow)"
          style={{ opacity: 0 }}
        />
        <g ref={head} style={{ opacity: 0 }}>
          <circle r="26" fill="url(#pcb-head)" opacity="0.55" />
          <circle r="5" fill="#fffbe0" />
        </g>
      </svg>
      {children}
    </div>
  );
}
