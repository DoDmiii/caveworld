// Engine-free rules for Nordic villagers who can be overpowered, tied up and carried to the camp.
export type CaptiveState = 'free' | 'surrender' | 'bound' | 'carried' | 'camp';
export type Captive = { id: string; state: CaptiveState; x: number; y: number };

/** A hit makes a free villager surrender; guards without captive frames cannot be taken. */
export function strike(c: Captive, capturable: boolean): Captive {
  return capturable && c.state === 'free' ? { ...c, state: 'surrender' } : c;
}

/** Action key on a nearby villager: surrendered → bound, bound → carried (only one at a time). */
export function interact(c: Captive, carrying: boolean): Captive {
  if (c.state === 'surrender') return { ...c, state: 'bound' };
  if (c.state === 'bound' && !carrying) return { ...c, state: 'carried' };
  return c;
}

/** Put the carried captive down; inside the home camp they join the tribe for good. */
export function drop(c: Captive, x: number, y: number, inCamp: boolean): Captive {
  if (c.state !== 'carried') return c;
  return { ...c, state: inCamp ? 'camp' : 'bound', x: Math.round(x), y: Math.round(y) };
}

export const CARRY_SPEED = 50;
