import { describe, expect, it } from 'vitest';
import { shoveStep, nextStrikes, isKinCrime, guardsSpace, escortGoal, pickEscort, STRIKE_MEMORY_MS, ESCORT_DISTANCE } from '@/game/tension';

describe('tension', () => {
  it('escalates warn → shove → attack', () => {
    expect(shoveStep(1, false)).toBe('warn');
    expect(shoveStep(2, false)).toBe('shove');
    expect(shoveStep(3, false)).toBe('shove');
    expect(shoveStep(4, false)).toBe('attack');
  });
  it('a drawn weapon attacks after one shove', () => expect(shoveStep(3, true)).toBe('attack'));
  it('strikes expire', () => {
    expect(nextStrikes({ strikes: 2, at: 0 }, 1000)).toBe(3);
    expect(nextStrikes({ strikes: 2, at: 0 }, STRIKE_MEMORY_MS + 1)).toBe(1);
  });
  it('intimidating, binding and carrying are kin crimes', () => {
    expect(isKinCrime('intimidate') && isKinCrime('bind') && isKinCrime('carry')).toBe(true);
    expect(isKinCrime('greet')).toBe(false);
  });
  it('trusted friends do not guard their space', () => { expect(guardsSpace(60)).toBe(false); expect(guardsSpace(0)).toBe(true); });
  it('escort keeps its distance', () => {
    const g = escortGoal({ x: 200, y: 0 }, { x: 0, y: 0 });
    expect(g).toEqual({ x: ESCORT_DISTANCE, y: 0 });
    expect(pickEscort([{ id: 'a', x: 90, y: 0 }, { id: 'b', x: 30, y: 0 }], { x: 0, y: 0 })?.id).toBe('b');
  });
});
