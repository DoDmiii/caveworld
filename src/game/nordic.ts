import { VILLAGES } from './biomes';
import type { Piece } from './camp';

const HUTS = [0, 1, 2, 3, 4, 5].map(i => import.meta.glob('@/assets/nordic/snow-hut-*.png.asset.json', { eager: true, import: 'default' })[`/src/assets/nordic/snow-hut-${i}.png.asset.json`] as { url: string });

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
