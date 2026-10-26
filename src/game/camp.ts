import hut0 from '@/assets/camp/hut-0.png.asset.json';
import hut1 from '@/assets/camp/hut-1.png.asset.json';
import hut2 from '@/assets/camp/hut-2.png.asset.json';
import fence0 from '@/assets/camp/fence-0.png.asset.json';
import fence1 from '@/assets/camp/fence-1.png.asset.json';
import fence2 from '@/assets/camp/fence-2.png.asset.json';
import fence3 from '@/assets/camp/fence-3.png.asset.json';
import fence4 from '@/assets/camp/fence-4.png.asset.json';
import chest from '@/assets/camp/storage-chest.png.asset.json';

/** Camp structure textures (key → url). */
export const CAMP_TEXTURES: Record<string, string> = {
  'hut-0': hut0.url, 'hut-1': hut1.url, 'hut-2': hut2.url,
  'fence-0': fence0.url, 'fence-1': fence1.url, 'fence-2': fence2.url, 'fence-3': fence3.url, 'fence-4': fence4.url,
  'storage-chest': chest.url,
};

export type Piece = { key: string; x: number; y: number; flip?: boolean; bw: number; bh: number };

/** Main camp layout: huts flank the fire, a palisade closes the south with a gate in the middle. */
export const CAMP_LAYOUT: Piece[] = [
  { key: 'hut-0', x: 872, y: 650, bw: 38, bh: 14 },
  { key: 'hut-1', x: 1132, y: 648, flip: true, bw: 40, bh: 14 },
  { key: 'hut-2', x: 868, y: 735, bw: 42, bh: 14 },
  { key: 'hut-2', x: 1138, y: 738, flip: true, bw: 42, bh: 14 },
  // South palisade, gate gap around x 970–1030.
  { key: 'fence-0', x: 850, y: 800, bw: 58, bh: 8 },
  { key: 'fence-4', x: 910, y: 802, bw: 58, bh: 8 },
  { key: 'fence-2', x: 1090, y: 802, bw: 58, bh: 8 },
  { key: 'fence-3', x: 1150, y: 800, flip: true, bw: 58, bh: 8 },
  // Gate posts.
  { key: 'fence-1', x: 958, y: 790, bw: 14, bh: 8 },
  { key: 'fence-1', x: 1042, y: 790, flip: true, bw: 14, bh: 8 },
];
