/** Pregnancy, birth, real vs. social fathers and cuckoo suspicion. Engine-free. */
export type Hair = 'blond' | 'dunkel' | 'schwarz';
export type Pregnancy = { father: string; social?: string | undefined; day: number };
export type Child = { id: string; name: string; mother: string; father: string; social?: string | undefined; born: number; hair: Hair; girl?: boolean | undefined };
export type ReproState = { pregnant: Record<string, Pregnancy>; children: Child[]; day: number };
export const EMPTY_REPRO: ReproState = { pregnant: {}, children: [], day: -1 };

export const PLAYER = 'player';
export const CONCEIVE_CHANCE = 0.5;
export const PARTNER_CHANCE = 0.15;
export const GESTATION_DAYS = 3;
/** Suspicion at or above this when a foreign-looking child arrives exposes the cuckoo. */
export const EXPOSE_AT = 50;
export const DOUBT_SUSPICION = 70;

/** Name lists alternate boy/girl, so an odd index is a girl. */
export const NAMES: Record<string, string[]> = {
  nordic: ['Keno', 'Alva', 'Brann', 'Sigra', 'Torin', 'Yrsa', 'Haki', 'Runa'],
  dragon: ['Hu', 'Lin', 'Khao', 'Toma', 'Yuk', 'Hiko', 'Dorin', 'Neya'],
};
export const tribeOf = (id: string) => (id === PLAYER ? 'wenja' : id.startsWith('dragon') ? 'dragon' : 'nordic');

/** Nordics are strictly blond; Wenja fathers give dark curls, dragon folk black hair. */
export function hairFor(mother: string, father: string): Hair {
  const f = tribeOf(father), m = tribeOf(mother);
  if (f === 'wenja' || m === 'wenja') return 'dunkel';
  if (f === 'dragon' || m === 'dragon') return 'schwarz';
  return 'blond';
}
export const looksForeign = (c: Pick<Child, 'mother' | 'father' | 'social'>) =>
  !!c.social && hairFor(c.mother, c.father) !== hairFor(c.mother, c.social);

/** A completed moment may start a pregnancy; never twice at once. */
export function conceive(s: ReproState, woman: string, father: string, social: string | undefined, day: number, roll: number, chance = CONCEIVE_CHANCE): ReproState {
  if (s.pregnant[woman] || roll >= chance) return s;
  return { ...s, pregnant: { ...s.pregnant, [woman]: { father, social, day } } };
}

export type Birth = { child: Child; cuckoo: boolean; foreign: boolean };
/** Advance to `day`: partners may conceive, due pregnancies are born. */
export function advanceDay(s: ReproState, day: number, couples: Record<string, string | undefined>, rand: () => number): { state: ReproState; births: Birth[] } {
  if (day <= s.day) return { state: s, births: [] };
  let next: ReproState = { ...s, day };
  if (s.day >= 0) for (const [w, p] of Object.entries(couples)) if (p) next = conceive(next, w, p, p, day, rand(), PARTNER_CHANCE);
  const births: Birth[] = [];
  const pregnant = { ...next.pregnant };
  for (const [mother, preg] of Object.entries(next.pregnant)) {
    if (day - preg.day < GESTATION_DAYS) continue;
    delete pregnant[mother];
    const tribe = tribeOf(mother) === 'dragon' ? 'dragon' : 'nordic', list = NAMES[tribe]!;
    const n = next.children.filter(c => tribeOf(c.mother) === tribeOf(mother)).length;
    const child: Child = { id: `child-${mother}-${day}`, name: list[n % list.length]!, mother, father: preg.father, social: preg.social, born: day, hair: hairFor(mother, preg.father), girl: n % list.length % 2 === 1 };
    births.push({ child, cuckoo: !!preg.social && preg.social !== preg.father, foreign: looksForeign(child) });
  }
  next = { ...next, pregnant, children: [...next.children, ...births.map(b => b.child)] };
  return { state: next, births };
}

/** How the social father reacts: foreign looks + prior suspicion expose; otherwise doubt grows. */
export function birthSuspicion(b: Birth, suspicion: number): { suspicion: number; exposed: boolean } {
  if (!b.foreign) return { suspicion, exposed: false };
  if (suspicion >= EXPOSE_AT) return { suspicion: 100, exposed: true };
  return { suspicion: Math.max(suspicion, DOUBT_SUSPICION), exposed: false };
}

const HAIR_TEXT: Record<Hair, string> = { blond: 'hellblondem Flaum', dunkel: 'dunklen Locken', schwarz: 'schwarzem Haar' };
export function reproLabels(s: ReproState, id: string, day: number, nameOf: (id: string) => string): string[] {
  const out: string[] = [];
  const p = s.pregnant[id];
  if (p) out.push(`Erwartet ein Kind (Tag ${Math.min(GESTATION_DAYS, day - p.day + 1)}/${GESTATION_DAYS})${p.father === PLAYER && p.social ? ' · von dir' : p.father === PLAYER ? ' · dein Kind' : ''}`);
  for (const c of s.children) {
    const age = day - c.born, ageText = age <= 0 ? 'neugeboren' : `${age} ${age === 1 ? 'Tag' : 'Tage'} alt`;
    const mine = c.father === PLAYER;
    if (c.mother === id) out.push(`Mutter von ${c.name} (${ageText}, mit ${HAIR_TEXT[c.hair]})${mine ? ' · dein Kind' : ''}`);
    else if (c.social === id) out.push(`Vater von ${c.name} (${ageText})${c.father !== id ? ' · glaubt er' : ''}`);
  }
  void nameOf;
  return out;
}
