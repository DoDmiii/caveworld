import { describe, expect, it } from 'vitest';
import { dropPelt, touchPelts, MAX_GROUND_PELTS, PELT_OFFSET, type GroundPelt } from './pelt-drops';

describe('pelt drops', () => {
  it('a killed wolf leaves its pelt on the ground next to the carcass', () => {
    const r = dropPelt([], 'wolfPelt', 100, 200, 'p1');
    expect(r.direct).toBe(false);
    expect(r.list).toEqual([{ id: 'p1', kind: 'wolfPelt', x: 100 + PELT_OFFSET.x, y: 200 + PELT_OFFSET.y }]);
  });

  it('touching a pelt collects it, pelts further away stay on the ground', () => {
    const list: GroundPelt[] = [{ id: 'a', kind: 'sabrePelt', x: 50, y: 50 }, { id: 'b', kind: 'wolfPelt', x: 200, y: 50 }];
    const r = touchPelts(list, 55, 52);
    expect(r.taken.map(p => p.id)).toEqual(['a']);
    expect(r.rest.map(p => p.id)).toEqual(['b']);
  });

  it('walking past at a distance does not pick the pelt up', () => {
    expect(touchPelts([{ id: 'a', kind: 'wolfPelt', x: 0, y: 0 }], 40, 0).taken).toHaveLength(0);
  });

  it('when the ground is full the pelt goes straight to the bag instead of vanishing', () => {
    const full = Array.from({ length: MAX_GROUND_PELTS }, (_, i): GroundPelt => ({ id: `p${i}`, kind: 'wolfPelt', x: i, y: 0 }));
    const r = dropPelt(full, 'sabrePelt', 0, 0, 'x');
    expect(r.direct).toBe(true);
    expect(r.list).toHaveLength(MAX_GROUND_PELTS);
  });
});
