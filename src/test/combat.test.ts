import { describe, it, expect } from 'vitest';
import { flankSlot, separation, lungeIndex } from '../game/combat';

describe('combat helpers', () => {
  it('spreads attackers to different ring positions', () => {
    const a = flankSlot(0, 3, { x: 0, y: 0 }, 30, 0), b = flankSlot(1, 3, { x: 0, y: 0 }, 30, 0);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(40);
    expect(Math.hypot(a.x, a.y)).toBeCloseTo(30);
  });
  it('pushes overlapping fighters apart', () => {
    const s = separation({ x: 0, y: 0 }, [{ x: 5, y: 0 }], 28);
    expect(s.x).toBeLessThan(0);
    expect(separation({ x: 0, y: 0 }, [{ x: 50, y: 0 }], 28)).toEqual({ x: 0, y: 0 });
  });
  it('gives only one attacker the lunge turn', () => {
    expect(lungeIndex(3, 0)).toBe(0);
    expect(lungeIndex(3, 1400)).toBe(1);
    expect(lungeIndex(0, 0)).toBe(-1);
  });
});
