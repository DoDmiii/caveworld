import h0 from '@/assets/nordic/snow-hut-0.png.asset.json';
import h1 from '@/assets/nordic/snow-hut-1.png.asset.json';
import h2 from '@/assets/nordic/snow-hut-2.png.asset.json';
import h3 from '@/assets/nordic/snow-hut-3.png.asset.json';
import h4 from '@/assets/nordic/snow-hut-4.png.asset.json';
import h5 from '@/assets/nordic/snow-hut-5.png.asset.json';
import { VILLAGES } from './biomes';
import type { Piece } from './camp';

const HUTS = [h0, h1, h2, h3, h4, h5];

/** Snow hut textures (key → url). */
export const NORDIC_TEXTURES: Record<string, string> = Object.fromEntries(HUTS.map((a, i) => [`snow-hut-${i}`, a.url]));

/** Huts ring each village square; variants and mirroring alternate deterministically. */
export const NORDIC_LAYOUT: Piece[] = VILLAGES.flatMap((v, vi) => {
  const count = vi === 0 ? 6 : 3;
  const ring = vi === 0 ? 78 : 58;
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + (i + 0.5) * (Math.PI * 2 / count) + vi;
    return { key: `snow-hut-${(i + vi * 2) % 6}`, x: Math.round(v.x + Math.cos(a) * ring), y: Math.round(v.y + Math.sin(a) * ring * 0.75), flip: (i + vi) % 2 === 1, bw: 40, bh: 14 };
  });
});
