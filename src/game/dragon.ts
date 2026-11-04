import h0 from '@/assets/dragon/dragon-hut-0.png.asset.json';
import h1 from '@/assets/dragon/dragon-hut-1.png.asset.json';
import h2 from '@/assets/dragon/dragon-hut-2.png.asset.json';
import h3 from '@/assets/dragon/dragon-hut-3.png.asset.json';
import h4 from '@/assets/dragon/dragon-hut-4.png.asset.json';
import h5 from '@/assets/dragon/dragon-hut-5.png.asset.json';
import h6 from '@/assets/dragon/dragon-hut-6.png.asset.json';
import { DRAGON_VILLAGE } from './biomes';
import type { Piece } from './camp';

const HUTS = [h0, h1, h2, h3, h4, h5, h6];

export const DRAGON_TEXTURES: Record<string, string> = Object.fromEntries(HUTS.map((a, i) => [`dragon-hut-${i}`, a.url]));

/** Terraced layout: chief's stilt house (variant 2) on the upper terrace, dwellings below. */
const SLOTS: [number, number, number][] = [
  [0, -110, 2],
  [-80, -60, 0], [80, -60, 3],
  [-130, 10, 4], [0, 0, 1], [130, 10, 6],
  [-70, 80, 5], [70, 80, 0],
];

export const DRAGON_HOUSES: (Piece & { id: string })[] = SLOTS.map(([dx, dy, v], i) => ({
  id: `${DRAGON_VILLAGE.name}:${i}`, key: `dragon-hut-${v}`,
  x: DRAGON_VILLAGE.x + dx, y: DRAGON_VILLAGE.y + dy, flip: i % 2 === 1, bw: 40, bh: 14,
}));

import fh0 from '@/assets/dragon/dragon-fence-h0.png.asset.json';
import fh1 from '@/assets/dragon/dragon-fence-h1.png.asset.json';
import fv0 from '@/assets/dragon/dragon-fence-v0.png.asset.json';
import fv1 from '@/assets/dragon/dragon-fence-v1.png.asset.json';
import fc0 from '@/assets/dragon/dragon-corner-0.png.asset.json';
import fc1 from '@/assets/dragon/dragon-corner-1.png.asset.json';
import fg from '@/assets/dragon/dragon-gate.png.asset.json';
import ft0 from '@/assets/dragon/dragon-totem-0.png.asset.json';
import ft1 from '@/assets/dragon/dragon-totem-1.png.asset.json';

Object.assign(DRAGON_TEXTURES, {
  'dragon-fence-h0': fh0.url, 'dragon-fence-h1': fh1.url, 'dragon-fence-v0': fv0.url, 'dragon-fence-v1': fv1.url,
  'dragon-corner-0': fc0.url, 'dragon-corner-1': fc1.url, 'dragon-gate': fg.url, 'dragon-totem-0': ft0.url, 'dragon-totem-1': ft1.url,
});

/** Fence ring bounds relative to the village centre; the gate opens south toward the valley path. */
export const DRAGON_FENCE_BOUNDS = { half: 178, top: -165, bottom: 125, gateHalf: 30 };

/** Fence pieces; bw 0 marks walk-through decoration (the gate arch). */
export const DRAGON_FENCES: Piece[] = (() => {
  const { half, top, bottom } = DRAGON_FENCE_BOUNDS, { x: cx, y: cy } = DRAGON_VILLAGE, out: Piece[] = [];
  for (const [i, x] of [-126, -84, -42, 0, 42, 84, 126].entries()) out.push({ key: `dragon-fence-h${i % 3 === 0 ? 1 : 0}`, x: cx + x, y: cy + top, flip: i > 3, bw: 44, bh: 10 });
  for (const [i, x] of [-126, -84, 84, 126].entries()) out.push({ key: `dragon-fence-h${i === 1 || i === 2 ? 1 : 0}`, x: cx + x, y: cy + bottom, flip: x > 0, bw: 44, bh: 10 });
  for (const side of [-1, 1]) for (let y = top + 30, i = 0; y <= bottom - 30; y += 30, i++)
    out.push({ key: `dragon-fence-v${i % 2}`, x: cx + side * half, y: cy + y, flip: side > 0, bw: 14, bh: 30 });
  for (const side of [-1, 1]) {
    out.push({ key: 'dragon-corner-0', x: cx + side * half, y: cy + top, flip: side > 0, bw: 20, bh: 12 });
    out.push({ key: 'dragon-corner-1', x: cx + side * half, y: cy + bottom, flip: side > 0, bw: 20, bh: 12 });
    out.push({ key: `dragon-totem-${side < 0 ? 0 : 1}`, x: cx + side * 52, y: cy + bottom + 4, bw: 10, bh: 8 });
  }
  out.push({ key: 'dragon-gate', x: cx, y: cy + bottom, bw: 0, bh: 0 });
  return out;
})();
