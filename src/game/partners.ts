/** Village couples, seduction, secret affairs and jealousy. Engine-free; no rewards or offspring yet. */
export type CouplesState = {
  /** Woman id -> seduction progress toward the player (0-100). */
  lure: Record<string, number>;
  /** Woman id -> number of secret, unseen affairs with the player. */
  affairs: Record<string, number>;
  /** Partner id -> suspicion (0-100). At 100 he confronts the player. */
  suspicion: Record<string, number>;
  /** Women whose couple was broken by discovery or the partner's death. */
  broken: string[];
};
export const EMPTY_COUPLES: CouplesState = { lure: {}, affairs: {}, suspicion: {}, broken: [] };

/** Fixed couples: woman -> partner. */
export const COUPLES: Record<string, string> = {
  'nordic-w1': 'nordic-m2',      // Frenja & Eskir
  'nordic-w0-g': 'nordic-m0-g',  // Hallvi & Valdrik
  'nordic-w1-g': 'nordic-m2-g',  // Isvane & Hildar
  'nordic-w1-e': 'nordic-m0-e',  // Nevra & Felvir
  'nordic-w0-e': 'nordic-m2-e',  // Silra & Vindir
  'dragon-w0': 'dragon-m0',
  'dragon-w1': 'dragon-m1',
};
export const LURE_NEEDED = 40;
export const GIFT_LURE = 20;
export const GREET_LURE = 5;
export const GOSSIP_SUSPICION = 35;
export const SECRET_SUSPICION = 10;
export const CONFRONT_AT = 100;

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/** Current partner, or undefined if single, broken up or the partner is dead. */
export function partnerOf(s: CouplesState, woman: string, isAlive: (id: string) => boolean = () => true): string | undefined {
  const p = COUPLES[woman];
  return p && !s.broken.includes(woman) && isAlive(p) ? p : undefined;
}
export function womanOf(partner: string): string | undefined {
  return Object.keys(COUPLES).find(w => COUPLES[w] === partner);
}
export function addLure(s: CouplesState, woman: string, amount: number): CouplesState {
  if (!COUPLES[woman]) return s;
  return { ...s, lure: { ...s.lure, [woman]: clamp((s.lure[woman] ?? 0) + amount) } };
}
/** Refusal for a partnered woman who is not yet seduced; null when she would risk it. */
export function seductionRefusal(s: CouplesState, woman: string, partnerName: string | undefined, isAlive?: (id: string) => boolean): string | null {
  if (!partnerOf(s, woman, isAlive)) return null;
  const lure = s.lure[woman] ?? 0;
  return lure >= LURE_NEEDED ? null : `Sie gehört zu ${partnerName ?? 'einem anderen'} · erst Geschenke und Aufmerksamkeit (${lure}/${LURE_NEEDED}).`;
}

export type WitnessReaction = 'rage' | 'gossip' | 'protest';
/** The partner flies into rage; other villagers gossip about a taken woman, or just protest. */
export function witnessReaction(s: CouplesState, woman: string, witness: string, isAlive?: (id: string) => boolean): WitnessReaction {
  const partner = partnerOf(s, woman, isAlive);
  if (!partner) return 'protest';
  return witness === partner ? 'rage' : 'gossip';
}
export type DiscoveryResult = { state: CouplesState; rage: boolean; confront: string | undefined };
/** Apply what the witnesses saw. Rage breaks the couple; gossip feeds the partner's suspicion. */
export function discover(s: CouplesState, woman: string, reactions: readonly WitnessReaction[], isAlive?: (id: string) => boolean): DiscoveryResult {
  const partner = partnerOf(s, woman, isAlive);
  if (!partner) return { state: s, rage: false, confront: undefined };
  if (reactions.includes('rage')) return { state: { ...s, broken: [...s.broken, woman], suspicion: { ...s.suspicion, [partner]: CONFRONT_AT } }, rage: true, confront: partner };
  const gossip = reactions.filter(r => r === 'gossip').length;
  if (!gossip) return { state: s, rage: false, confront: undefined };
  const sus = clamp((s.suspicion[partner] ?? 0) + gossip * GOSSIP_SUSPICION);
  return { state: { ...s, suspicion: { ...s.suspicion, [partner]: sus } }, rage: false, confront: sus >= CONFRONT_AT ? partner : undefined };
}
/** An unseen moment becomes a secret affair; the partner only grows a little uneasy. */
export function secretAffair(s: CouplesState, woman: string, isAlive?: (id: string) => boolean): { state: CouplesState; confront: string | undefined } {
  const partner = partnerOf(s, woman, isAlive);
  if (!partner) return { state: s, confront: undefined };
  const sus = clamp((s.suspicion[partner] ?? 0) + SECRET_SUSPICION);
  return { state: { ...s, affairs: { ...s.affairs, [woman]: (s.affairs[woman] ?? 0) + 1 }, suspicion: { ...s.suspicion, [partner]: sus } }, confront: sus >= CONFRONT_AT ? partner : undefined };
}
export function relationLabel(s: CouplesState, id: string, nameOf: (id: string) => string, isAlive?: (id: string) => boolean): string | undefined {
  const partner = partnerOf(s, id, isAlive);
  if (partner) return `Gefährtin von ${nameOf(partner)}${(s.affairs[id] ?? 0) > 0 ? ' · heimliche Affäre mit dir' : ''}`;
  const woman = womanOf(id);
  if (woman && partnerOf(s, woman, () => true) === id && !s.broken.includes(woman)) {
    const sus = s.suspicion[id] ?? 0;
    return `Gefährte von ${nameOf(woman)}${sus >= 70 ? ' · ahnt etwas' : sus >= 30 ? ' · misstrauisch' : ''}`;
  }
  if (COUPLES[id] && s.broken.includes(id)) return 'Ihre Verbindung ist zerbrochen';
  return undefined;
}
