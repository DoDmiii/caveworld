import { describe, it, expect } from 'vitest';
import { weatherAt, weatherColdFactor, fireStrength, WEATHER_SPAN } from '@/game/weather';

describe('Wetter', () => {
  it('Norden kennt nur Klar, Schnee und Blizzard; Süden nur Klar, Regen, Gewitter', () => {
    for (let i = 0; i < 200; i++) {
      expect(['clear', 'snow', 'blizzard']).toContain(weatherAt('north', i * WEATHER_SPAN));
      expect(['clear', 'rain', 'thunder']).toContain(weatherAt('temperate', i * WEATHER_SPAN));
    }
  });
  it('gleiche Uhrzeit ergibt nach Reload dasselbe Wetter', () => {
    expect(weatherAt('north', 12345)).toBe(weatherAt('north', 12345));
  });
  it('der erste Spieltag beginnt im Lager klar', () => { expect(weatherAt('temperate', 504)).toBe('clear'); });
  it('Unterstand mildert den Blizzard', () => {
    expect(weatherColdFactor('blizzard', false)).toBe(2);
    expect(weatherColdFactor('blizzard', true)).toBe(1.25);
  });
  it('Regen schwächt ein offenes Feuer, ein Dach schützt es', () => {
    expect(fireStrength('rain', false)).toBe(0.5);
    expect(fireStrength('rain', true)).toBe(1);
  });
});
