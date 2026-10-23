import { describe, it, expect } from 'vitest';
import { flankSlot, separation, lungeIndex } from '../game/combat';
import { newFighter, hitFighter, recoverFighter, canFinish, finishFighter } from '../game/combat';

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

describe('knockdowns and Steinkeil finishers', () => {
  it('knocks a fighter down after heavy hits rather than killing on impact', () => {
    const first = hitFighter(newFighter(), 24, 100);
    expect(first).toEqual({ hp: 36, phase: 'ready', downUntil: 0 });
    const second = hitFighter(first, 24, 200);
    expect(second).toEqual({ hp: 12, phase: 'downed', downUntil: 7200 });
    expect(hitFighter(second, 24, 300)).toBe(second);
  });
  it('requires a Steinkeil, a nearby grounded enemy and never an ally', () => {
    const downed = hitFighter(newFighter(), 60, 0);
    expect(canFinish(downed, 20, true, false)).toBe(true);
    expect(canFinish(downed, 31, true, false)).toBe(false);
    expect(canFinish(downed, 20, false, false)).toBe(false);
    expect(canFinish(downed, 20, true, true)).toBe(false);
    expect(canFinish(newFighter(), 20, true, false)).toBe(false);
  });
  it('only finishes downed enemies, and a finished enemy cannot recover', () => {
    const downed = hitFighter(newFighter(), 60, 0);
    const dead = finishFighter(downed);
    expect(dead).toEqual({ hp: 0, phase: 'dead', downUntil: 0 });
    expect(recoverFighter(dead, 20000)).toBe(dead);
    const ready = newFighter();
    expect(finishFighter(ready)).toBe(ready);
  });
  it('gets back up if the player does not bind or finish', () => {
    const downed = hitFighter(newFighter(), 60, 100);
    expect(recoverFighter(downed, 7099)).toBe(downed);
    expect(recoverFighter(downed, 7100)).toEqual({ hp: 30, phase: 'ready', downUntil: 0 });
  });
});
