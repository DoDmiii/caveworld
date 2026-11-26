/** Voluntary, non-explicit closeness. No engine, rewards or persistent relationship changes. */
import { sightRange, type Blocker, type Observer } from './events';
import { ARUUN_ADULT_WOMEN } from './aruun-people';

export const CLOSENESS_MS = 3000;
export const CLOSENESS_RANGE = 36;
/** Explicit adult participants, independent of portraits, combat roles and atlas names. */
export const ADULT_WOMEN = new Set([
  'ally-3', 'ally-4', 'ally-5',
  'nordic-w0', 'nordic-w1', 'nordic-w3', 'nordic-w0-g', 'nordic-w1-g',
  'nordic-w3-g', 'nordic-w1-e', 'nordic-w0-e',
  'dragon-w0', 'dragon-w1', 'dragon-w2', 'dragon-w3', 'dragon-w4',
  'desert-w0', 'desert-w1', 'desert-w2', 'desert-w3', 'desert-w4',
  ...ARUUN_ADULT_WOMEN,
]);
/** Beziehung, ab der eine fremde Frau freiwillig zustimmt. */
export const WILLING_RELATIONSHIP = 55;
/** Drachenfrauen finden Wenja- und Nordic-Männer laut Lore besonders anziehend: Sie sind schneller bereit. */
export const DRAGON_WILLING_RELATIONSHIP = 25;
export const isDragonWoman = (id: string) => id.startsWith('dragon-');
export const willingRelationship = (id: string) => (isDragonWoman(id) ? DRAGON_WILLING_RELATIONSHIP : WILLING_RELATIONSHIP);
/** Gleiche Regel wie bisher (keine Zustimmung bei Alarm), nur mit volksabhängiger Schwelle. */
export const isWillingByRelationship = (id: string, relationship: number, alarm: boolean) => relationship >= willingRelationship(id) && !alarm;
/** Sagt dem Spieler, woran es liegt, statt nur abzulehnen. */
export function closenessReluctance(id: string, relationship: number, alarm: boolean): string {
  if (alarm) return 'Das Dorf ist in Alarm · sie hat gerade keinen Sinn für Nähe.';
  const need = willingRelationship(id);
  return relationship < need ? `Sie kennt dich noch zu wenig · Beziehung ${Math.max(0, Math.round(relationship))}/${need}. Grüße sie oder bring ein Geschenk.` : 'Sie möchte gerade keine Nähe.';
}
export type ClosenessContext = {
  adultWoman: boolean; free: boolean; ready: boolean; willing: boolean;
  playerAdult: boolean; playerArmed: boolean; carrying: boolean; inRange: boolean;
  /** Optional: Begründung, wenn sie nicht zustimmt. */
  reluctance?: string | undefined;
};
export function closenessRefusal(c: ClosenessContext): string | null {
  if (!c.playerAdult || !c.adultWoman) return 'Nur zwischen erwachsenen Frauen und der erwachsenen Spielfigur.';
  if (!c.free || !c.ready) return 'Gefangene oder überwältigte Personen sind ausgeschlossen.';
  if (!c.inRange) return 'Außer Reichweite.';
  if (c.playerArmed || c.carrying) return 'Mach zuerst die Hände frei.';
  if (!c.willing) return c.reluctance ?? 'Sie möchte gerade keine Nähe.';
  return null;
}
export function closenessWitnesses(
  target: { id: string; village: string; x: number; y: number; ownTribe: boolean },
  observers: readonly Observer[], night: boolean, blocked?: Blocker,
): Observer[] {
  if (target.ownTribe) return [];
  const range = sightRange({ night, crouching: false });
  return observers.filter(o => o.id !== target.id && o.village === target.village
    && !o.bound && !o.asleep && o.role !== 'child'
    && Math.hypot(o.x - target.x, o.y - target.y) <= range
    && !blocked?.(o.x, o.y, target.x, target.y));
}
/** Segment/rectangle intersection for building and terrain occlusion. */
export function blocksSight(ax: number, ay: number, bx: number, by: number, rect: { x: number; y: number; width: number; height: number }): boolean {
  let lo = 0, hi = 1;
  const axes: [number, number, number, number][] = [[ax, bx - ax, rect.x, rect.x + rect.width], [ay, by - ay, rect.y, rect.y + rect.height]];
  for (const [start, delta, min, max] of axes) {
    if (delta === 0) { if (start < min || start > max) return false; continue; }
    const a = (min - start) / delta, b = (max - start) / delta;
    lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b));
    if (lo > hi) return false;
  }
  return hi > 0.02 && lo < 0.98;
}