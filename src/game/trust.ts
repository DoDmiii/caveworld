/** Personal milestones; immutable, engine-free and awarded only once per save. */
export type TrustProgress = { done: string[]; since: number; peacefulSince: number; trades: number; watch: number };
export type TrustBook = Record<string, TrustProgress>;
export type TrustEvent = 'joined' | 'meal' | 'hunt' | 'wolf' | 'violence' | 'finisher' | 'weapon' | 'watch' | 'heal' | 'stories' | 'trade' | 'mercy' | 'day';
export const TRUST_STEPS: Record<string, { id: string; label: string }[]> = {
  skorra: [{ id: 'meal', label: 'Gebratenes Fleisch teilen' }, { id: 'hunt', label: 'Gemeinsam jagen und Beute teilen' }, { id: 'peace', label: 'Drei Tage keine Wölfe jagen' }],
  ilvar: [{ id: 'weapon', label: 'Den Speer zurückgeben' }, { id: 'watch', label: 'Eine Nacht gemeinsam Wache halten' }, { id: 'peace', label: 'Tindra unversehrt und Frostheim friedlich lassen' }],
  torvik: [{ id: 'joined', label: 'Ohne Fesseln im Lager aufnehmen' }, { id: 'heal', label: 'Gemeinsam einen Verwundeten versorgen' }, { id: 'stories', label: 'Abends mit Kuruk Geschichten tauschen' }],
  ymra: [{ id: 'trade', label: 'Zwei faire Tauschgeschäfte ohne Gewalt' }, { id: 'mercy', label: 'Auf Lösegeld verzichten' }, { id: 'peace', label: 'Drei Tage Frieden mit Eisfurt (Ruf ab +10)' }],
};
export const newTrustProgress = (clock: number): TrustProgress => ({ done: [], since: clock, peacefulSince: clock, trades: 0, watch: 0 });
export function advanceTrust(pid: string, previous: TrustProgress | undefined, trust: number, event: TrustEvent, clock: number, options: { peace?: boolean; minutes?: number } = {}) {
  const state = previous ? { ...previous, done: [...previous.done] } : newTrustProgress(clock);
  let value = trust;
  const award = (id: string) => { if (TRUST_STEPS[pid]?.some(s => s.id === id) && !state.done.includes(id)) { state.done.push(id); value = Math.min(100, value + 30); } };
  if (event === 'wolf' && pid === 'skorra') { state.peacefulSince = clock; value = Math.max(0, value - 15); }
  if (event === 'violence') { state.peacefulSince = clock; state.trades = 0; }
  if (event === 'finisher' && pid === 'torvik') value = Math.max(0, value - 30);
  if (event === 'meal' && pid === 'skorra') award('meal');
  if (event === 'hunt' && pid === 'skorra' && state.done.includes('meal')) award('hunt');
  if (event === 'weapon' && pid === 'ilvar') award('weapon');
  if (event === 'watch' && pid === 'ilvar' && state.done.includes('weapon')) { state.watch = Math.min(240, state.watch + (options.minutes ?? 0)); if (state.watch >= 240) award('watch'); }
  if (event === 'joined' && pid === 'torvik') award('joined');
  if (event === 'heal' && pid === 'torvik') award('heal');
  if (event === 'stories' && pid === 'torvik') award('stories');
  if (event === 'trade' && pid === 'ymra') { state.trades = Math.min(2, state.trades + 1); if (state.trades === 2) award('trade'); }
  if (event === 'mercy' && pid === 'ymra') award('mercy');
  if (event === 'day') {
    if (pid === 'skorra' && clock - state.peacefulSince >= 3 * 1440) award('peace');
    if (pid === 'ymra') { if (!options.peace) state.peacefulSince = clock; else if (clock - state.peacefulSince >= 3 * 1440) award('peace'); }
    if (pid === 'ilvar' && options.peace && state.done.includes('watch')) award('peace');
  }
  return { state, trust: value, gained: value - trust };
}
export const trustSteps = (pid: string, state?: TrustProgress) => (TRUST_STEPS[pid] ?? []).map(s => ({ ...s, done: state?.done.includes(s.id) ?? false }));