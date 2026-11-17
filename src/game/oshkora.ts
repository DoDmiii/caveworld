// Oshkora: kraal village of goat herders and early farmers around the Ockerquelle in the dry land.
// Hut backs form the north wall, horizontal thorn fences close the gaps, and dense thornbush hedges
// stand in for the vertical sides (no vertical fence sprites exist). Engine-free except for asset URLs.
import h0 from '@/assets/oshkora/oshkora-hut-0.png.asset.json';
import h1 from '@/assets/oshkora/oshkora-hut-1.png.asset.json';
import h2 from '@/assets/oshkora/oshkora-hut-2.png.asset.json';
import h3 from '@/assets/oshkora/oshkora-hut-3.png.asset.json';
import h4 from '@/assets/oshkora/oshkora-hut-4.png.asset.json';
import h5 from '@/assets/oshkora/oshkora-hut-5.png.asset.json';
import r0 from '@/assets/oshkora/oshkora-hut-0-ruin.png.asset.json';
import r1 from '@/assets/oshkora/oshkora-hut-1-ruin.png.asset.json';
import r2 from '@/assets/oshkora/oshkora-hut-2-ruin.png.asset.json';
import r3 from '@/assets/oshkora/oshkora-hut-3-ruin.png.asset.json';
import r4 from '@/assets/oshkora/oshkora-hut-4-ruin.png.asset.json';
import r5 from '@/assets/oshkora/oshkora-hut-5-ruin.png.asset.json';
import f0 from '@/assets/oshkora/oshkora-fence-0.png.asset.json';
import f1 from '@/assets/oshkora/oshkora-fence-1.png.asset.json';
import f2 from '@/assets/oshkora/oshkora-fence-2.png.asset.json';
import f3 from '@/assets/oshkora/oshkora-fence-3.png.asset.json';
import { OSHKORA } from './biomes';
import type { Piece } from './camp';

const HUTS = [h0, h1, h2, h3, h4, h5];
const RUINS = [r0, r1, r2, r3, r4, r5];
const FENCES = [f0, f1, f2, f3];

export const OSHKORA_TEXTURES: Record<string, string> = Object.fromEntries([
  ...HUTS.map((a, i) => [`oshkora-hut-${i}`, a.url]),
  ...FENCES.map((a, i) => [`oshkora-fence-${i}`, a.url]),
]);
/** Burnt-out versions, keyed like every other ruin (`${hutKey}-ruin`). */
export const OSHKORA_RUINS: Record<string, string> = Object.fromEntries(RUINS.map((a, i) => [`oshkora-hut-${i}-ruin`, a.url]));

/** Canvas heights; the collision body sits at the bottom of the canvas (see world.ts obstacle()). */
export const TEX_H = (key: string) => key.startsWith('oshkora-fence') ? 64 : key.startsWith('thornbush') ? 48 : /oshkora-hut-[012]$/.test(key) ? 56 : 48;
/** Collision rectangle of a piece, mirroring world.ts: bottom 4 px above the canvas edge. */
export function pieceBody(pc: Piece) {
  const bottom = pc.y + TEX_H(pc.key) / 2 - 4;
  return { l: pc.x - pc.bw / 2, r: pc.x + pc.bw / 2, t: bottom - pc.bh, b: bottom };
}

const { x: CX, y: CY } = OSHKORA;
/** Outer kraal bounds relative to the centre; the gates open north and south. */
export const OSHKORA_BOUNDS = { half: 230, top: -150, bottom: 150, gateHalf: 28 } as const;

/** [dx, dy, variant, flip]: big huts (0–2) back the north wall, small ones (3–5) stand inside. */
const SLOTS: [number, number, number, boolean][] = [
  [-150, -150, 1, false], [-50, -150, 0, false], [50, -150, 2, false], [150, -150, 1, true],
  [-165, -55, 5, false], [165, -55, 3, true], [160, 45, 4, false], [110, 100, 0, true],
];
export const OSHKORA_HOUSES: (Piece & { id: string })[] = SLOTS.map(([dx, dy, v, flip], i) => ({
  id: `${OSHKORA.name}:${i}`, key: `oshkora-hut-${v}`, x: CX + dx, y: CY + dy, flip, bw: 40, bh: 14,
}));

const fence = (dx: number, dy: number, v: number, flip = false): Piece => ({ key: `oshkora-fence-${v}`, x: CX + dx, y: CY + dy, flip, bw: 60, bh: 16 });
const bush = (dx: number, dy: number, i: number): Piece => ({ key: `thornbush-${i % 3}`, x: CX + dx, y: CY + dy, flip: i % 2 === 1, bw: 28, bh: 22 });

/** Fences, thorn hedges and the goat pen. */
export const OSHKORA_FENCES: Piece[] = (() => {
  const { half, top, bottom } = OSHKORA_BOUNDS, out: Piece[] = [];
  // North wall: fences between the hut backs; the middle gap is the north gate.
  out.push(fence(-100, top + 5, 2), fence(100, top + 5, 1, true));
  // Corners and side hedges (dense thornbush rows instead of vertical fences).
  let n = 0;
  for (const s of [-1, 1]) {
    out.push(bush(s * 186, top + 18, n++), bush(s * 215, top + 32, n++));
    for (let dy = top + 50; dy <= bottom; dy += 20) out.push(bush(s * (half + ((dy / 20) % 2 ? 3 : -2)), dy, n++));
  }
  // South wall with the gate in the middle; skull fences flank the gate.
  for (const s of [-1, 1]) [58, 114, 170, 214].forEach((dx, i) => out.push(fence(s * dx, bottom, i === 0 ? (s < 0 ? 1 : 2) : i % 2 ? 0 : 3, s > 0)));
  // Goat pen in the south-west corner: fence on top, a short hedge on its east side, opening at the bottom.
  out.push(fence(-185, 30, 3), fence(-128, 30, 0, true));
  for (const dy of [55, 75, 95]) out.push(bush(-100, dy, n++));
  return out;
})();

/** Goat pen interior (absolute), kept for the herds that arrive with the inhabitants. */
export const OSHKORA_PEN = { x: CX - 214, y: CY + 60, w: 112, h: 100 } as const;

/** Tilled millet fields (absolute rects) painted into the ground just outside the kraal. */
export const OSHKORA_FIELDS = [
  { x: CX + 255, y: CY - 110, w: 110, h: 180 },
  { x: CX - 230, y: CY - 300, w: 170, h: 85 },
  { x: CX + 40, y: CY + 190, w: 180, h: 80 },
] as const;

const inRect = (x: number, y: number, r: { x: number; y: number; w: number; h: number }, m = 0) => x >= r.x - m && x <= r.x + r.w + m && y >= r.y - m && y <= r.y + r.h + m;
/** Kraal or fields (plus margin): no wild trees, rocks or bushes grow here and wildlife turns away. */
export function oshkoraAt(x: number, y: number, margin = 0) {
  const { half, top, bottom } = OSHKORA_BOUNDS;
  if (x >= CX - half - 20 - margin && x <= CX + half + 20 + margin && y >= CY + top - 40 - margin && y <= CY + bottom + 40 + margin) return true;
  return OSHKORA_FIELDS.some(f => inRect(x, y, f, margin));
}

const hash = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) % 100; };
/** Ground colour for kraal floor, goat pen and furrowed fields; null outside the village grounds. */
export function oshkoraGround(x: number, y: number): readonly [number, number, number] | null {
  for (const f of OSHKORA_FIELDS) if (inRect(x, y, f)) {
    if (x - f.x < 4 || f.x + f.w - x < 4 || y - f.y < 4 || f.y + f.h - y < 4) return [126, 98, 64];
    const ridge = Math.floor((y - f.y) / 8) % 2 === 0;
    if (ridge && hash(x >> 3, y >> 3) < 28) return [104, 128, 58];
    return ridge ? [142, 108, 70] : [108, 80, 52];
  }
  if (inRect(x, y, OSHKORA_PEN)) return hash(x >> 2, y >> 2) < 14 ? [186, 158, 92] : [132, 104, 68];
  const { half, top, bottom } = OSHKORA_BOUNDS;
  if (Math.abs(x - CX) < half && y > CY + top - 20 && y < CY + bottom + 10) return hash(x >> 2, y >> 2) < 10 ? [138, 108, 72] : [158, 126, 84];
  return null;
}
