/** The three dragon wolf hunters wear their pelt outdoors and lay it aside at home. Engine-free. */
import type { Weather } from './weather';

/** Yozora (black), Yuki (white), Kasumi (grey). */
export const WOLF_HUNTERS: ReadonlySet<string> = new Set(['dragon-w2', 'dragon-w3', 'dragon-w4']);
export const isWolfHunter = (id: string) => WOLF_HUNTERS.has(id);
/** Texture key of the same hunter without her pelt (identical atlas layout). */
export const bareTex = (tex: string) => `${tex}-bare`;
/** Distance at which a hearth or camp fire keeps them warm enough to take the pelt off. */
export const FIRE_WARMTH_RANGE = 80;

export type FurContext = {
  /** Inside a hut or other pocket room. */
  indoors: boolean;
  /** Armed, raiding, duelling, knocked down or answering an alarm. */
  fighting: boolean;
  nearFire: boolean;
  /** Night, snow or blizzard, or the snowy north. */
  cold: boolean;
  /** Inside her own village, or inside the player's camp once she has joined it. */
  atHome: boolean;
};

export const isCold = (o: { night: boolean; weather: Weather; snowyBiome: boolean }) =>
  o.night || o.snowyBiome || o.weather === 'snow' || o.weather === 'blizzard';

/** Indoors always bare; fighting always in pelt; a warm fire beats the cold; otherwise pelt in the cold or away from home. */
export function wearsFur(c: FurContext): boolean {
  if (c.indoors) return false;
  if (c.fighting) return true;
  if (c.nearFire) return false;
  if (c.cold) return true;
  return !c.atHome;
}
