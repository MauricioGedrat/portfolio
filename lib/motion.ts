/**
 * Motion system. Every animated value in the site comes from here, so the
 * rhythm stays consistent. Mirrors the CSS variables in globals.css.
 */
export const duration = { fast: 0.16, base: 0.32, slow: 0.7 } as const;

export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutQuart: [0.76, 0, 0.24, 1] as const,
};

/** Critically damped spring: follows the pointer without overshoot. */
export const followSpring = { stiffness: 120, damping: 22, mass: 0.6 } as const;

/** Frame-rate independent exponential smoothing (for rAF loops and 3D). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
