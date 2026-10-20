import h0 from '@/assets/nordic/snow-hut-0.png.asset.json';
import h1 from '@/assets/nordic/snow-hut-1.png.asset.json';
import h2 from '@/assets/nordic/snow-hut-2.png.asset.json';
import h3 from '@/assets/nordic/snow-hut-3.png.asset.json';
import h4 from '@/assets/nordic/snow-hut-4.png.asset.json';
import h5 from '@/assets/nordic/snow-hut-5.png.asset.json';
import f0 from '@/assets/nordic/fence-0.png.asset.json';
import f1 from '@/assets/nordic/fence-1.png.asset.json';
import f2 from '@/assets/nordic/fence-2.png.asset.json';
import f3 from '@/assets/nordic/fence-3.png.asset.json';
import f4 from '@/assets/nordic/fence-4.png.asset.json';
import f5 from '@/assets/nordic/fence-5.png.asset.json';
import f6 from '@/assets/nordic/fence-6.png.asset.json';
import f7 from '@/assets/nordic/fence-7.png.asset.json';
import f8 from '@/assets/nordic/fence-8.png.asset.json';
import { VILLAGES } from './biomes';
import type { Piece } from './camp';

const HUTS = [h0, h1, h2, h3, h4, h5];
const FENCES = [f0, f1, f2, f3, f4, f5, f6, f7, f8];

/** Snow hut textures (key → url). */
export const NORDIC_TEXTURES: Record<string, string> = Object.fromEntries([
  ...HUTS.map((a, i) => [`snow-hut-${i}`, a.url]),
  ...FENCES.map((a, i) => [`nordic-fence-${i}`, a.url]),
]);

/** Stable house IDs keep loot attached to the same house across saves. */
export const NORDIC_HOUSES = VILLAGES.flatMap((v, vi) => {
  const positions = vi === 0
    ? [[-96,-78],[-32,-78],[32,-78],[96,-78],[-110,-10],[110,-10],[-110,58],[110,58],[-64,66],[64,66]]
    : [[-64,-60],[0,-60],[64,-60],[-78,16],[78,16],[0,34]];
  return positions.map(([dx = 0, dy = 0], i) => ({
    id: `${v.name}:${i}`, village: v.name, variant: i,
    key: `snow-hut-${(i + vi * 2) % 6}`, x: v.x + dx, y: v.y + dy,
    flip: (i + vi) % 2 === 1, bw: 40, bh: 14,
  }));
});

/** Open north/south entrances; solid perimeter pieces never cover the gate gaps. */
export const NORDIC_FENCES: Piece[] = VILLAGES.flatMap((v, vi) => {
  const half = vi === 0 ? 164 : 132, top = vi === 0 ? -128 : -106, bottom = vi === 0 ? 132 : 108;
  const pieces: Piece[] = [];
  for (const y of [top, bottom]) {
    for (const side of [-1, 1]) for (let x = 62; x <= half - 16; x += 48)
      pieces.push({ key: `nordic-fence-${y === top ? 0 : 5}`, x: v.x + side * x, y: v.y + y, flip: side < 0, bw: 50, bh: 9 });
  }
  for (let y = top + 25, i = 0; y < bottom; y += 40, i++) for (const side of [-1, 1])
    pieces.push({ key: `nordic-fence-${[1,3,4,6,7,8][(i + vi) % 6]}`, x: v.x + side * half, y: v.y + y, flip: side < 0, bw: 15, bh: 42 });
  // Bone arches mark, but do not obstruct, each entrance.
  for (const y of [top, bottom]) pieces.push({ key: 'nordic-fence-2', x: v.x, y: v.y + y, bw: 0, bh: 0 });
  return pieces;
});

export const NORDIC_LAYOUT: Piece[] = [...NORDIC_HOUSES, ...NORDIC_FENCES];
