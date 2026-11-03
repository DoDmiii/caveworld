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

/** Put the carried captive down; they stay bound, even inside the camp, until the player decides. */
export function drop(c: Captive, x: number, y: number, _inCamp?: boolean): Captive {
  if (c.state !== 'carried') return c;
  return { ...c, state: 'bound', x: Math.round(x), y: Math.round(y) };
}

/** Manual choice: a bound captive inside the home camp is untied and joins the tribe. */
export function adopt(c: Captive, inCamp: boolean): Captive {
  return inCamp && c.state === 'bound' ? { ...c, state: 'camp' } : c;
}

/** Surrendered or bound people can be executed with the Steinkeil finisher. */
export const canExecute = (c: Captive, wedge: boolean) => wedge && (c.state === 'surrender' || c.state === 'bound');

export const CARRY_SPEED = 50;
