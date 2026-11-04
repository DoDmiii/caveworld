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
