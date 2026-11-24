// Engine-free sound-effect rules: footstep surface, hit sounds per weapon, ambience levels and distance falloff.
// sfx-player.ts only plays what these rules pick; world.ts only reports events.
import { biomeAt, riverX, streamDist, STREAM_HALF } from './biomes';
import { aruunWaterAt, aruunRiverDist, ARUUN_RIVER_HALF } from './aruun';
import { waterholeAt } from './desert';
import { dragonPaddyAt, canalDist, CANAL_HALF } from './dragon';
import { isWet, type Weather } from './weather';
import type { Weapon } from './gear';

export type Surface = 'grass' | 'water' | 'snow' | 'house' | 'sand';
export type Place = 'hut' | 'cave' | undefined;
export type SoundId = 'step_grass' | 'step_water' | 'step_snow' | 'step_house' | 'punch' | 'hit' | 'behead' | 'splat' | 'click';
export type SoundEvent = { id: SoundId; gain: number; rate?: number };

/** Clips inside the packed sfx sprite: [start seconds, length seconds]; several entries = random variants. */
export const SFX_SPRITE: Record<SoundId, readonly (readonly [number, number])[]> = {
  step_grass: [[0.1, 0.25], [0.5, 0.25], [0.9, 0.25], [1.3, 0.25], [1.7, 0.25]],
  step_water: [[2.1, 0.22], [2.47, 0.22], [2.84, 0.22], [3.21, 0.22], [3.58, 0.22], [3.95, 0.22]],
  step_snow: [[4.32, 0.29], [4.76, 0.29], [5.2, 0.29], [5.64, 0.29], [6.08, 0.29], [6.52, 0.29]],
  step_house: [[6.96, 0.31], [7.42, 0.31], [7.88, 0.31], [8.34, 0.31], [8.8, 0.31], [9.26, 0.31]],
  punch: [[9.72, 0.71], [10.58, 0.61]],
  hit: [[11.34, 0.46], [11.95, 0.51]],
  behead: [[12.61, 3.31]],
  splat: [[16.07, 1.51]],
  click: [[17.73, 0.21]],
};

/** River water as painted on the ground (matches the world's river art). */
export const RIVER_WATER = 56;
/** Ground under the player's feet. Huts and caves have packed floors; sand has no own recording yet. */
export function surfaceAt(x: number, y: number, place: Place): Surface {
  if (place) return 'house';
  if (Math.abs(x - riverX(y)) < RIVER_WATER || streamDist(x, y) < STREAM_HALF || waterholeAt(x, y) || dragonPaddyAt(x, y) || canalDist(x, y) < CANAL_HALF + 2 || aruunWaterAt(x, y)) return 'water';
  const b = biomeAt(x, y);
  return b === 'nordics' ? 'snow' : b === 'dry' ? 'sand' : 'grass';
}
/** Which clip and how loud/pitched each surface sounds; sand reuses the grass steps a little deeper and softer. */
export const STEP_SOUND: Record<Surface, { id: SoundId; gain: number; rate: number }> = {
  grass: { id: 'step_grass', gain: 0.45, rate: 1 },
  water: { id: 'step_water', gain: 0.5, rate: 1 },
  snow: { id: 'step_snow', gain: 0.45, rate: 1 },
  house: { id: 'step_house', gain: 0.4, rate: 1 },
  sand: { id: 'step_grass', gain: 0.35, rate: 0.82 },
};
/** One footstep every this many pixels walked; jumps longer than TELEPORT_PX (doors, respawn) are ignored. */
export const STEP_PX = 26, TELEPORT_PX = 40;
export function stepAdvance(acc: number, moved: number): { acc: number; step: boolean } {
  if (moved > TELEPORT_PX || moved <= 0) return { acc: moved > TELEPORT_PX ? 0 : acc, step: false };
  const next = acc + moved;
  return next >= STEP_PX ? { acc: next - STEP_PX, step: true } : { acc: next, step: false };
}
/** Bare fists punch; any weapon (club, axe, spear, wedge) lands a flesh hit. */
export const hitSound = (weapon: Weapon, club: boolean): SoundId => (weapon === 'none' && !club ? 'punch' : 'hit');
/** Finisher impact: the axe beheads, every other finisher splatters. */
export const finisherSound = (behead: boolean): SoundId => (behead ? 'behead' : 'splat');
/** Loudness of something happening at distance d from the player. */
export const HEAR_FULL = 80, HEAR_MAX = 420;
export const distanceGain = (d: number) => (d <= HEAR_FULL ? 1 : d >= HEAR_MAX ? 0 : 1 - (d - HEAR_FULL) / (HEAR_MAX - HEAR_FULL));
/** Flowing-water ambience: full at the bank, fading out RIVER_FADE px away; streams a bit quieter, canals faint. */
export const RIVER_FADE = 240;
export function riverLevel(x: number, y: number, place: Place): number {
  if (place) return 0;
  const fade = (gap: number) => Math.max(0, Math.min(1, 1 - (gap - 20) / RIVER_FADE));
  return Math.max(fade(Math.abs(x - riverX(y)) - RIVER_WATER), 0.8 * fade(streamDist(x, y) - STREAM_HALF), 0.35 * fade(canalDist(x, y) * 2), 0.7 * fade(aruunRiverDist(x, y) - ARUUN_RIVER_HALF));
}
/** Rain ambience by weather; silent inside caves and huts. */
export function rainLevel(weather: Weather | undefined, place: Place): number {
  if (place || !weather || !isWet(weather)) return 0;
  return weather === 'thunder' ? 1 : 0.75;
}
/** Random variant index that never repeats the previous one. */
export function pickVariant(n: number, last: number, rnd: number): number {
  if (n <= 1) return 0;
  const i = Math.floor(rnd * (n - 1)) % (n - 1);
  return i >= last && last >= 0 ? i + 1 : i;
}
/** Stored sound-effect volume 0..1; default 70 %. */
export const DEFAULT_SFX_VOLUME = 0.7;
export function parseSfxVolume(v: string | null | undefined): number { const n = v == null || v === '' ? NaN : Number(v); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULT_SFX_VOLUME; }
