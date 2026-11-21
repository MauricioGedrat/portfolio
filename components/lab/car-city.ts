// A small night-time town for the car simulator, seen from above.
// Everything is procedural (seeded), drawn once to an offscreen canvas, and the
// obstacles below are what the car collides with.
import { CH } from "@/lib/accent";

export type Rect = { x: number; y: number; w: number; h: number };

const B = 380; // block size
const R = 100; // road width (two lanes of 50)
const SW = 14; // sidewalk
const COLS = 4;
const ROWS = 3;
export const WORLD_W = COLS * B + (COLS + 1) * R; // 2020
export const WORLD_H = ROWS * B + (ROWS + 1) * R; // 1540
const TAU = Math.PI * 2;
const bx = (c: number) => R + c * (B + R);
const by = (r: number) => R + r * (B + R);

type Kind = "city" | "park" | "school" | "lot" | "plaza";
const LAYOUT: Kind[][] = [
  ["city", "city", "school", "city"],
  ["city", "park", "lot", "city"],
  ["city", "city", "city", "plaza"],
];

/** Right-hand lane of the second avenue, heading north. */
export const START = { x: bx(0) + B + R * 0.75, y: by(2) + B * 0.55, h: -Math.PI / 2 };

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── parking lot: three rows of 8 stalls, one free spot to practise ──
const LX = bx(2);
const LY = by(1);
const STALL_W = 40;
const STALL_D = 62;
const ROW_Y = [LY + 12, LY + 168, LY + 168 + STALL_D];
const stallX = (i: number) => LX + 26 + i * STALL_W;
export const TARGET: Rect = { x: stallX(5), y: ROW_Y[1], w: STALL_W, h: STALL_D };
const CAR_COLORS = ["#5b6470", "#7a4b4b", "#3f5d7a", "#8a8f96", "#4b6b55", "#9a8657", "#2c3238", "#6d5a7a"];
const PARKED: (Rect & { color: string })[] = (() => {
  const rand = rng(42);
  const out: (Rect & { color: string })[] = [];
  ROW_Y.forEach((y, row) => {
    for (let i = 0; i < 8; i++) {
      if (row === 1 && i === 5) continue; // the free spot
      const neighbour = row === 1 && (i === 4 || i === 6);
      const color = CAR_COLORS[Math.floor(rand() * CAR_COLORS.length)];
      if (!neighbour && rand() > 0.6) continue;
      out.push({ x: stallX(i) + 8, y: y + 9, w: 24, h: 44, color });
    }
  });
  return out;
})();

// ── collisions ──
const OBST: Rect[] = [];
LAYOUT.forEach((row, r) =>
  row.forEach((kind, c) => {
    if (kind !== "lot") OBST.push({ x: bx(c) + 2, y: by(r) + 2, w: B - 4, h: B - 4 });
  }),
);
OBST.push({ x: LX, y: LY, w: B, h: 8 }, { x: LX + B - 8, y: LY, w: 8, h: B }, ...PARKED);

/** The car is two circles (front and rear axle) of radius 12. */
export function hits(x: number, y: number, h: number) {
  const r = 12;
  const ox = Math.cos(h) * 11;
  const oy = Math.sin(h) * 11;
  for (const [px, py] of [
    [x + ox, y + oy],
    [x - ox, y - oy],
  ]) {
    if (px < r || py < r || px > WORLD_W - r || py > WORLD_H - r) return true;
    for (const o of OBST) {
      const dx = Math.max(o.x - px, 0, px - (o.x + o.w));
      const dy = Math.max(o.y - py, 0, py - (o.y + o.h));
      if (dx * dx + dy * dy < r * r) return true;
    }
  }
  return false;
}

// ── drawing ──
function line(g: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function tree(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.fillStyle = "rgba(0,0,0,0.38)";
  g.beginPath();
  g.ellipse(x + r * 0.45, y + r * 0.6, r, r * 0.9, 0, 0, TAU);
  g.fill();
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  gr.addColorStop(0, "#3d8256");
  gr.addColorStop(1, "#16331f");
  g.fillStyle = gr;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
}

function roadMarks(g: CanvasRenderingContext2D) {
  g.save();
  g.strokeStyle = "rgba(232,212,77,0.42)";
  g.lineWidth = 2;
  g.setLineDash([18, 14]);
  for (let j = 0; j <= ROWS; j++) {
    const y = j * (B + R) + R / 2;
    for (let c = 0; c < COLS; c++) line(g, bx(c) + 20, y, bx(c) + B - 20, y);
  }
  for (let i = 0; i <= COLS; i++) {
    const x = i * (B + R) + R / 2;
    for (let r = 0; r < ROWS; r++) line(g, x, by(r) + 20, x, by(r) + B - 20);
  }
  g.setLineDash([]);
  // zebra crossings at every corner
  g.fillStyle = "rgba(230,232,227,0.26)";
  for (let j = 0; j <= ROWS; j++) {
    const y0 = j * (B + R);
    for (let c = 0; c < COLS; c++)
      for (const xb of [bx(c) + 2, bx(c) + B - 16]) for (let k = y0 + 10; k < y0 + R - 12; k += 11) g.fillRect(xb, k, 14, 6);
  }
  for (let i = 0; i <= COLS; i++) {
    const x0 = i * (B + R);
    for (let r = 0; r < ROWS; r++)
      for (const yb of [by(r) + 2, by(r) + B - 16]) for (let k = x0 + 10; k < x0 + R - 12; k += 11) g.fillRect(k, yb, 6, 14);
  }
  g.restore();
}

function sidewalk(g: CanvasRenderingContext2D, x: number, y: number, lamps: [number, number][]) {
  g.fillStyle = "#23292e";
  g.beginPath();
  g.roundRect(x, y, B, B, 18);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.08)";
  g.lineWidth = 1.5;
  g.beginPath();
  g.roundRect(x + 0.75, y + 0.75, B - 1.5, B - 1.5, 18);
  g.stroke();
  for (let t = 44; t < B - 30; t += 96) lamps.push([x + t, y + 4], [x + B - t, y + B - 4], [x + 4, y + B - t], [x + B - 4, y + t]);
}

function streetTrees(g: CanvasRenderingContext2D, x: number, y: number, rand: () => number) {
  for (let t = 92; t < B - 40; t += 96) {
    const spots: [number, number][] = [
      [x + t, y + 7],
      [x + B - t, y + B - 7],
      [x + 7, y + B - t],
      [x + B - 7, y + t],
    ];
    for (const [tx, ty] of spots) if (rand() < 0.75) tree(g, tx, ty, 7.5 + rand() * 2.5);
  }
}

type Bldg = Rect & { ht: number; color: string };
const ROOFS = ["#2b3239", "#323a42", "#272d33", "#3a3631", "#2f353d", "#343038"];

function roof(g: CanvasRenderingContext2D, b: Bldg, rand: () => number) {
  g.fillStyle = b.color;
  g.fillRect(b.x, b.y, b.w, b.h);
  g.fillStyle = "rgba(255,255,255,0.05)";
  g.fillRect(b.x, b.y, b.w, 2);
  g.fillRect(b.x, b.y, 2, b.h);
  g.strokeStyle = "rgba(255,255,255,0.07)";
  g.lineWidth = 2;
  g.strokeRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
  if (b.w * b.h > 9000 && rand() < 0.35) {
    // solar panels
    const cols = Math.floor((b.w - 24) / 18);
    const rows = Math.floor((b.h - 24) / 13);
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        g.fillStyle = "#1b2c42";
        g.fillRect(b.x + 12 + i * 18, b.y + 12 + j * 13, 16, 11);
        g.strokeStyle = "#2c4a6c";
        g.lineWidth = 1;
        g.strokeRect(b.x + 12.5 + i * 18, b.y + 12.5 + j * 13, 15, 10);
      }
    return;
  }
  const n = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const ax = b.x + 9 + rand() * Math.max(1, b.w - 30);
    const ay = b.y + 9 + rand() * Math.max(1, b.h - 28);
    g.fillStyle = "#47505a";
    g.fillRect(ax, ay, 13, 10);
    g.fillStyle = "#262c31";
    g.beginPath();
    g.arc(ax + 6.5, ay + 5, 3, 0, TAU);
    g.fill();
  }
  if (rand() < 0.4) {
    const w = 10 + rand() * 18;
    g.save();
    g.shadowColor = CH.ch1;
    g.shadowBlur = 12;
    g.fillStyle = "rgba(232,212,77,0.8)";
    g.fillRect(b.x + 10 + rand() * Math.max(1, b.w - w - 20), b.y + 10 + rand() * Math.max(1, b.h - 26), w, 6);
    g.restore();
  }
}

function drawBuildings(g: CanvasRenderingContext2D, list: Bldg[], rand: () => number) {
  g.fillStyle = "rgba(0,0,0,0.42)";
  for (const b of list) g.fillRect(b.x + b.ht * 0.45, b.y + b.ht * 0.65, b.w, b.h);
  for (const b of list) roof(g, b, rand);
}

function cityBlock(g: CanvasRenderingContext2D, x: number, y: number, s: number, rand: () => number) {
  g.fillStyle = "#1a1e22";
  g.fillRect(x, y, s, s);
  const sx = s * (0.38 + rand() * 0.24);
  const sy = s * (0.38 + rand() * 0.24);
  const cells: Rect[] = [
    { x, y, w: sx, h: sy },
    { x: x + sx, y, w: s - sx, h: sy },
    { x, y: y + sy, w: sx, h: s - sy },
    { x: x + sx, y: y + sy, w: s - sx, h: s - sy },
  ];
  const list: Bldg[] = [];
  const mk = (v: Rect): Bldg => ({ ...v, ht: 8 + rand() * 22, color: ROOFS[Math.floor(rand() * ROOFS.length)] });
  for (const cell of cells) {
    const c = { x: cell.x + 6, y: cell.y + 6, w: cell.w - 12, h: cell.h - 12 };
    if (rand() < 0.16) {
      g.fillStyle = "#14251a";
      g.fillRect(c.x, c.y, c.w, c.h);
      const n = 2 + Math.floor(rand() * 3);
      for (let i = 0; i < n; i++) tree(g, c.x + 14 + rand() * (c.w - 28), c.y + 14 + rand() * (c.h - 28), 9 + rand() * 6);
      continue;
    }
    if (rand() < 0.3) {
      const k = 0.45 + rand() * 0.1;
      if (c.w > c.h) {
        list.push(mk({ x: c.x, y: c.y, w: c.w * k - 3, h: c.h }), mk({ x: c.x + c.w * k + 3, y: c.y, w: c.w * (1 - k) - 3, h: c.h }));
      } else {
        list.push(mk({ x: c.x, y: c.y, w: c.w, h: c.h * k - 3 }), mk({ x: c.x, y: c.y + c.h * k + 3, w: c.w, h: c.h * (1 - k) - 3 }));
      }
    } else {
      const l = rand() * 10;
      const t = rand() * 10;
      list.push(mk({ x: c.x + l, y: c.y + t, w: c.w - l - rand() * 10, h: c.h - t - rand() * 10 }));
    }
  }
  drawBuildings(g, list, rand);
}

function park(g: CanvasRenderingContext2D, x: number, y: number, s: number, rand: () => number) {
  g.fillStyle = "#13241a";
  g.fillRect(x, y, s, s);
  for (let i = 0; i < 60; i++) {
    g.fillStyle = rand() < 0.5 ? "rgba(70,140,90,0.06)" : "rgba(0,0,0,0.12)";
    g.beginPath();
    g.arc(x + rand() * s, y + rand() * s, 10 + rand() * 30, 0, TAU);
    g.fill();
  }
  g.save();
  g.beginPath();
  g.rect(x, y, s, s);
  g.clip();
  g.strokeStyle = "#2b3034";
  g.lineWidth = 12;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x, y + s * 0.8);
  g.bezierCurveTo(x + s * 0.35, y + s * 0.78, x + s * 0.45, y + s * 0.3, x + s, y + s * 0.22);
  g.stroke();
  g.beginPath();
  g.moveTo(x + s * 0.62, y + s);
  g.quadraticCurveTo(x + s * 0.6, y + s * 0.7, x + s * 0.42, y + s * 0.55);
  g.stroke();
  g.restore();
  // pond
  const px = x + s * 0.27;
  const py = y + s * 0.3;
  const rx = s * 0.19;
  const ry = s * 0.12;
  g.fillStyle = "#0c2230";
  g.beginPath();
  g.ellipse(px, py, rx, ry, -0.2, 0, TAU);
  g.fill();
  g.strokeStyle = "rgba(76,201,234,0.3)";
  g.lineWidth = 2;
  g.stroke();
  g.strokeStyle = "rgba(76,201,234,0.12)";
  for (let k = 0; k < 4; k++) line(g, px - 30 + k * 14, py - 8 + k * 6, px - 12 + k * 14, py - 8 + k * 6);
  for (let i = 0; i < 30; i++) {
    const tx = x + 16 + rand() * (s - 32);
    const ty = y + 16 + rand() * (s - 32);
    if (((tx - px) / (rx + 16)) ** 2 + ((ty - py) / (ry + 16)) ** 2 < 1) continue;
    tree(g, tx, ty, 9 + rand() * 7);
  }
}

function plaza(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
  g.fillStyle = "#262b30";
  g.fillRect(x, y, s, s);
  g.strokeStyle = "rgba(255,255,255,0.035)";
  g.lineWidth = 1;
  for (let k = 16; k < s; k += 16) {
    line(g, x + k, y, x + k, y + s);
    line(g, x, y + k, x + s, y + k);
  }
  const cx = x + s / 2;
  const cy = y + s / 2;
  g.strokeStyle = "rgba(255,255,255,0.06)";
  g.lineWidth = 18;
  g.beginPath();
  g.arc(cx, cy, 96, 0, TAU);
  g.stroke();
  g.fillStyle = "#3a4148";
  g.beginPath();
  g.arc(cx, cy, 46, 0, TAU);
  g.fill();
  g.fillStyle = "#0e2a3a";
  g.beginPath();
  g.arc(cx, cy, 40, 0, TAU);
  g.fill();
  g.strokeStyle = "rgba(76,201,234,0.3)";
  g.lineWidth = 1.5;
  for (const r of [14, 24, 33]) {
    g.beginPath();
    g.arc(cx, cy, r, 0, TAU);
    g.stroke();
  }
  g.save();
  g.globalCompositeOperation = "lighter";
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 22);
  gr.addColorStop(0, "rgba(76,201,234,0.55)");
  gr.addColorStop(1, "rgba(76,201,234,0)");
  g.fillStyle = gr;
  g.fillRect(cx - 22, cy - 22, 44, 44);
  g.restore();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + Math.PI / 8;
    tree(g, cx + Math.cos(a) * 140, cy + Math.sin(a) * 140, 12);
  }
  for (const [tx, ty] of [
    [x + 24, y + 24],
    [x + s - 24, y + 24],
    [x + 24, y + s - 24],
    [x + s - 24, y + s - 24],
  ])
    tree(g, tx, ty, 14);
}

function school(g: CanvasRenderingContext2D, x: number, y: number, s: number, rand: () => number) {
  g.fillStyle = "#1a1e22";
  g.fillRect(x, y, s, s);
  const a: Bldg = { x: x + 10, y: y + 10, w: s - 20, h: 120, ht: 26, color: "#30373f" };
  const b: Bldg = { x: x + 10, y: y + 130, w: 120, h: s - 140, ht: 26, color: "#30373f" };
  g.fillStyle = "rgba(0,0,0,0.42)";
  for (const v of [a, b]) g.fillRect(v.x + 12, v.y + 17, v.w, v.h);
  // roof A covered in solar panels, roof B with machines
  g.fillStyle = a.color;
  g.fillRect(a.x, a.y, a.w, a.h);
  g.fillRect(b.x, b.y, b.w, b.h);
  for (let i = 0; i < Math.floor((a.w - 24) / 18); i++)
    for (let j = 0; j < 7; j++) {
      g.fillStyle = "#1b2c42";
      g.fillRect(a.x + 12 + i * 18, a.y + 12 + j * 14, 16, 12);
      g.strokeStyle = "#2c4a6c";
      g.lineWidth = 1;
      g.strokeRect(a.x + 12.5 + i * 18, a.y + 12.5 + j * 14, 15, 11);
    }
  roof(g, { ...b, y: b.y + 4, h: b.h - 4 }, rand);
  // sports court
  const ct = { x: x + 150, y: y + 160, w: s - 170, h: s - 180 };
  g.fillStyle = "#173444";
  g.fillRect(ct.x, ct.y, ct.w, ct.h);
  g.strokeStyle = "rgba(230,232,227,0.5)";
  g.lineWidth = 2;
  g.strokeRect(ct.x + 10, ct.y + 10, ct.w - 20, ct.h - 20);
  line(g, ct.x + ct.w / 2, ct.y + 10, ct.x + ct.w / 2, ct.y + ct.h - 10);
  g.beginPath();
  g.arc(ct.x + ct.w / 2, ct.y + ct.h / 2, 22, 0, TAU);
  g.stroke();
  g.strokeRect(ct.x + 10, ct.y + ct.h / 2 - 30, 34, 60);
  g.strokeRect(ct.x + ct.w - 44, ct.y + ct.h / 2 - 30, 34, 60);
  for (let i = 0; i < 4; i++) tree(g, ct.x + 20 + i * 48, y + s - 8, 9);
}

function parkedCar(g: CanvasRenderingContext2D, p: Rect & { color: string }) {
  g.fillStyle = "rgba(0,0,0,0.45)";
  g.beginPath();
  g.roundRect(p.x + 3, p.y + 4, p.w, p.h, 6);
  g.fill();
  g.fillStyle = p.color;
  g.beginPath();
  g.roundRect(p.x, p.y, p.w, p.h, 6);
  g.fill();
  g.fillStyle = "rgba(10,14,18,0.75)";
  g.fillRect(p.x + 3, p.y + 9, p.w - 6, 8);
  g.fillRect(p.x + 3, p.y + p.h - 13, p.w - 6, 6);
  g.fillStyle = "rgba(255,255,255,0.08)";
  g.fillRect(p.x + 4, p.y + 19, p.w - 8, 12);
}

function lot(g: CanvasRenderingContext2D, lamps: [number, number][]) {
  g.fillStyle = "#1b1f23";
  g.fillRect(LX, LY, B, B);
  g.fillStyle = "#183622";
  g.fillRect(LX, LY, B, 8);
  g.fillRect(LX + B - 8, LY, 8, B);
  for (let k = 6; k < B; k += 13) {
    tree(g, LX + k, LY + 4, 6);
    tree(g, LX + B - 4, LY + k, 6);
  }
  g.strokeStyle = "rgba(230,232,227,0.35)";
  g.lineWidth = 2;
  for (const y of ROW_Y) for (let i = 0; i <= 8; i++) line(g, stallX(i), y, stallX(i), y + STALL_D);
  line(g, stallX(0), ROW_Y[2], stallX(8), ROW_Y[2]);
  g.fillStyle = "rgba(230,232,227,0.14)";
  g.font = "700 46px system-ui, sans-serif";
  g.textAlign = "center";
  g.fillText("P", LX + B / 2, LY + 352);
  for (const p of PARKED) parkedCar(g, p);
  lamps.push([LX + 6, LY + 121], [LX + B / 2, LY + 121], [LX + 6, LY + 336], [LX + B - 40, LY + 336]);
}

export function drawCity(g: CanvasRenderingContext2D) {
  const rand = rng(7);
  g.fillStyle = "#16191c";
  g.fillRect(0, 0, WORLD_W, WORLD_H);
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = `rgba(255,255,255,${0.012 + rand() * 0.025})`;
    g.fillRect(rand() * WORLD_W, rand() * WORLD_H, 1.5, 1.5);
  }
  roadMarks(g);
  const lamps: [number, number][] = [];
  LAYOUT.forEach((row, r) =>
    row.forEach((kind, c) => {
      const x = bx(c);
      const y = by(r);
      const br = rng(100 + r * 10 + c);
      if (kind === "lot") return lot(g, lamps);
      sidewalk(g, x, y, lamps);
      const ix = x + SW;
      const iy = y + SW;
      const is = B - 2 * SW;
      if (kind === "city") cityBlock(g, ix, iy, is, br);
      else if (kind === "park") park(g, ix, iy, is, br);
      else if (kind === "plaza") plaza(g, ix, iy, is);
      else school(g, ix, iy, is, br);
      streetTrees(g, x, y, br);
    }),
  );
  // street lights
  g.save();
  g.globalCompositeOperation = "lighter";
  for (const [lx, ly] of lamps) {
    const gr = g.createRadialGradient(lx, ly, 0, lx, ly, 60);
    gr.addColorStop(0, "rgba(255,210,140,0.17)");
    gr.addColorStop(1, "rgba(255,210,140,0)");
    g.fillStyle = gr;
    g.fillRect(lx - 60, ly - 60, 120, 120);
  }
  g.restore();
  g.fillStyle = "#f6e7bd";
  for (const [lx, ly] of lamps) {
    g.beginPath();
    g.arc(lx, ly, 2.2, 0, TAU);
    g.fill();
  }
}

const MINI: Record<Kind, string> = { city: "#14181c", park: "#1c3a27", school: "#14181c", lot: "#262c31", plaza: "#2b3036" };

export function drawMinimap(g: CanvasRenderingContext2D, w: number, h: number) {
  const m = w / WORLD_W;
  g.fillStyle = "#3b434a";
  g.fillRect(0, 0, w, h);
  LAYOUT.forEach((row, r) =>
    row.forEach((kind, c) => {
      g.fillStyle = MINI[kind];
      g.fillRect(bx(c) * m, by(r) * m, B * m, B * m);
    }),
  );
  g.fillStyle = CH.ch4;
  g.fillRect(TARGET.x * m, TARGET.y * m, Math.max(2, TARGET.w * m), Math.max(2, TARGET.h * m));
}
