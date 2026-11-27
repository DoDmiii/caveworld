import { describe, expect, it } from 'vitest';
import { fightingGoal, fightingStyle, strikeReach } from '../game/combat';
import { FOG_BANKS, fogDensity, forestSound } from '../game/forest-ambience';
import { createFish, createFlocks, guardsNotice, tickFish, tickFlocks } from '../game/ambient';
import { ARUUN_LAKES, aruunWaterAt } from '../game/aruun';

describe('Aruun spear tactics', () => {
  it('gives spear looks 35 pixels reach, axes retain 19', () => {
    expect(strikeReach(fightingStyle('aruun-m4'))).toBe(35);
    expect(strikeReach(fightingStyle('aruun-m2'))).toBe(19);
    expect(fightingStyle('aruun-w1')).toBe('melee');
    expect(fightingStyle('nordic-warrior')).toBe('melee');
  });
  it('retreats below 20 pixels, not at 20', () => {
    const target = { x: 0, y: 0 };
    expect(fightingGoal('spear', { x: 19, y: 0 }, target, true, 0, 1, 0)).toMatchObject({ goal: { x: 32, y: 0 }, retreat: true, speed: 96 });
    expect(fightingGoal('spear', { x: 20, y: 0 }, target, true, 0, 1, 0).retreat).toBe(false);
    expect(fightingGoal('melee', { x: 10, y: 0 }, target, true, 0, 1, 0).goal).toEqual(target);
  });
  it('puts spears outside axes and stops a thrust at 30 pixels', () => {
    const target = { x: 0, y: 0 }, self = { x: 100, y: 0 };
    const spear = fightingGoal('spear', self, target, false, 0, 3, 0).goal;
    const axe = fightingGoal('melee', self, target, false, 0, 3, 0).goal;
    expect(Math.hypot(spear.x, spear.y)).toBeCloseTo(52);
    expect(Math.hypot(axe.x, axe.y)).toBeCloseTo(34);
    expect(fightingGoal('spear', self, target, true, 0, 3, 0).goal).toEqual({ x: 30, y: 0 });
  });
});

describe('Aruun forest ambience', () => {
  it('has mist at all three lakes with thicker dawn/dusk than midday', () => {
    for (const l of ARUUN_LAKES) expect(FOG_BANKS.some(b => b.x === l.x && b.y === l.y)).toBe(true);
    expect(fogDensity(360)).toBeCloseTo(0.23);
    expect(fogDensity(1080)).toBeCloseTo(0.23);
    expect(fogDensity(720)).toBeCloseTo(0.07);
    expect(fogDensity(1800)).toBe(fogDensity(360));
  });
  it('only plays forest sounds outdoors in the east forest', () => {
    expect(forestSound(2520, 900, false)).toEqual({ wind: 0.65, water: 0.55 });
    expect(forestSound(2520, 900, true)).toEqual({ wind: 0, water: 0 });
    expect(forestSound(1000, 600, false)).toEqual({ wind: 0, water: 0 });
  });
  it('places two raven flocks in each Aruun village and walking flushes them', () => {
    const ravens = createFlocks().filter(f => f.raven);
    expect(ravens).toHaveLength(6);
    for (const vi of [5, 6, 7]) expect(ravens.filter(f => f.village === vi)).toHaveLength(2);
    const f = ravens[0]; if (!f) throw new Error('Missing ravens');
    expect(guardsNotice(f)).toBe(true);
    expect(tickFlocks([f], f.x + 50, f.y, { moving: true, running: false, crouching: true }, 0, 16)).toHaveLength(0);
    expect(tickFlocks([f], f.x + 50, f.y, { moving: true, running: false, crouching: false }, 0, 16)).toHaveLength(1);
  });
  it('populates rivers and all lakes; fleeing fish never cross onto dry land', () => {
    const fish = createFish().filter(f => f.forest);
    expect(fish.length).toBeGreaterThan(36);
    for (const l of ARUUN_LAKES) expect(fish.filter(f => Math.hypot((f.x - l.x) / l.rx, (f.y - l.y) / l.ry) < 1).length).toBeGreaterThanOrEqual(12);
    for (const f of fish) {
      expect(aruunWaterAt(f.x, f.y)).toBe(true);
      tickFish([f], f.x, f.y, { moving: true, running: false, crouching: false }, 0, 16);
      for (let now = 16; now < 1400; now += 16) tickFish([f], 0, 0, { moving: false, running: false, crouching: false }, now, 16);
      expect(aruunWaterAt(f.x, f.y)).toBe(true);
    }
  });
});