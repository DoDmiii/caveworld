/** Engine-free Aruun fog geography, day-cycle density and sound mix. */
import { biomeAt } from './biomes';
import { ARUUN_LAKES, ARUUN_RIVERS, aruunRiverDist, lakeNorm } from './aruun';

export const FOREST_ART = { mist: 0xa0b4ae, raven: 0x171d1b, beak: 0x727b70 } as const;
export const FOG_BANKS = [
  ...ARUUN_LAKES.flatMap(l => [-1, 0, 1].map(i => ({ x: l.x + i * l.rx * 0.65, y: l.y + i * 13, w: 130, h: 30 }))),
  ...ARUUN_RIVERS.flatMap(r => r.filter((_, i) => i % 2 === 0).map(([x, y]) => ({ x, y, w: 100, h: 22 }))),
];
const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function forestWaterNear(x: number, y: number) {
  return Math.max(clamp(1 - aruunRiverDist(x, y) / 180), ...ARUUN_LAKES.map(l => clamp(1 - Math.max(0, lakeNorm(l, x, y) - 1) * 2)));
}
/** Peaks at 06:00 and 18:00; keeps midday mist light and silhouettes readable. */
export function fogDensity(minutes: number) {
  const hour = ((minutes % 1440) + 1440) % 1440 / 60;
  const dawn = clamp(1 - Math.abs(hour - 6) / 3), dusk = clamp(1 - Math.abs(hour - 18) / 3);
  return 0.07 + 0.16 * Math.max(dawn, dusk);
}
export function forestSound(x: number, y: number, indoors: boolean) {
  if (indoors || biomeAt(x, y) !== 'wenjaEast') return { wind: 0, water: 0 };
  return { wind: 0.65, water: 0.55 * forestWaterNear(x, y) };
}