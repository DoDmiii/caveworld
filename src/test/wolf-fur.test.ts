import { describe, expect, it } from 'vitest';
import { wearsFur, isCold, isWolfHunter, bareTex, type FurContext } from '@/game/wolf-fur';

const calm: FurContext = { indoors: false, fighting: false, nearFire: false, cold: false, atHome: true };

describe('wolf hunters pelt', () => {
  it('Yozora, Yuki and Kasumi are the three wolf hunters', () => {
    expect(['dragon-w2', 'dragon-w3', 'dragon-w4'].every(isWolfHunter)).toBe(true);
    expect(isWolfHunter('dragon-w0')).toBe(false);
    expect(bareTex('dragon-w3')).toBe('dragon-w3-bare');
  });
  it('without pelt at home by day', () => expect(wearsFur(calm)).toBe(false));
  it('pelt outside the village', () => expect(wearsFur({ ...calm, atHome: false })).toBe(true));
  it('pelt in the cold, even at home', () => expect(wearsFur({ ...calm, cold: true })).toBe(true));
  it('a warm fire lets her take it off in the cold', () => expect(wearsFur({ ...calm, cold: true, nearFire: true, atHome: false })).toBe(false));
  it('pelt when fighting, even by the fire', () => expect(wearsFur({ ...calm, fighting: true, nearFire: true })).toBe(true));
  it('never indoors, even in a fight', () => expect(wearsFur({ ...calm, indoors: true, fighting: true, cold: true })).toBe(false));
  it('night, snow, blizzard and the north count as cold', () => {
    expect(isCold({ night: true, weather: 'clear', snowyBiome: false })).toBe(true);
    expect(isCold({ night: false, weather: 'snow', snowyBiome: false })).toBe(true);
    expect(isCold({ night: false, weather: 'blizzard', snowyBiome: false })).toBe(true);
    expect(isCold({ night: false, weather: 'clear', snowyBiome: true })).toBe(true);
    expect(isCold({ night: false, weather: 'rain', snowyBiome: false })).toBe(false);
  });
});
