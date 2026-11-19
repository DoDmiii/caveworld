import { describe, expect, it } from 'vitest';
import { pickWander, RETURN_STEP, type WanderHome } from '../game/wander';

const box = (x: number, y: number) => x >= 0 && x <= 200 && y >= 0 && y <= 200;
const home: WanderHome = { allowed: box, within: box, cx: 100, cy: 100 };
const seq = (seed = 7) => () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };

describe('idle wandering', () => {
  it('walks someone standing outside their home back towards its centre', () => {
    const t = pickWander(300, 100, home, () => true, seq(), 100, 80);
    expect(t.x).toBeCloseTo(300 - RETURN_STEP);
    expect(t.y).toBeCloseTo(100);
  });
  it('never leaves an outsider standing still', () => {
    const t = pickWander(100, 260, home, () => true, seq(), 100, 80);
    expect(Math.hypot(t.x - 100, t.y - 260)).toBeGreaterThan(30);
  });
  it('steers around a blocked straight line back home', () => {
    const wall = (x: number, y: number) => !(x > 220 && x < 260 && Math.abs(y - 100) < 15);
    const t = pickWander(300, 100, home, wall, seq(), 100, 80);
    expect(wall(t.x, t.y)).toBe(true);
    expect(Math.hypot(t.x - 300, t.y - 100)).toBeGreaterThan(30);
  });
  it('keeps wandering targets inside home for residents already there', () => {
    const r = seq(3);
    for (let i = 0; i < 50; i++) {
      const t = pickWander(100, 100, home, () => true, r, 100, 80);
      expect(box(t.x, t.y)).toBe(true);
    }
  });
});
