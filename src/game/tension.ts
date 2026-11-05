/** Engine-free rules for tense first contact: personal space, shoving, escorting guards and kin protection. */
import type { InteractionId } from './interactions';

/** Distrustful villagers stop and stare once the player is this close. */
export const PERSONAL_SPACE = 40;
/** Pressing closer than this gets the player shoved. */
export const SHOVE_RANGE = 20;
export const SHOVE_SPEED = 260;
export const SHOVE_MS = 250;
export const SHOVE_DAMAGE = 3;
export const SHOVE_COOLDOWN_MS = 1400;
/** Strikes are forgotten after this long without pressing anyone. */
export const STRIKE_MEMORY_MS = 20000;
/** Guards shadow the player at this distance. */
export const ESCORT_DISTANCE = 55;
/** Every warrior this close answers a cry for help. */
export const KIN_ALARM_RADIUS = 280;
/** Warriors attack a captive-carrying player on sight within this range. */
export const CARRY_SIGHT = 220;

export type ShoveStep = 'warn' | 'shove' | 'attack';

/** Escalation per strike: first a warning, then a shove, then violence. A drawn weapon skips the second shove. */
export function shoveStep(strikes: number, armed: boolean): ShoveStep {
  if (strikes <= 1) return 'warn';
  if (strikes === 2 || (strikes === 3 && !armed)) return 'shove';
  return 'attack';
}

/** Strike counter after a new push; old strikes expire. */
export function nextStrikes(prev: { strikes: number; at: number } | undefined, now: number): number {
  if (!prev || now - prev.at > STRIKE_MEMORY_MS) return 1;
  return prev.strikes + 1;
}

/** Wheel actions that make the victim cry out and bring every warrior nearby. */
export const KIN_CRIMES: InteractionId[] = ['intimidate', 'bind', 'carry'];
export const isKinCrime = (id: InteractionId) => KIN_CRIMES.includes(id);

/** Only villagers who don't trust the player guard their space. */
export const guardsSpace = (relationship: number) => relationship < 55;

/** Point the escort walks to: ESCORT_DISTANCE away from the player on its own side. */
export function escortGoal(guard: { x: number; y: number }, player: { x: number; y: number }) {
  const dx = guard.x - player.x, dy = guard.y - player.y, l = Math.max(1, Math.hypot(dx, dy));
  return { x: player.x + dx / l * ESCORT_DISTANCE, y: player.y + dy / l * ESCORT_DISTANCE };
}

/** Picks one escort per village: the closest free warrior. */
export function pickEscort<T extends { id: string; x: number; y: number }>(warriors: readonly T[], player: { x: number; y: number }): T | undefined {
  return [...warriors].sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y) || a.id.localeCompare(b.id))[0];
}
