// Engine-free weather: derived deterministically from the game clock, so reloads keep the same weather without extra save data.
import type { Biome } from './biomes';

export type Weather = 'clear' | 'rain' | 'thunder' | 'snow' | 'blizzard';
export type Region = 'north' | 'temperate';
/** Game minutes per weather spell (8 in-game hours). */
export const WEATHER_SPAN = 480;

export const WEATHER: Record<Weather, { name: string; icon: string; temp: number; coldLoss: number; speed: number; warn: string }> = {
  clear: { name: 'Klar', icon: '☀', temp: 0, coldLoss: 1, speed: 1, warn: '' },
  rain: { name: 'Regen', icon: '🌧', temp: -4, coldLoss: 1.4, speed: 1, warn: 'Durchnässt – such Schutz!' },
  thunder: { name: 'Gewitter', icon: '⛈', temp: -6, coldLoss: 1.6, speed: 1, warn: 'Gewitter – such Schutz!' },
  snow: { name: 'Schnee', icon: '❄', temp: -5, coldLoss: 1.3, speed: 0.92, warn: '' },
  blizzard: { name: 'Blizzard', icon: '💨', temp: -14, coldLoss: 2, speed: 0.75, warn: 'Blizzard – Windschutz nötig!' },
};

const TABLE: Record<Region, [Weather, number][]> = {
  temperate: [['clear', 55], ['rain', 30], ['thunder', 15]],
  north: [['clear', 40], ['snow', 40], ['blizzard', 20]],
};

export const regionOf = (b: Biome): Region => (b === 'nordics' ? 'north' : 'temperate');

function hash(n: number, salt: number) {
  let h = (n * 374761393 + salt * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function weatherAt(region: Region, clock: number): Weather {
  const span = Math.floor(Math.max(0, clock) / WEATHER_SPAN);
  if (span === 1 && region === 'temperate') return 'clear'; // first day starts calm
  let r = hash(span, region === 'north' ? 7 : 3) * 100;
  for (const [w, p] of TABLE[region]) { if ((r -= p) < 0) return w; }
  return 'clear';
}

export const isWet = (w: Weather) => w === 'rain' || w === 'thunder';

/** Cold-loss multiplier for the player; shelter blocks rain wetness and most of the blizzard wind. */
export function weatherColdFactor(w: Weather, sheltered: boolean): number {
  const f = WEATHER[w].coldLoss;
  return sheltered ? 1 + (f - 1) * 0.25 : f;
}

/** Share of campfire warmth that still reaches you: rain dampens an unroofed fire. */
export const fireStrength = (w: Weather, fireRoofed: boolean) => (isWet(w) && !fireRoofed ? 0.5 : 1);
