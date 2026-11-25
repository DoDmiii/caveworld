// Aruun villages: three clearings in the fir forest beside the fishing lakes. A cult lodge backs each
// plaza, dwelling huts ring a sacrificial altar and a fire pit, skull palisades close north and south and
// skull totems flank the gate. Engine-free except for asset URLs.
import { OSHKORA_HOME } from './biomes';
import type { Piece } from './camp';
import h0 from '@/assets/aruun/aruun-hut-0.png.asset.json';
import h1 from '@/assets/aruun/aruun-hut-1.png.asset.json';
import h2 from '@/assets/aruun/aruun-hut-2.png.asset.json';
import h3 from '@/assets/aruun/aruun-hut-3.png.asset.json';
import hr0 from '@/assets/aruun/aruun-hut-0-ruin.png.asset.json';
import hr1 from '@/assets/aruun/aruun-hut-1-ruin.png.asset.json';
import hr2 from '@/assets/aruun/aruun-hut-2-ruin.png.asset.json';
import hr3 from '@/assets/aruun/aruun-hut-3-ruin.png.asset.json';
import l0 from '@/assets/aruun/aruun-lodge-0.png.asset.json';
import l1 from '@/assets/aruun/aruun-lodge-1.png.asset.json';
import l2 from '@/assets/aruun/aruun-lodge-2.png.asset.json';
import lr0 from '@/assets/aruun/aruun-lodge-0-ruin.png.asset.json';
import lr1 from '@/assets/aruun/aruun-lodge-1-ruin.png.asset.json';
import lr2 from '@/assets/aruun/aruun-lodge-2-ruin.png.asset.json';
import t0 from '@/assets/aruun/aruun-totem-0.png.asset.json';
import t1 from '@/assets/aruun/aruun-totem-1.png.asset.json';
import t2 from '@/assets/aruun/aruun-totem-2.png.asset.json';
import t3 from '@/assets/aruun/aruun-totem-3.png.asset.json';
import t4 from '@/assets/aruun/aruun-totem-4.png.asset.json';
import p0 from '@/assets/aruun/aruun-palisade-0.png.asset.json';
import p1 from '@/assets/aruun/aruun-palisade-1.png.asset.json';
import p2 from '@/assets/aruun/aruun-palisade-2.png.asset.json';
import p3 from '@/assets/aruun/aruun-palisade-3.png.asset.json';
import p4 from '@/assets/aruun/aruun-palisade-4.png.asset.json';
import p5 from '@/assets/aruun/aruun-palisade-5.png.asset.json';
import a0 from '@/assets/aruun/aruun-altar-0.png.asset.json';
import a1 from '@/assets/aruun/aruun-altar-1.png.asset.json';
import a2 from '@/assets/aruun/aruun-altar-2.png.asset.json';

const tex = (prefix: string, list: { url: string }[]) => list.map((a, i) => [`${prefix}-${i}`, a.url] as const);
export const ARUUN_VILLAGE_TEXTURES: Record<string, string> = Object.fromEntries([
  ...tex('aruun-hut', [h0, h1, h2, h3]), ...tex('aruun-lodge', [l0, l1, l2]),
  ...tex('aruun-totem', [t0, t1, t2, t3, t4]), ...tex('aruun-palisade', [p0, p1, p2, p3, p4, p5]), ...tex('aruun-altar', [a0, a1, a2]),
]);
/** Burnt-out huts and lodges, keyed `${hutKey}-ruin`. */
export const ARUUN_RUINS: Record<string, string> = Object.fromEntries([
  ...[hr0, hr1, hr2, hr3].map((a, i) => [`aruun-hut-${i}-ruin`, a.url]),
  ...[lr0, lr1, lr2].map((a, i) => [`aruun-lodge-${i}-ruin`, a.url]),
]);

/** Village centres beside Schwarzsee, Nebelsee and Knochensee; `r` is the tree-free clearing. */
export const ARUUN_VILLAGES = [
  { name: 'Rabenhain', x: 2516, y: 644, r: 165 },
  { name: 'Nebelwacht', x: 2696, y: 1410, r: 165 },
  { name: 'Knochenufer', x: 2203, y: 1577, r: 165 },
] as const;
/** Fire/rebuild village index of the first Aruun village; they follow Oshkora. */
export const ARUUN_HOME = OSHKORA_HOME + 1;

export const aruunVillageAt = (x: number, y: number, margin = 0) =>
  ARUUN_VILLAGES.find(v => Math.hypot(x - v.x, y - v.y) < v.r + margin);

/** Hut slots [dx, dy, variant, flip]: four dwellings around the plaza. */
const HUT_SLOTS: [number, number, boolean][] = [[-100, -30, false], [100, -30, true], [-88, 72, false], [88, 72, true]];

export const ARUUN_HOUSES: (Piece & { id: string; village: number; name: string })[] = ARUUN_VILLAGES.flatMap((v, vi) => [
  { id: `${v.name}:0`, key: `aruun-lodge-${vi % 3}`, x: v.x, y: v.y - 78, flip: false, bw: 50, bh: 14, village: ARUUN_HOME + vi, name: v.name },
  ...HUT_SLOTS.map(([dx, dy, flip], i) => ({ id: `${v.name}:${i + 1}`, key: `aruun-hut-${(i + vi) % 4}`, x: v.x + dx, y: v.y + dy, flip, bw: 40, bh: 14, village: ARUUN_HOME + vi, name: v.name })),
]);

/** Altar, totems and skull palisades (solid props). */
export const ARUUN_PROPS: Piece[] = ARUUN_VILLAGES.flatMap((v, vi) => {
  const out: Piece[] = [];
  const at = (key: string, dx: number, dy: number, bw: number, bh: number, flip = false) => out.push({ key, x: v.x + dx, y: v.y + dy, flip, bw, bh });
  at(`aruun-altar-${vi % 3}`, 0, 0, 46, 14);
  // Skull totems flank the south gate and guard the lodge corners.
  at(`aruun-totem-${vi % 5}`, -36, 150, 12, 8); at(`aruun-totem-${(vi + 1) % 5}`, 36, 150, 12, 8, true);
  at(`aruun-totem-${(vi + 2) % 5}`, -62, -64, 12, 8); at(`aruun-totem-${(vi + 3) % 5}`, 62, -64, 12, 8, true);
  // Palisades: north row behind the lodge, south row with the gate gap in the middle.
  [-150, -90, 90, 150].forEach((dx, i) => at(`aruun-palisade-${(i + vi) % 6}`, dx, -122, 58, 16, i % 2 === 1));
  [-150, -90, 90, 150].forEach((dx, i) => at(`aruun-palisade-${(i + vi + 3) % 6}`, dx, 150, 58, 16, i % 2 === 0));
  return out;
});
/** Fire pit in front of each altar. */
export const ARUUN_FIRES = ARUUN_VILLAGES.map(v => ({ x: v.x, y: v.y + 52 }));

const hash = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) % 100; };
/** Trampled dark earth of the clearing with old blood stains near the altar; null outside. */
export function aruunVillageGround(x: number, y: number): readonly [number, number, number] | null {
  const v = aruunVillageAt(x, y); if (!v) return null;
  const d = Math.hypot(x - v.x, y - v.y), n = hash(x >> 2, y >> 2);
  if (Math.hypot(x - v.x, (y - v.y - 8) * 1.6) < 40 && n < 22) return [86, 26, 22];
  if (d > v.r - 24) return n < 40 ? [46, 58, 44] : [58, 56, 42];
  return n < 12 ? [52, 44, 34] : [68, 60, 46];
}
