import { describe, it, expect } from 'vitest';
import { newMusicState, pickTrack, parseVolume, BIOME_SETTLE_MS, BATTLE_HOLD_MS, type MusicMoment } from '@/game/music';
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
  it('every area has its own night song', () => {
    expect(first(at('wenjaWest', { night: true }))).toBe('valleyNight');
    expect(first(at('wenjaEast', { night: true }))).toBe('riverNight');
    expect(first(at('nordics', { night: true }))).toBe('snowNight');
    expect(first(at('dragon', { night: true }))).toBe('dragonNight');
    expect(first(at('dry', { night: true }))).toBe('desertNight');
    expect(first(at('jungle', { night: true }))).toBe('jungleNight');
  });
  it('caves and huts have their own songs, day or night', () => {
    expect(first(at('nordics', { place: 'cave', night: true }))).toBe('cave');
    expect(first(at('dry', { place: 'hut' }))).toBe('hut');
  });
  it('volume defaults to half and stays within 0..1', () => {
    expect(parseVolume(null)).toBe(0.5);
    expect(parseVolume('0.2')).toBe(0.2);
    expect(parseVolume('3')).toBe(1);
    expect(parseVolume('x')).toBe(0.5);
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
