import { describe, it, expect } from 'vitest';
import { tickThirst, heatLevel, canDrinkAt, WATERHOLES, thirstDamage } from './desert';
import { weatherAt } from './weather';

describe('desert', () => {
  it('heat only applies in the dry land by day', () => {
    expect(heatLevel({ biome: 'wenjaWest', minutesOfDay: 720, weather: 'clear', shaded: false })).toBe(0);
    expect(heatLevel({ biome: 'dry', minutesOfDay: 0, weather: 'heat', shaded: false })).toBe(0);
    expect(heatLevel({ biome: 'dry', minutesOfDay: 720, weather: 'heat', shaded: false })).toBe(1);
  });
  it('shade cuts heat to a quarter', () => {
    expect(heatLevel({ biome: 'dry', minutesOfDay: 720, weather: 'heat', shaded: true })).toBe(0.25);
  });
  it('heat makes thirst drop four times faster', () => {
    const mild = 100 - tickThirst(100, { seconds: 10, heat: 0, running: false, drinking: false });
    const hot = 100 - tickThirst(100, { seconds: 10, heat: 1, running: false, drinking: false });
    expect(hot).toBeCloseTo(mild * 4);
  });
  it('drinking at a waterhole refills thirst', () => {
    const w = WATERHOLES[0];
    expect(canDrinkAt(w.x, w.y)).toBe(true);
    expect(tickThirst(10, { seconds: 1, heat: 1, running: false, drinking: true })).toBe(35);
  });
  it('dehydration hurts only at zero', () => {
    expect(thirstDamage(1, 2)).toBe(0);
    expect(thirstDamage(0, 2)).toBe(1);
  });
  it('dry region weather only uses clear, heat and sandstorm', () => {
    for (let c = 0; c < 480 * 60; c += 480) expect(['clear', 'heat', 'sandstorm']).toContain(weatherAt('dry', c));
  });
});
