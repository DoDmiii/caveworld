// Engine-free wound rules: bleeding, limping, danger state and hit impact strength.
export const BLEED_MIN_DAMAGE = 7; // hits this strong can open a bleeding wound
export const BLEED_CHANCE = 0.45;
export const BLEED_DPS = 1.2;
export const BLEED_MS = 14000;
export const BANDAGE_BLEED_MS = 4000; // a carried Heilwickel stops bleeding fast
export const LIMP_HP = 30;
export const LIMP_FACTOR = 0.75;
export const DANGER_HP = 25;

/** Returns the new bleed end time after taking a hit. */
export function woundFrom(bleedUntil: number, damage: number, roll: number, now: number, bandaged: boolean): number {
  if (damage < BLEED_MIN_DAMAGE || roll >= BLEED_CHANCE) return bandaged ? Math.min(bleedUntil, now + BANDAGE_BLEED_MS) : bleedUntil;
  return Math.max(bleedUntil, now + (bandaged ? BANDAGE_BLEED_MS : BLEED_MS));
}

export const isBleeding = (bleedUntil: number, now: number) => now < bleedUntil;
export const bleedDamage = (bleedUntil: number, now: number, dt: number) => (isBleeding(bleedUntil, now) ? BLEED_DPS * dt : 0);
export const limpFactor = (hp: number) => (hp < LIMP_HP ? LIMP_FACTOR : 1);
export const inDanger = (hp: number) => hp > 0 && hp < DANGER_HP;

/** Hitstop length in ms; heavier blows freeze longer. */
export const hitstopMs = (damage: number, finisher = false) => (finisher ? 160 : Math.min(110, 40 + damage * 2));
