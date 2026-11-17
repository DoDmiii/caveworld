// Engine-free dry-land vegetation: which tree sprite grows where, oasis palm rings,
// thornbush scatter and canopy shade. world.ts only spawns sprites from these rules.
import { biomeAt, riverX } from './biomes';
import { WATERHOLES, OUTCROPS } from './desert';

export type DesertTreeKind = 'palm' | 'acacia';
export const PALM_VARIANTS = 4;
export const ACACIA_VARIANTS = 3;
export const THORNBUSH_VARIANTS = 3;
/** Date palms only grow this close (px beyond the water edge) to a waterhole. */
export const OASIS_RANGE = 150;
/** Shade radius under each crown, measured from the trunk foot. */
export const CANOPY_SHADE: Record<DesertTreeKind, number> = { palm: 20, acacia: 28 };

const hash = (x: number, y: number) => {
  let h = Math.imul(Math.floor(x) | 0, 73856093) ^ Math.imul(Math.floor(y) | 0, 19349663);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
};

export const nearOasis = (x: number, y: number) =>
  WATERHOLES.some(w => Math.hypot(x - w.x, y - w.y) < w.r + OASIS_RANGE);

/** Stable sprite for a dry-land tree at (x, y): palms at oases, acacias in the open. Same spot → same look after regrowth. */
export function desertTree(x: number, y: number) {
  const kind: DesertTreeKind = nearOasis(x, y) ? 'palm' : 'acacia';
  const h = hash(x, y);
  const variant = h % (kind === 'palm' ? PALM_VARIANTS : ACACIA_VARIANTS);
  return { kind, variant, flip: ((h >>> 8) & 1) === 1, key: kind === 'palm' ? `date-palm-${variant}` : `acacia-${variant}` };
}

/** Deterministic ring of 3–5 date palms around each waterhole, kept off the water itself. */
export function oasisPalms() {
  const out: { x: number; y: number }[] = [];
  WATERHOLES.forEach((w, i) => {
    const n = 3 + (hash(w.x, w.y) % 3);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + i * 0.9 + (hash(k, i) % 100) / 160;
      const d = w.r + 18 + (hash(i, k) % 26);
      out.push({ x: Math.round(w.x + Math.cos(a) * d), y: Math.round(w.y + Math.sin(a) * d) });
    }
  });
  return out;
}

/** Low thornbushes scattered over the dry land, never on water, outcrops or the river bank. */
export function thornbushes(count = 90, bounds = { x: -1024, y: 2300, w: 3000, h: 1260 }) {
  const out: { x: number; y: number; variant: number; flip: boolean }[] = [];
  let s = 5113;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count * 4 && out.length < count; i++) {
    const x = Math.round(bounds.x + 40 + rnd() * (bounds.w - 80)), y = Math.round(bounds.y + 40 + rnd() * (bounds.h - 80));
    if (biomeAt(x, y) !== 'dry' || Math.abs(x - riverX(y)) < 130) continue;
    if (WATERHOLES.some(w => Math.hypot(x - w.x, y - w.y) < w.r + 26)) continue;
    if (OUTCROPS.some(o => Math.hypot(x - o.x, y - o.y) < o.r + 10)) continue;
    if (out.some(b => Math.hypot(x - b.x, y - b.y) < 40)) continue;
    const h = hash(x, y);
    out.push({ x, y, variant: h % THORNBUSH_VARIANTS, flip: ((h >>> 5) & 1) === 1 });
  }
  return out;
}

/** True when (px, py) stands in the crown shadow of one of the given dry-land trees (trunk foot positions). */
export const inCanopyShade = (px: number, py: number, trees: { x: number; y: number; kind: DesertTreeKind }[]) =>
  trees.some(t => Math.hypot(px - t.x, (py - t.y) * 1.4) < CANOPY_SHADE[t.kind]);
