// Engine-free village raid rules: champions, respawn timing and autonomous ally target assignment.
import type { Pt } from './combat';

/** Champions are extra characters, one per Nordic village. They can only die through a finisher. */
export const CHAMPION_HP = 90;
export const CHAMPION_DAMAGE = 13;
export const CHAMPION_ALLY_DAMAGE = 15;
export const CHAMPION_SCALE = 1.35;
/** Game minutes until a liberated village rearms: 3.5 game days. */
export const VILLAGE_RESPAWN_MINUTES = 3.5 * 1440;
export const CHAMPION_NAMES = ['Hrafn Eisenbart', 'Ulfgar der Weiße', 'Brynja Frostfaust'] as const;
export const championId = (village: number) => `champion-${village}`;
export const isChampionId = (id: string) => id.startsWith('champion-');

/** Village index → game clock at which the champion fell. */
export type RaidState = Record<string, number>;
export function recordChampionDeath(state: RaidState, village: number, clock: number): RaidState {
  return { ...state, [String(village)]: clock };
}
/** Villages whose rebuilding period has passed; their champion and fallen guards return. */
export function villagesToRespawn(state: RaidState, clock: number): number[] {
  return Object.entries(state).filter(([, at]) => clock >= at + VILLAGE_RESPAWN_MINUTES).map(([v]) => Number(v));
}
export function clearRespawn(state: RaidState, village: number): RaidState {
  const next = { ...state }; delete next[String(village)]; return next;
}
export const championFallen = (state: RaidState, village: number) => String(village) in state;

/** Autonomous combat: each ally picks its own foe, spreading out (max 2 per foe) and preferring threats near the player or itself. */
export const ALLY_SCAN_RANGE = 240;
export type RaidFoe = Pt & { id: string; hostile: boolean; alive: boolean; champion?: boolean };
export function assignAllyTargets<T extends RaidFoe>(allies: (Pt & { id: string })[], foes: T[], player: Pt, focusId?: string): Map<string, T> {
  const live = foes.filter(f => f.alive && f.hostile && Math.hypot(f.x - player.x, f.y - player.y) <= ALLY_SCAN_RANGE);
  const focus = foes.find(f => f.id === focusId && f.alive && Math.hypot(f.x - player.x, f.y - player.y) <= ALLY_SCAN_RANGE);
  if (focus && !live.includes(focus)) live.push(focus);
  const load = new Map<string, number>(), out = new Map<string, T>();
  for (const a of [...allies].sort((x, y) => x.id.localeCompare(y.id))) {
    let best: T | undefined, bs = Infinity;
    for (const f of live) {
      const n = load.get(f.id) ?? 0; if (n >= 2) continue;
      // Score: distance to ally, plus pull toward foes threatening the player; champions draw focus, crowded foes push away.
      const s = Math.hypot(f.x - a.x, f.y - a.y) + Math.hypot(f.x - player.x, f.y - player.y) * 0.5 + n * 60 - (f.champion ? 40 : 0) - (f.id === focusId ? 30 : 0);
      if (s < bs) { bs = s; best = f; }
    }
    if (best) { out.set(a.id, best); load.set(best.id, (load.get(best.id) ?? 0) + 1); }
  }
  return out;
}
