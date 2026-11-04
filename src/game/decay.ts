// Engine-free corpse decay: a severed head rots to a bare, collectable skull.
/** Three full game days (game minutes) until a severed head is a bare skull. */
export const SKULL_DECAY_MINUTES = 3 * 1440;
export type HeadStage = 'fresh' | 'skull' | 'taken';
export function headStage(deathClock: number | undefined, clock: number, taken = false): HeadStage {
  if (taken) return 'taken';
  return deathClock !== undefined && clock - deathClock >= SKULL_DECAY_MINUTES ? 'skull' : 'fresh';
}
