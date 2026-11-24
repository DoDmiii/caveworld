// Engine-free geography of the Aruun fir forest east of the great river:
// fishing rivers (wadeable), lakes (deep core blocks), fir looks by position.
import { biomeAt, riverX } from './biomes';

export type Pt = readonly [number, number];
/** Forest rivers flowing west into the great river; shallow and always wadeable. */
export const ARUUN_RIVERS: readonly (readonly Pt[])[] = [
  [[3060, 600], [2860, 720], [2660, 840], [2500, 900], [2330, 930], [2120, 1000], [1920, 1040], [riverX(1110), 1110]],
  [[3060, 1400], [2880, 1540], [2700, 1650], [2560, 1590], [2390, 1470], [2210, 1360], [2060, 1340], [1900, 1440], [riverX(1520), 1520]],
  [[2500, 900], [2470, 1080], [2380, 1240], [2210, 1360]],
  [[3060, 2050], [2860, 1990], [2620, 1920], [2380, 1990], [2140, 2060], [1950, 2100], [riverX(2140), 2140]],
];
export const ARUUN_RIVER_HALF = 16;
/** Fishing lakes of the Aruun. */
export const ARUUN_LAKES = [
  { name: 'Schwarzsee', x: 2520, y: 900, rx: 150, ry: 92 },
  { name: 'Nebelsee', x: 2700, y: 1650, rx: 120, ry: 78 },
  { name: 'Knochensee', x: 2210, y: 1360, rx: 86, ry: 56 },
] as const;
/** Fraction of a lake's radius that is deep, blocking water; the rim stays wadeable for fishing. */
export const LAKE_DEEP = 0.72;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const segDist = (px: number, py: number, [ax, ay]: Pt, [bx, by]: Pt) => {
  const dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
export function aruunRiverDist(x: number, y: number) {
  let d = Infinity;
  for (const r of ARUUN_RIVERS) for (let i = 1; i < r.length; i++) d = Math.min(d, segDist(x, y, r[i - 1]!, r[i]!));
  return d;
}
/** Normalised elliptic distance to a lake centre (1 = shoreline). */
export const lakeNorm = (l: (typeof ARUUN_LAKES)[number], x: number, y: number) => Math.hypot((x - l.x) / l.rx, (y - l.y) / l.ry);
export const aruunLakeAt = (x: number, y: number, scale = 1) => ARUUN_LAKES.find(l => lakeNorm(l, x, y) < scale);
export const aruunDeepAt = (x: number, y: number) => !!aruunLakeAt(x, y, LAKE_DEEP);
/** Any Aruun water (river or lake) under the point, optionally with a margin in px. */
export const aruunWaterAt = (x: number, y: number, margin = 0) =>
  aruunRiverDist(x, y) < ARUUN_RIVER_HALF + margin || ARUUN_LAKES.some(l => lakeNorm(l, x, y) < 1 + margin / Math.min(l.rx, l.ry));

export const FIR_VARIANTS = 4;
const hash = (x: number, y: number) => {
  let h = Math.imul(Math.floor(x) | 0, 73856093) ^ Math.imul(Math.floor(y) | 0, 19349663);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
};
/** Fir look for a tree in the Aruun forest, null elsewhere; same spot → same fir after regrowth. */
export function firTree(x: number, y: number) {
  if (biomeAt(x, y) !== 'wenjaEast') return null;
  const h = hash(x, y);
  return { key: `fir-${h % FIR_VARIANTS}`, flip: ((h >>> 8) & 1) === 1 };
}
