// Engine-free arson rules: torch ignition, burn phases, heat, foreign rebuilding and costly camp repair.
// world.ts only detects the nearby hut, draws flames/ruins and saves the fire state in the game save.
import type { Stock } from './harvest';
import { VILLAGE_RESPAWN_MINUTES } from './raid';

export type HouseOwner = 'camp' | 'nordic' | 'dragon';
/** One hut that has been set alight. `village` is the FOLK_HOMES index for foreign huts. */
export type Fire = { litAt: number; owner: HouseOwner; village?: number };
export type FireState = Record<string, Fire>;
export const EMPTY_FIRES: FireState = {};

/** Holding the torch to the roof: real milliseconds of standing still. */
export const IGNITE_MS = 1500;
/** Distance from the hut's door point at which the torch reaches the roof. */
export const IGNITE_RANGE = 32;
/** Game minutes: the roof smoulders first, then the full blaze lasts half a game day. */
export const SMOLDER_MINUTES = 30;
export const BLAZE_MINUTES = 720;
/** Ruins keep smoking for a while after the flames die. */
export const RUIN_SMOKE_MINUTES = 240;
/** Foreign villagers need two more game days to rebuild burnt huts. */
export const REBUILD_MINUTES = 2 * 1440;
/** A ruin must cool before the player can clear and rebuild it. */
export const COOL_MINUTES = 60;
/** Standing in the blaze burns. */
export const HEAT_RANGE = 26;
export const HEAT_DAMAGE_PER_SEC = 6;
/** Rebuilding an own hut is expensive and needs the stone axe to clear the charred beams. */
export const REPAIR_COST = { wood: 24, stone: 10, fiber: 12, flint: 2 } as const;

export type FirePhase = 'smolder' | 'blaze' | 'ruin';

export const burnedOutAt = (f: Fire) => f.litAt + SMOLDER_MINUTES + BLAZE_MINUTES;

export function firePhase(f: Fire, clock: number): FirePhase {
  if (clock < f.litAt + SMOLDER_MINUTES) return 'smolder';
  if (clock < burnedOutAt(f)) return 'blaze';
  return 'ruin';
}

export const isBurning = (f: Fire | undefined, clock: number) => !!f && firePhase(f, clock) !== 'ruin';
export const ruinSmoking = (f: Fire, clock: number) => firePhase(f, clock) === 'ruin' && clock < burnedOutAt(f) + RUIN_SMOKE_MINUTES;

/** Only an intact hut catches fire, and only from a torch held in the main hand. */
export function igniteBlock(state: FireState, id: string, torchInMain: boolean): 'no-torch' | 'burning' | 'ruin' | null {
  const f = state[id];
  if (f) return 'smolder' === 'smolder' && f.litAt >= 0 && burnedOutAt(f) > -1 ? (f ? 'burning' : null) : null;
  return torchInMain ? null : 'no-torch';
}

export function ignite(state: FireState, id: string, owner: HouseOwner, clock: number, village?: number): FireState {
  if (state[id]) return state;
  return { ...state, [id]: village === undefined ? { litAt: clock, owner } : { litAt: clock, owner, village } };
}

/** Heat hurts only during the full blaze and only right at the hut. */
export const inHeat = (f: Fire | undefined, clock: number, dist: number) => !!f && firePhase(f, clock) === 'blaze' && dist < HEAT_RANGE;

/**
 * Foreign ruins rebuild two game days after the blaze dies. A defeated village keeps its ruins
 * until it re-arms (see respawnExtra). Camp ruins never rebuild by themselves.
 */
export function rebuildDue(state: FireState, clock: number, defeated: (village: number) => boolean): string[] {
  return Object.entries(state).filter(([, f]) => f.owner !== 'camp' && f.village !== undefined && !defeated(f.village) && clock >= burnedOutAt(f) + REBUILD_MINUTES).map(([id]) => id);
}

/** Extra game minutes a defeated village needs before it returns: two days for rebuilding, and never before the last fire is out. */
export function respawnExtra(state: FireState, village: number, fallAt: number): number {
  const fires = Object.values(state).filter(f => f.owner !== 'camp' && f.village === village);
  if (!fires.length) return 0;
  const base = fallAt + VILLAGE_RESPAWN_MINUTES;
  const due = Math.max(base + REBUILD_MINUTES, ...fires.map(f => burnedOutAt(f) + REBUILD_MINUTES));
  return due - base;
}

/** Removes all fires of one village (its huts stand again). */
export function clearVillageFires(state: FireState, village: number): FireState {
  return Object.fromEntries(Object.entries(state).filter(([, f]) => f.owner === 'camp' || f.village !== village));
}

export function removeFires(state: FireState, ids: readonly string[]): FireState {
  if (!ids.length) return state;
  return Object.fromEntries(Object.entries(state).filter(([id]) => !ids.includes(id)));
}

export type RepairBlock = 'not-ruin' | 'hot' | 'foreign' | 'no-axe' | 'cost';
export function repairBlock(state: FireState, id: string, clock: number, stock: Stock, hasAxe: boolean): RepairBlock | null {
  const f = state[id];
  if (!f || firePhase(f, clock) !== 'ruin') return 'not-ruin';
  if (f.owner !== 'camp') return 'foreign';
  if (clock < burnedOutAt(f) + COOL_MINUTES) return 'hot';
  if (!hasAxe) return 'no-axe';
  return (Object.keys(REPAIR_COST) as (keyof typeof REPAIR_COST)[]).every(k => stock[k] >= REPAIR_COST[k]) ? null : 'cost';
}

/** Pays the repair cost and lets the hut stand again; null when a condition is missing. */
export function repairHut(state: FireState, id: string, clock: number, stock: Stock, hasAxe: boolean): { state: FireState; stock: Stock } | null {
  if (repairBlock(state, id, clock, stock, hasAxe)) return null;
  const next = { ...stock };
  for (const k of Object.keys(REPAIR_COST) as (keyof typeof REPAIR_COST)[]) next[k] -= REPAIR_COST[k];
  return { state: removeFires(state, [id]), stock: next };
}

export const repairCostText = () => `${REPAIR_COST.wood} Holz, ${REPAIR_COST.stone} Stein, ${REPAIR_COST.fiber} Fasern, ${REPAIR_COST.flint} Feuerstein`;
