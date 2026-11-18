import { describe, it, expect } from 'vitest';
import { newMusicState, pickTrack, BIOME_SETTLE_MS, BATTLE_HOLD_MS } from '@/game/music';
describe('music', () => {
  it('green valley plays the canopy theme, snow plays the Nordic theme', () => {
    expect(pickTrack(newMusicState(), 1, 'wenjaWest', false)).toBe('valley');
    expect(pickTrack(newMusicState(), 1, 'nordics', false)).toBe('snow');
  });
  it('waits before switching area theme', () => {
    const s = newMusicState(); pickTrack(s, 1, 'wenjaEast', false);
    expect(pickTrack(s, 100, 'nordics', false)).toBe('valley');
    expect(pickTrack(s, 100 + BIOME_SETTLE_MS, 'nordics', false)).toBe('snow');
  });
  it('battle overrides and lingers after the threat', () => {
    const s = newMusicState(); pickTrack(s, 1, 'wenjaWest', true);
    expect(pickTrack(s, BATTLE_HOLD_MS - 10, 'wenjaWest', false)).toBe('battle');
    expect(pickTrack(s, BATTLE_HOLD_MS + 10, 'wenjaWest', false)).toBe('valley');
  });
});
