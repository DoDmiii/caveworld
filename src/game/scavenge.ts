// Engine-free scavenger rules: wolves smell fresh corpses and feed on them until the flesh is gone.
import { SKULL_DECAY_MINUTES } from './decay';

/** Wolves smell a corpse from this far (px). */
export const SCAVENGE_SMELL = 420;
/** At most this many wolves feed on one corpse. */
export const MAX_FEEDERS = 3;
/** Wolves reach a corpse when this close (px). */
export const FEED_REACH = 16;

export type Carcass = { id: string; x: number; y: number; deathClock: number };

/** Flesh lasts as long as the head stays fresh; afterwards only bones remain. */
export const isFresh = (c: Carcass, clock: number) => clock - c.deathClock < SKULL_DECAY_MINUTES;

/** Nearest fresh corpse within smell range that still has room for another feeder. */
export function pickCarcass(wolf: { x: number; y: number }, corpses: readonly Carcass[], clock: number, feeders: Readonly<Record<string, number>>): Carcass | undefined {
  let best: Carcass | undefined, bd = SCAVENGE_SMELL;
  for (const c of corpses) {
    if (!isFresh(c, clock) || (feeders[c.id] ?? 0) >= MAX_FEEDERS) continue;
    const d = Math.hypot(c.x - wolf.x, c.y - wolf.y);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}
