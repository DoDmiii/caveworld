/** Sleeping in a foreign hut's bed: the residents notice and grow suspicious. Engine-free. */

/** Residents inside the hut watched the stranger lie down in their bed. */
export const CAUGHT_REL = -15;
/** Residents came home later and found the bed slept in. */
export const FOUND_REL = -8;
/** Chance that absent residents notice the slept-in bed. */
export const FIND_CHANCE = 0.5;

export type BedTrespass = { noticed: boolean; caught: boolean; relationship: number };

/** foreign: not the player's camp; residents: living inhabitants assigned to the hut; inside: those in the room right now; roll: 0..1. */
export function bedTrespass(o: { foreign: boolean; residents: number; inside: number; roll: number }): BedTrespass {
  if (!o.foreign || o.residents <= 0) return { noticed: false, caught: false, relationship: 0 };
  if (o.inside > 0) return { noticed: true, caught: true, relationship: CAUGHT_REL };
  if (o.roll < FIND_CHANCE) return { noticed: true, caught: false, relationship: FOUND_REL };
  return { noticed: false, caught: false, relationship: 0 };
}
