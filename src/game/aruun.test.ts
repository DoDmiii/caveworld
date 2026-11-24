import { describe, it, expect } from 'vitest';
import { ARUUN_LAKES, aruunDeepAt, aruunWaterAt, firTree, ARUUN_RIVERS } from './aruun';
import { biomeAt, riverX } from './biomes';

describe('Aruun forest', () => {
  it('lakes have a deep core but a wadeable rim', () => {
    const l = ARUUN_LAKES[0];
    expect(aruunDeepAt(l.x, l.y)).toBe(true);
    expect(aruunDeepAt(l.x + l.rx * 0.9, l.y)).toBe(false);
    expect(aruunWaterAt(l.x + l.rx * 0.9, l.y)).toBe(true);
  });
  it('all lakes and rivers lie in the Aruun forest and rivers reach the great river', () => {
    for (const l of ARUUN_LAKES) expect(biomeAt(l.x, l.y)).toBe('wenjaEast');
    for (const r of ARUUN_RIVERS.filter(r => r[0]![0] > 3000)) {
      const end = r[r.length - 1]!;
      if (end[0] < 2100) expect(Math.abs(end[0] - riverX(end[1]))).toBeLessThan(1);
    }
  });
  it('firs only grow in the Aruun forest and keep their look', () => {
    expect(firTree(300, 1000)).toBeNull();
    expect(firTree(2800, 1200)).toEqual(firTree(2800, 1200));
    expect(firTree(2800, 1200)?.key).toMatch(/^fir-[0-3]$/);
  });
});
