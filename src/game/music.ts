// Engine-free music rules: which theme fits the moment, plus combat hold/biome hysteresis timings.
import type { Biome } from './biomes';
export type Track = 'valley' | 'snow' | 'battle';
export const BATTLE_HOLD_MS = 5000; // battle music lingers after the last threat
export const BIOME_SETTLE_MS = 3000; // new area must hold this long before the theme changes
export const FADE_IN_MS = 1800, BATTLE_FADE_MS = 700;
export function areaTrack(biome: Biome | undefined): Track | null {
  return biome === 'wenjaWest' || biome === 'wenjaEast' ? 'valley' : biome === 'nordics' ? 'snow' : null;
}
export type MusicState = { area: Track | null; pending: Track | null; pendingSince: number; lastDanger: number };
export const newMusicState = (): MusicState => ({ area: null, pending: null, pendingSince: 0, lastDanger: -Infinity });
/** Advances the state and returns the track that should play now (null = silence). */
export function pickTrack(st: MusicState, now: number, biome: Biome | undefined, danger: boolean): Track | null {
  if (danger) st.lastDanger = now;
  const want = areaTrack(biome);
  if (st.area === null && st.pending === null && st.pendingSince === 0) { st.area = want; st.pendingSince = now; }
  else if (want !== st.area) { if (st.pending !== want) { st.pending = want; st.pendingSince = now; } else if (now - st.pendingSince >= BIOME_SETTLE_MS) { st.area = want; st.pending = null; } }
  else st.pending = null;
  return now - st.lastDanger < BATTLE_HOLD_MS ? 'battle' : st.area;
}
