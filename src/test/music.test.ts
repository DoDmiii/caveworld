import { describe, it, expect } from 'vitest';
import { newMusicState, pickTrack, BIOME_SETTLE_MS, BATTLE_HOLD_MS, type MusicMoment } from '@/game/music';
const at = (biome: MusicMoment['biome'], extra: Partial<MusicMoment> = {}): MusicMoment => ({ biome, danger: false, ...extra });
const first = (m: MusicMoment) => pickTrack(newMusicState(), 1, m);
describe('music', () => {
  it('each area plays its own daytime theme', () => {
    expect(first(at('wenjaWest'))).toBe('valley');
    expect(first(at('wenjaEast'))).toBe('river');
    expect(first(at('nordics'))).toBe('snow');
    expect(first(at('dragon'))).toBe('dragon');
    expect(first(at('dry'))).toBe('desert');
    expect(first(at('jungle'))).toBe('jungle');
  });
  it('the green valley switches to Moonlit Canopy at night, other areas keep their theme for now', () => {
    expect(first(at('wenjaWest', { night: true }))).toBe('valleyNight');
    expect(first(at('wenjaEast', { night: true }))).toBe('valleyNight');
    expect(first(at('dragon', { night: true }))).toBe('dragon');
    expect(first(at('dry', { night: true }))).toBe('desert');
  });
  it('waits before switching area theme', () => {
    const s = newMusicState(); pickTrack(s, 1, at('wenjaEast'));
    expect(pickTrack(s, 100, at('nordics'))).toBe('river');
    expect(pickTrack(s, 100 + BIOME_SETTLE_MS, at('nordics'))).toBe('snow');
  });
  it('battle overrides and lingers after the threat', () => {
    const s = newMusicState(); pickTrack(s, 1, at('wenjaWest', { danger: true }));
    expect(pickTrack(s, BATTLE_HOLD_MS - 10, at('wenjaWest'))).toBe('battle');
    expect(pickTrack(s, BATTLE_HOLD_MS + 10, at('wenjaWest'))).toBe('valley');
  });
  it('pause plays Shadows on Stone, even during a fight', () => {
    expect(first(at('dragon', { paused: true }))).toBe('pause');
    expect(first(at('dragon', { paused: true, danger: true }))).toBe('pause');
  });
  it('death plays The Last Hearth over everything', () => {
    expect(first(at('wenjaWest', { dead: true, paused: true, danger: true }))).toBe('death');
  });
});
