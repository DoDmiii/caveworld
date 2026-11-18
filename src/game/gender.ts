/** Engine-free sex lookup for HUD labels: actor ids and profile ids. */
import { ADULT_WOMEN } from './bonding';
const WOMEN_PROFILES = new Set(['orka', 'ura', 'nuka', 'ymra', 'skorra']);
export type Sex = 'f' | 'm';
export function sexOf(id: string): Sex | undefined {
  if (id.startsWith('child')) return undefined;
  return ADULT_WOMEN.has(id) || WOMEN_PROFILES.has(id) || /-w\d/.test(id) ? 'f' : 'm';
}
export const sexMark = (id: string) => { const s = sexOf(id); return s === 'f' ? ' ♀' : s === 'm' ? ' ♂' : ''; };
/** "Frau der Wenja" / "Mann aus Frostheim". */
export function sexLine(id: string, origin: string) {
  const s = sexOf(id); if (!s) return origin;
  const who = s === 'f' ? 'Frau' : 'Mann';
  return origin === 'Deine Sippe' ? `${who} deiner Sippe` : `${who} aus ${origin}`;
}
