// Engine-free rules for bound captives working loose at night and quiet rescue scouts from their home village.
/** Progress (0–100) at which a bound captive slips the ropes. */
export const LOOSE_AT = 100;
/** Progress per game minute: unguarded nights take about half a night, days are much slower. */
export const NIGHT_RATE = 0.4;
export const DAY_RATE = 0.06;
/** An awake player or camp warrior this close keeps a captive from loosening the ropes. */
export const GUARD_RANGE = 80;
/** Touching a runner stops the flight; they stay bound. */
export const CATCH_REACH = 24;
/** A runner this far from the camp is home free. */
export const ESCAPE_DIST = 500;
export const RUNNER_SPEED = 52;
/** Game minutes a captive must be held before the home village sends a rescue scout, and between scouts. */
export const RESCUE_DELAY_MIN = 1440;
export const RESCUE_COOLDOWN_MIN = 1440;
export const SCOUT_SPEED = 55;
/** Distance at which the player notices a sneaking scout. */
export const SCOUT_SPOT = 140;

export type EscapeState = {
  /** Rope progress per captive id. */
  progress: Record<string, number>;
  /** Game clock when each captive was first seen bound. */
  since: Record<string, number>;
  /** Next game clock at which a village may send a scout. */
  rescueAt: Record<string, number>;
};
export const EMPTY_ESCAPE: EscapeState = { progress: {}, since: {}, rescueAt: {} };

/** Rope progress gained over `minutes`; guarded captives make none. */
export function loosen(progress: number, minutes: number, night: boolean, guarded: boolean) {
  if (guarded) return progress;
  return Math.min(LOOSE_AT, progress + minutes * (night ? NIGHT_RATE : DAY_RATE));
}
export const isLoose = (progress: number) => progress >= LOOSE_AT;

/** Guarded if an awake player or a standing camp warrior is close. */
export function guarded(c: { x: number; y: number }, player: { x: number; y: number; asleep: boolean } | null, guards: readonly { x: number; y: number }[]) {
  if (player && !player.asleep && Math.hypot(player.x - c.x, player.y - c.y) < GUARD_RANGE) return true;
  return guards.some(g => Math.hypot(g.x - c.x, g.y - c.y) < GUARD_RANGE);
}

/** Keeps `since` in sync with the bound captive list and drops progress of anyone no longer bound. */
export function syncBound(s: EscapeState, bound: readonly string[], clock: number): EscapeState {
  const keep = new Set(bound);
  const since: Record<string, number> = {}, progress: Record<string, number> = {};
  for (const id of bound) { since[id] = s.since[id] ?? clock; if (s.progress[id]) progress[id] = s.progress[id]!; }
  const same = bound.length === Object.keys(s.since).length && bound.every(id => s.since[id] !== undefined) && Object.keys(s.progress).every(id => keep.has(id));
  return same ? s : { ...s, since, progress };
}

/** A village sends a scout at night once a kinsman has been held long enough and its cooldown passed. */
export function rescueDue(s: EscapeState, village: string, heldIds: readonly string[], clock: number, night: boolean, raidActive: boolean) {
  if (!night || raidActive || !heldIds.length) return false;
  if (clock < (s.rescueAt[village] ?? 0)) return false;
  return heldIds.some(id => clock - (s.since[id] ?? clock) >= RESCUE_DELAY_MIN);
}
export const sentRescue = (s: EscapeState, village: string, clock: number): EscapeState => ({ ...s, rescueAt: { ...s.rescueAt, [village]: clock + RESCUE_COOLDOWN_MIN } });

export type RunnerResult = 'caught' | 'escaped' | 'running';
export function runnerStep(r: { x: number; y: number }, camp: { x: number; y: number }, catchers: readonly { x: number; y: number }[]): RunnerResult {
  if (catchers.some(c => Math.hypot(c.x - r.x, c.y - r.y) < CATCH_REACH)) return 'caught';
  return Math.hypot(r.x - camp.x, r.y - camp.y) > ESCAPE_DIST ? 'escaped' : 'running';
}
