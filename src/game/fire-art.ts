// Flammable hut registry plus the uploaded ruin, flame and smoke artwork.
import { CAMP_LAYOUT } from './camp';
import { NORDIC_HOUSES } from './nordic';
import { DRAGON_HOUSES } from './dragon';
import { VILLAGES, DRAGON_VILLAGE } from './biomes';
import type { HouseOwner } from './arson';
import flame from '@/assets/fire/house-flame.png.asset.json';
import smoke from '@/assets/fire/smoke-column.png.asset.json';
import c0 from '@/assets/fire/hut-0-ruin.png.asset.json';
import c1 from '@/assets/fire/hut-1-ruin.png.asset.json';
import c2 from '@/assets/fire/hut-2-ruin.png.asset.json';
import n0 from '@/assets/fire/snow-hut-0-ruin.png.asset.json';
import n1 from '@/assets/fire/snow-hut-1-ruin.png.asset.json';
import n2 from '@/assets/fire/snow-hut-2-ruin.png.asset.json';
import n3 from '@/assets/fire/snow-hut-3-ruin.png.asset.json';
import n4 from '@/assets/fire/snow-hut-4-ruin.png.asset.json';
import n5 from '@/assets/fire/snow-hut-5-ruin.png.asset.json';
import d0 from '@/assets/fire/dragon-hut-0-ruin.png.asset.json';
import d1 from '@/assets/fire/dragon-hut-1-ruin.png.asset.json';
import d2 from '@/assets/fire/dragon-hut-2-ruin.png.asset.json';
import d3 from '@/assets/fire/dragon-hut-3-ruin.png.asset.json';
import d4 from '@/assets/fire/dragon-hut-4-ruin.png.asset.json';
import d5 from '@/assets/fire/dragon-hut-5-ruin.png.asset.json';
import d6 from '@/assets/fire/dragon-hut-6-ruin.png.asset.json';

/** Ruin textures, keyed `${hutKey}-ruin`. */
export const RUIN_TEXTURES: Record<string, string> = {
  'hut-0-ruin': c0.url, 'hut-1-ruin': c1.url, 'hut-2-ruin': c2.url,
  ...Object.fromEntries([n0, n1, n2, n3, n4, n5].map((a, i) => [`snow-hut-${i}-ruin`, a.url])),
  ...Object.fromEntries([d0, d1, d2, d3, d4, d5, d6].map((a, i) => [`dragon-hut-${i}-ruin`, a.url])),
};
export const ruinKey = (key: string) => `${key}-ruin`;

/** Flame: 8 frames of 28×62 at 10 fps; the anchor (base of the fire) sits at (14, 48). */
export const FLAME_SHEET = { url: flame.url, w: 28, h: 62, frames: 8, fps: 10, ox: 14 / 28, oy: 48 / 62 };
/** Smoke column: 16 frames of 22×72 at 12 fps; anchored at its foot. */
export const SMOKE_SHEET = { url: smoke.url, w: 22, h: 72, frames: 16, fps: 12, ox: 9 / 22, oy: 1 };

export type FlammableHouse = { id: string; key: string; x: number; y: number; owner: HouseOwner; village?: number; name: string };

/** Every hut that can burn, with stable IDs (camp huts by layout slot, villages by their house IDs). */
export const FLAMMABLE_HOUSES: FlammableHouse[] = [
  ...CAMP_LAYOUT.flatMap((pc, i) => pc.key.startsWith('hut-') ? [{ id: `camp:${i}`, key: pc.key, x: pc.x, y: pc.y, owner: 'camp' as const, name: 'Höhlenlager' }] : []),
  ...NORDIC_HOUSES.map(h => ({ id: h.id, key: h.key, x: h.x, y: h.y, owner: 'nordic' as const, village: VILLAGES.findIndex(v => v.name === h.village), name: h.village })),
  ...DRAGON_HOUSES.map(h => ({ id: h.id, key: h.key, x: h.x, y: h.y, owner: 'dragon' as const, village: VILLAGES.length, name: DRAGON_VILLAGE.name })),
];
/** Point in front of the door where the player stands to light the roof or rebuild. */
export const doorPoint = (h: { x: number; y: number }) => ({ x: h.x, y: h.y + 28 });
