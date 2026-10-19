import { describe, it, expect } from 'vitest';
import {
  START_MINUTES, MINUTES_PER_DAY, clockOf, formatMinutes, advanceClock, daylight, isNight, skyTint,
  tickHunger, ambientTemp, tickWarmth, survivalDamage, COMFORT_TEMP,
} from '@/game/survival';

describe('Uhr', () => {
  it('startet an Tag 1 um 08:24', () => {
    const c = clockOf(START_MINUTES);
    expect(c.day).toBe(1); expect(formatMinutes(c.minutesOfDay)).toBe('08:24');
  });
  it('rollt über Mitternacht auf den nächsten Tag', () => {
    const c = clockOf(MINUTES_PER_DAY + 30);
    expect(c.day).toBe(2); expect(formatMinutes(c.minutesOfDay)).toBe('00:30');
  });
  it('ein Spieltag dauert 720 echte Sekunden', () => {
    expect(advanceClock(0, 720)).toBe(MINUTES_PER_DAY);
  });
});

describe('Tageslicht', () => {
  it('Mittag hell, Mitternacht dunkel', () => {
    expect(daylight(12 * 60)).toBe(1); expect(daylight(0)).toBe(0);
    expect(isNight(12 * 60)).toBe(false); expect(isNight(2 * 60)).toBe(true);
  });
  it('Dämmerung liegt dazwischen', () => {
    const d = daylight(20 * 60);
    expect(d).toBeGreaterThan(0.05); expect(d).toBeLessThan(0.7);
  });
  it('Dunkelheit wächst von Tag zu Nacht', () => {
    expect(skyTint(12 * 60).a).toBe(0);
    expect(skyTint(2 * 60).a).toBeGreaterThan(skyTint(20 * 60).a);
  });
});

describe('Hunger', () => {
  it('sinkt und bleibt bei 0', () => {
    expect(tickHunger(100, 100)).toBeCloseTo(90);
    expect(tickHunger(1, 1000)).toBe(0);
  });
});

describe('Kälte', () => {
  it('Nächte sind kälter als Tage, Schneegebirge kälter als Tal', () => {
    expect(ambientTemp('wenjaWest', 2 * 60)).toBeLessThan(ambientTemp('wenjaWest', 12 * 60));
    expect(ambientTemp('nordics', 12 * 60)).toBeLessThan(ambientTemp('wenjaWest', 12 * 60));
  });
  it('Wärme sinkt unter der Komfortgrenze', () => {
    expect(tickWarmth(100, { ambient: COMFORT_TEMP - 10, nearFire: false, seconds: 10 })).toBeLessThan(100);
  });
  it('Feuer wärmt, auch bei Frost', () => {
    expect(tickWarmth(20, { ambient: -15, nearFire: true, seconds: 5 })).toBeGreaterThan(20);
  });
  it('mildes Wetter erholt sich langsam', () => {
    expect(tickWarmth(50, { ambient: 15, nearFire: false, seconds: 10 })).toBeGreaterThan(50);
  });
  it('Isolierung bremst den Verlust', () => {
    const naked = tickWarmth(100, { ambient: -10, nearFire: false, seconds: 10 });
    const furs = tickWarmth(100, { ambient: -10, nearFire: false, seconds: 10, insulation: 0.5 });
    expect(furs).toBeGreaterThan(naked);
  });
  it('wird nie negativ oder über 100', () => {
    expect(tickWarmth(1, { ambient: -50, nearFire: false, seconds: 1000 })).toBe(0);
    expect(tickWarmth(99, { ambient: 20, nearFire: true, seconds: 1000 })).toBe(100);
  });
});

describe('Folgen', () => {
  it('Schaden nur bei leerer Leiste, beides zusammen doppelt', () => {
    expect(survivalDamage(50, 50, 10)).toBe(0);
    expect(survivalDamage(0, 50, 10)).toBeCloseTo(5);
    expect(survivalDamage(0, 0, 10)).toBeCloseTo(10);
  });
});
