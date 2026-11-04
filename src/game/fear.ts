/** Engine-free fear rules: a second axis next to relationship. Fear breaks morale and extorts tribute, but breeds revenge. */
export type FearState = { fear: Record<string, number>; tributeDay: Record<string, number>; grudge: Record<string, number>; day: number };
export const EMPTY_FEAR: FearState = { fear: {}, tributeDay: {}, grudge: {}, day: 0 };

export type FearEvent = 'kill' | 'finisher' | 'execution' | 'champion' | 'totem';
export const FEAR_GAIN: Record<FearEvent, number> = { kill: 8, finisher: 14, execution: 18, champion: 30, totem: 12 };
/** Fear fades by this much per game day. */
export const FEAR_DECAY_PER_DAY = 6;
/** Night adds this much to effective fear (courage sinks in the dark). */
export const NIGHT_FEAR = 15;
/** Warriors break and flee instead of fighting at this effective fear. */
export const MORALE_BREAK = 70;
export const TRIBUTE_MIN_FEAR = 50;
export const TRIBUTE_REL_COST = -12;
/** After this many extorted tributes the village swears revenge and sends a war party. */
export const GRUDGE_REVENGE = 3;

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
export const fearOf = (s: FearState, vk: string) => s.fear[vk] ?? 0;

export function addFear(s: FearState, vk: string, ev: FearEvent): FearState {
  return { ...s, fear: { ...s.fear, [vk]: clamp(fearOf(s, vk) + FEAR_GAIN[ev]) } };
}
/** Applies decay for every game day passed since the last call. */
export function decayFear(s: FearState, day: number): FearState {
  const days = day - s.day;
  if (days <= 0) return s;
  const fear: Record<string, number> = {};
  for (const [k, v] of Object.entries(s.fear)) fear[k] = clamp(v - days * FEAR_DECAY_PER_DAY);
  return { ...s, fear, day };
}
export const effectiveFear = (fear: number, night: boolean) => fear + (night ? NIGHT_FEAR : 0);
export const moraleBreaks = (fear: number, night: boolean) => effectiveFear(fear, night) >= MORALE_BREAK;

export function fearTier(fear: number): 'keine' | 'unruhig' | 'verängstigt' | 'in Panik' {
  if (fear >= MORALE_BREAK) return 'in Panik';
  if (fear >= TRIBUTE_MIN_FEAR) return 'verängstigt';
  if (fear >= 20) return 'unruhig';
  return 'keine';
}

export const canDemandTribute = (s: FearState, vk: string, day: number) =>
  fearOf(s, vk) >= TRIBUTE_MIN_FEAR && s.tributeDay[vk] !== day;

export type TributeResult = { state: FearState; cooked: number; flint: number; revenge: boolean };
/** Once per game day per village. Pays more the more afraid they are; every payment feeds the grudge. */
export function demandTribute(s: FearState, vk: string, day: number): TributeResult | null {
  if (!canDemandTribute(s, vk, day)) return null;
  const f = fearOf(s, vk), g = (s.grudge[vk] ?? 0) + 1, revenge = g >= GRUDGE_REVENGE;
  return {
    state: { ...s, tributeDay: { ...s.tributeDay, [vk]: day }, grudge: { ...s.grudge, [vk]: revenge ? 0 : g } },
    cooked: 1 + Math.floor(f / 25), flint: f >= 75 ? 2 : 1, revenge,
  };
}
