// Engine-free music rules: which theme fits the moment, plus combat hold/biome hysteresis timings.
import type { Biome } from './biomes';
export type Track = 'valley' | 'valleyNight' | 'river' | 'snow' | 'dragon' | 'desert' | 'jungle' | 'battle' | 'death' | 'pause';
export const BATTLE_HOLD_MS = 5000; // battle music lingers after the last threat
export const BIOME_SETTLE_MS = 3000; // new area/time of day must hold this long before the theme changes
export const FADE_IN_MS = 1800, BATTLE_FADE_MS = 700;
/** Daytime theme per biome. */
export const DAY_TRACK: Record<Biome, Track> = { wenjaWest: 'valley', wenjaEast: 'river', nordics: 'snow', dragon: 'dragon', dry: 'desert', jungle: 'jungle' };
/** Night themes; biomes without an entry keep their daytime theme until their night song arrives. */
export const NIGHT_TRACK: Partial<Record<Biome, Track>> = { wenjaWest: 'valleyNight', wenjaEast: 'valleyNight' };
/** Tracks that restart from the beginning whenever they come in. */
export const RESTART_TRACKS: readonly Track[] = ['battle', 'death'];
export function areaTrack(biome: Biome | undefined, night = false): Track | null {
  if (!biome) return null;
  return (night ? NIGHT_TRACK[biome] : undefined) ?? DAY_TRACK[biome];
}
export type MusicMoment = { biome: Biome | undefined; danger: boolean; night?: boolean; paused?: boolean; dead?: boolean };
export type MusicState = { area: Track | null; pending: Track | null; pendingSince: number; lastDanger: number };
export const newMusicState = (): MusicState => ({ area: null, pending: null, pendingSince: 0, lastDanger: -Infinity });
/** Advances the state and returns the track that should play now (null = silence). Death beats pause beats battle beats area. */
export function pickTrack(st: MusicState, now: number, m: MusicMoment): Track | null {
  if (m.danger) st.lastDanger = now;
  const want = areaTrack(m.biome, !!m.night);
  if (st.area === null && st.pending === null && st.pendingSince === 0) { st.area = want; st.pendingSince = now; }
  else if (want !== st.area) { if (st.pending !== want) { st.pending = want; st.pendingSince = now; } else if (now - st.pendingSince >= BIOME_SETTLE_MS) { st.area = want; st.pending = null; } }
  else st.pending = null;
  if (m.dead) return 'death';
  if (m.paused) return 'pause';
  return now - st.lastDanger < BATTLE_HOLD_MS ? 'battle' : st.area;
}
