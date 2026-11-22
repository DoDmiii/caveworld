// Engine-free music rules: which theme fits the moment, plus combat hold/biome hysteresis timings.
import type { Biome } from './biomes';
export type Track = 'valley' | 'valleyNight' | 'river' | 'snow' | 'dragon' | 'desert' | 'jungle' | 'riverNight' | 'snowNight' | 'dragonNight' | 'desertNight' | 'jungleNight' | 'cave' | 'hut' | 'battle' | 'death' | 'pause';
export const BATTLE_HOLD_MS = 5000; // battle music lingers after the last threat
export const BIOME_SETTLE_MS = 3000; // new area/time of day must hold this long before the theme changes
export const FADE_IN_MS = 1800, BATTLE_FADE_MS = 700;
/** Daytime theme per biome. */
export const DAY_TRACK: Record<Biome, Track> = { wenjaWest: 'valley', wenjaEast: 'river', nordics: 'snow', dragon: 'dragon', dry: 'desert', jungle: 'jungle' };
/** Night theme per biome. */
export const NIGHT_TRACK: Partial<Record<Biome, Track>> = { wenjaWest: 'valleyNight', wenjaEast: 'riverNight', nordics: 'snowNight', dragon: 'dragonNight', dry: 'desertNight', jungle: 'jungleNight' };
/** Volume 0..1 from a stored string; default half volume. */
export const DEFAULT_VOLUME = 0.5;
export function parseVolume(v: string | null | undefined): number { const n = v == null || v === '' ? NaN : Number(v); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULT_VOLUME; }
/** Tracks that restart from the beginning whenever they come in. */
export const RESTART_TRACKS: readonly Track[] = ['battle', 'death'];
export function areaTrack(biome: Biome | undefined, night = false, place?: 'cave' | 'hut'): Track | null {
  if (place) return place;
  if (!biome) return null;
  return (night ? NIGHT_TRACK[biome] : undefined) ?? DAY_TRACK[biome];
}
export type MusicMoment = { biome: Biome | undefined; danger: boolean; night?: boolean; paused?: boolean; dead?: boolean; place?: 'cave' | 'hut' | undefined };
export type MusicState = { area: Track | null; pending: Track | null; pendingSince: number; lastDanger: number };
export const newMusicState = (): MusicState => ({ area: null, pending: null, pendingSince: 0, lastDanger: -Infinity });
/** Advances the state and returns the track that should play now (null = silence). Death beats pause beats battle beats area. */
export function pickTrack(st: MusicState, now: number, m: MusicMoment): Track | null {
  if (m.danger) st.lastDanger = now;
  const want = areaTrack(m.biome, !!m.night, m.place);
  if (st.area === null && st.pending === null && st.pendingSince === 0) { st.area = want; st.pendingSince = now; }
  else if (want !== st.area) { if (st.pending !== want) { st.pending = want; st.pendingSince = now; } else if (now - st.pendingSince >= BIOME_SETTLE_MS) { st.area = want; st.pending = null; } }
  else st.pending = null;
  if (m.dead) return 'death';
  if (m.paused) return 'pause';
  return now - st.lastDanger < BATTLE_HOLD_MS ? 'battle' : st.area;
}
