import { describe, expect, it } from 'vitest';
import { CAMP_ALLIES, isCampDestination } from '../game/tribe';

describe('allied camp inhabitants', () => {
  it('includes all six distinct uploaded tribe members', () => {
    expect(CAMP_ALLIES).toHaveLength(6);
    expect(new Set(CAMP_ALLIES.map(member => member.id)).size).toBe(6);
  });
  it('keeps the sixth idle-only template stationary without invented walking frames', () => {
    expect(CAMP_ALLIES[5].walkingFrames).toBe(0);
    expect(CAMP_ALLIES.slice(0, 5).map(member => member.walkingFrames)).toEqual([6, 6, 6, 6, 6]);
  });
  it('keeps wandering inside camp and away from the fire and sleeping place', () => {
    expect(isCampDestination(950, 710)).toBe(true);
    expect(isCampDestination(1000, 686)).toBe(false);
    expect(isCampDestination(1046, 690)).toBe(false);
    expect(isCampDestination(900, 700)).toBe(false);
    expect(isCampDestination(950, 780)).toBe(false);
  });
});