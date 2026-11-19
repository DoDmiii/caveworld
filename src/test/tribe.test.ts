import { describe, expect, it } from 'vitest';
import { CAMP_ALLIES, isCampDestination } from '../game/tribe';
import { CAMP_LAYOUT } from '../game/camp';
import { outsideSpot } from '../game/interiors';

describe('allied camp inhabitants', () => {
  it('includes all six distinct uploaded tribe members', () => {
    expect(CAMP_ALLIES).toHaveLength(6);
    expect(new Set(CAMP_ALLIES.map(member => member.id)).size).toBe(6);
  });
  it('gives all six camp members six walking frames', () => {
    expect(CAMP_ALLIES.map(member => member.walkingFrames)).toEqual([6, 6, 6, 6, 6, 6]);
  });
  it('keeps wandering inside camp and away from the fire and sleeping place', () => {
    expect(isCampDestination(950, 710)).toBe(true);
    expect(isCampDestination(1000, 686)).toBe(false);
    expect(isCampDestination(1046, 690)).toBe(false);
    expect(isCampDestination(840, 700)).toBe(false);
    expect(isCampDestination(950, 790)).toBe(false);
  });
  it('counts the doorsteps of all four camp huts as camp ground', () => {
    for (const h of CAMP_LAYOUT.filter(p => p.key.startsWith('hut-'))) {
      const o = outsideSpot(h);
      expect(isCampDestination(o.x, o.y)).toBe(true);
    }
  });
});