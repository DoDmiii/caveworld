// Drachenterrasse: the dragon people's village on the upper mountain terrace.
// The plateau cliffs are the village wall (no fence ring); huts are staggered by height, a slate
// plaza with a fire sits in the middle, and rice paddies fed by canals step down toward the stream.
// Engine-free except for asset URLs; dragon-render.ts paints the ground art.
import h0 from '@/assets/dragon/dragon-hut-0.png.asset.json';
import h1 from '@/assets/dragon/dragon-hut-1.png.asset.json';
import h2 from '@/assets/dragon/dragon-hut-2.png.asset.json';
import h3 from '@/assets/dragon/dragon-hut-3.png.asset.json';
import h4 from '@/assets/dragon/dragon-hut-4.png.asset.json';
import h5 from '@/assets/dragon/dragon-hut-5.png.asset.json';
import h6 from '@/assets/dragon/dragon-hut-6.png.asset.json';
import fg from '@/assets/dragon/dragon-gate.png.asset.json';
import ft0 from '@/assets/dragon/dragon-totem-0.png.asset.json';
import ft1 from '@/assets/dragon/dragon-totem-1.png.asset.json';
import { DRAGON_VILLAGE, STREAM_HALF, streamDist } from './biomes';
import { TERRACES, heightAt, nearCliff, CLIFF_H } from './terrain';
import type { Piece } from './camp';

const HUTS = [h0, h1, h2, h3, h4, h5, h6];

export const DRAGON_TEXTURES: Record<string, string> = {
  ...Object.fromEntries(HUTS.map((a, i) => [`dragon-hut-${i}`, a.url])),
  'dragon-gate': fg.url, 'dragon-totem-0': ft0.url, 'dragon-totem-1': ft1.url,
};

const { x: CX, y: CY } = DRAGON_VILLAGE;
type Pt = readonly [number, number];

/**
 * [dx, dy, variant]: the chief's stilt house (variant 2) on the upper rise, dwellings around the
 * plaza and a fisher's hut on the lower east side by the stream. Index = stable hut ID.
 */
const SLOTS: [number, number, number][] = [
  [0, -150, 2],
  [-125, -100, 0], [125, -100, 3],
  [-210, -20, 4], [210, -15, 1],
  [-160, 60, 6], [150, 62, 5],
  [215, 90, 0],
];

export const DRAGON_HOUSES: (Piece & { id: string })[] = SLOTS.map(([dx, dy, v], i) => ({
  id: `${DRAGON_VILLAGE.name}:${i}`, key: `dragon-hut-${v}`,
  x: CX + dx, y: CY + dy, flip: i % 2 === 1, bw: 40, bh: 14,
}));

/** Slate-paved village square with the fire in its middle. */
export const DRAGON_PLAZA = { x: CX, y: CY + 5, rx: 60, ry: 42 } as const;
export const DRAGON_FIRE = { x: CX, y: CY + 2 } as const;

const passPoint = (t: (typeof TERRACES)[number], a: number): Pt => [t.cx + Math.cos(a) * t.rx, t.cy + Math.sin(a) * t.ry];
const PLATEAU = TERRACES[1]!, SLOPE = TERRACES[0]!;
const SOUTH_PASS = passPoint(PLATEAU, PLATEAU.passes[0]!), WEST_PASS = passPoint(PLATEAU, PLATEAU.passes[1]!);
const VALLEY_PASS = passPoint(SLOPE, SLOPE.passes[0]!);

/** Footpaths kept free of fields: plaza → south pass → valley pass, and plaza → west pass. */
export const DRAGON_PATHS: readonly (readonly Pt[])[] = [
  [[CX, CY + 40], SOUTH_PASS, VALLEY_PASS],
  [[CX - 50, CY - 5], WEST_PASS],
];

/** Plateau terraces bend gently uphill toward the sides, like contour lines around the village rise. */
const BEND = 0.0005;
const plateauY = (x: number, y: number) => y + BEND * (x - CX) ** 2;
/** Outward distance (px) from the plateau rim; slope paddies follow the cliff in bands. */
const rimDist = (x: number, y: number) => (Math.hypot((x - PLATEAU.cx) / PLATEAU.rx, (y - PLATEAU.cy) / PLATEAU.ry) - 1) * PLATEAU.ry;
const RIM_ANG = (x: number, y: number) => Math.atan2((y - PLATEAU.cy) / PLATEAU.ry, (x - PLATEAU.cx) / PLATEAU.rx);
const rimPoint = (a: number, d: number): Pt => { const k = 1 + d / PLATEAU.ry; return [PLATEAU.cx + Math.cos(a) * PLATEAU.rx * k, PLATEAU.cy + Math.sin(a) * PLATEAU.ry * k]; };
const CANAL_TOP = CY + 104, SLOPE_CANAL = 34, SLOPE_A0 = Math.PI * 0.3, SLOPE_A1 = Math.PI * 0.56;

/** Irrigation canals (polylines). Each starts in the stream and runs along the top of its paddies. */
export const DRAGON_CANALS: readonly (readonly Pt[])[] = [
  [[CX + 172, -548], ...Array.from({ length: 27 }, (_, i): Pt => { const x = CX + 172 - i * 16; return [x, CANAL_TOP - BEND * (x - CX) ** 2]; })],
  [[2240, -456], ...Array.from({ length: 12 }, (_, i) => rimPoint(Math.PI * 0.58 - i * (Math.PI * 0.28) / 11, SLOPE_CANAL))],
];
export const CANAL_HALF = 3;

/** Terraced paddy zones: two on the plateau below the village, one on the slope below the cliff. */
const PADDY_ZONES = [
  { x0: CX - 240, x1: CX - 26, y0: CANAL_TOP + 6, y1: CY + 240, level: 2 },
  { x0: CX + 26, x1: CX + 162, y0: CANAL_TOP + 6, y1: CY + 220, level: 2 },
  { x0: CX - 60, x1: CX + 240, y0: CY + 230, y1: CY + 370, level: 1 },
] as const;
const BAND = 30, BED = 62, MIN_BED_AREA = 700;

const segDist = (px: number, py: number, a: Pt, b: Pt) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.min(1, Math.max(0, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
};
export const lineDist = (lines: readonly (readonly Pt[])[], x: number, y: number) => {
  let d = Infinity;
  for (const l of lines) for (let i = 1; i < l.length; i++) d = Math.min(d, segDist(x, y, l[i - 1]!, l[i]!));
  return d;
};
export const pathDist = (x: number, y: number) => lineDist(DRAGON_PATHS, x, y);
export const canalDist = (x: number, y: number) => lineDist(DRAGON_CANALS, x, y);
const underHut = (x: number, y: number) => DRAGON_HOUSES.some(h => Math.abs(x - h.x) < 32 && y > h.y - 30 && y < h.y + 34);

export type Paddy = { zone: number; band: number; bed: number; id: number };
function rawPaddy(x: number, y: number): Paddy | null {
  for (let zi = 0; zi < PADDY_ZONES.length; zi++) {
    const z = PADDY_ZONES[zi]!;
    if (x < z.x0 || x > z.x1) continue;
    const wob = 3 * Math.sin(x / 17 + zi) + 2 * Math.sin(y / 23);
    let band: number, bed: number;
    if (z.level === 2) {
      const yy = plateauY(x, y);
      if (yy < z.y0 || yy > z.y1) continue;
      band = Math.floor((yy - z.y0 + wob) / BAND);
      bed = Math.floor((x - z.x0 + (band * 23 + zi * 17) % BED + 5 * Math.sin(y / 9 + band)) / BED);
    } else {
      if (y < z.y0 || y > z.y1) continue;
      const d = rimDist(x, y), a = RIM_ANG(x, y);
      if (d < SLOPE_CANAL + CANAL_HALF + 3 || a < SLOPE_A0 || a > SLOPE_A1) continue;
      band = Math.floor((d - SLOPE_CANAL + wob) / BAND);
      bed = Math.floor(((SLOPE_A1 - a) * PLATEAU.rx * 1.2 + (band * 23) % BED) / BED);
    }
    if (heightAt(x, y) !== z.level || nearCliff(x, y, 16) || streamDist(x, y) < STREAM_HALF + 9) return null;
    // Keep clear of the cliff face drawn below the plateau edge.
    if (z.level === 1 && heightAt(x, y - CLIFF_H - 10) !== 1) return null;
    if (pathDist(x, y) < 18 || canalDist(x, y) < CANAL_HALF + 3 || underHut(x, y)) return null;
    return { zone: zi, band, bed, id: zi * 1000 + band * 50 + bed };
  }
  return null;
}
let bedOk: Set<number> | undefined;
/** Flooded rice bed at a point (walkable ground art), or null. Slivers cut off by cliffs or the stream are dropped. */
export function dragonPaddyAt(x: number, y: number): Paddy | null {
  const p = rawPaddy(x, y);
  if (!p) return null;
  if (!bedOk) {
    // Area and thickness per bed (a bed counts as thick where it spans ±7 px vertically).
    const area = new Map<number, number>(), thick = new Map<number, number>();
    for (const z of PADDY_ZONES) for (let yy = z.y0 - 60; yy <= z.y1; yy += 2) for (let xx = z.x0; xx <= z.x1; xx += 2) {
      const q = rawPaddy(xx, yy); if (!q) continue;
      area.set(q.id, (area.get(q.id) ?? 0) + 4);
      if (rawPaddy(xx, yy - 7)?.id === q.id && rawPaddy(xx, yy + 7)?.id === q.id) thick.set(q.id, (thick.get(q.id) ?? 0) + 4);
    }
    bedOk = new Set([...area].filter(([id, a]) => a >= MIN_BED_AREA && (thick.get(id) ?? 0) >= a * 0.4).map(([id]) => id));
  }
  return bedOk.has(p.id) ? p : null;
}

/** Area covered by the village and its fields (plus margin): no wild trees, rocks or bushes grow here. */
export function dragonGroundsAt(x: number, y: number, margin = 0) {
  if (Math.hypot(x - CX, y - CY) < DRAGON_VILLAGE.r + 30 + margin) return true;
  if (PADDY_ZONES.some(z => x >= z.x0 - margin && x <= z.x1 + margin && y >= z.y0 - 60 - margin && y <= z.y1 + margin)) return true;
  return canalDist(x, y) < CANAL_HALF + margin;
}

/** Stepping stones where the south path fords the stream. */
export const DRAGON_STEPPING_STONES: readonly Pt[] = [[CX - 2, -515], [CX + 3, -506], [CX - 3, -497], [CX + 2, -488]];
/** Plank fishing pier reaching from the north bank into the stream, next to the fisher's hut. */
export const DRAGON_PIER = { x: CX + 214, y: -560, w: 10, h: 30 } as const;
/** Woven fish traps lying in the stream. */
export const DRAGON_FISH_TRAPS: readonly Pt[] = [[2590, -512], [2420, -540], [2122, -408]];

/** Upright decoration (not blocking): scarecrows in the paddies, rice sheaves and drying racks. */
export type DragonProp = { key: 'dragon-scarecrow' | 'dragon-sheaves' | 'dragon-rice-rack' | 'dragon-fish-rack'; x: number; y: number; flip?: boolean };
export const DRAGON_PROPS: readonly DragonProp[] = [
  { key: 'dragon-scarecrow', x: CX - 118, y: CY + 165 },
  { key: 'dragon-scarecrow', x: CX + 120, y: CY + 300, flip: true },
  { key: 'dragon-rice-rack', x: CX + 66, y: CY - 46 },
  { key: 'dragon-rice-rack', x: CX - 70, y: CY + 70, flip: true },
  { key: 'dragon-sheaves', x: CX + 72, y: CY + 10 },
  { key: 'dragon-sheaves', x: CX - 212, y: CY + 92, flip: true },
  { key: 'dragon-fish-rack', x: CX + 192, y: -572 },
];

/** Gate arch over the path where it leaves the village toward the paddies, flanked by two totems. */
export const DRAGON_GATE: Piece[] = [
  { key: 'dragon-gate', x: CX, y: CY + 64, bw: 0, bh: 0 },
  { key: 'dragon-totem-0', x: CX - 40, y: CY + 76, bw: 10, bh: 8 },
  { key: 'dragon-totem-1', x: CX + 40, y: CY + 76, bw: 10, bh: 8 },
];

/** Bounding box of all painted village ground (plaza, paddies, canals, stones, pier). */
export const DRAGON_GROUND_BOX = { x: CX - 250, y: CY - 60, w: 530, h: 440 } as const;
