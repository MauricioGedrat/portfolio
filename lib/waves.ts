import { CH, type Channel } from "@/lib/accent";

export const waves = ["sine", "square", "triangle", "saw"] as const;
export type Wave = (typeof waves)[number];

/** Each waveform is drawn on its own scope channel. */
export const waveChannel: Record<Wave, Channel> = { sine: "ch1", square: "ch2", triangle: "ch3", saw: "ch4" };
export const waveHex = (w: Wave) => CH[waveChannel[w]];
export const waveLabel = (w: Wave) => `CH${waves.indexOf(w) + 1}`;

/** Value in [-1, 1] at phase `p` (radians). */
export function shape(w: Wave, p: number): number {
  switch (w) {
    case "sine":
      return Math.sin(p) + 0.06 * Math.sin(3 * p);
    case "square":
      return Math.tanh(5 * Math.sin(p)) / Math.tanh(5);
    case "triangle":
      return (2 / Math.PI) * Math.asin(Math.sin(p));
    case "saw": {
      const f = p / (2 * Math.PI);
      return 2 * (f - Math.floor(f)) - 1;
    }
  }
}

// Shared hero state: the switch buttons and both scopes stay in sync.
let current: Wave = "sine";
const EVENT = "scope:wave";
export const getWave = () => current;
export function setWave(w: Wave) {
  current = w;
  window.dispatchEvent(new CustomEvent<Wave>(EVENT, { detail: w }));
}
export const nextWave = () => setWave(waves[(waves.indexOf(current) + 1) % waves.length]);
export function onWave(fn: (w: Wave) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Wave>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
