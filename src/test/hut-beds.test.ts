import { describe, expect, it } from 'vitest';
import { bedFor, sleepSpot, furnishHut, hutOptions, styleOf, type Furnishing } from '@/game/interiors';

const bed: Furnishing = { id: 'h#1', kind: 'bed', frame: 'bed-0', x: 100, y: 120, w: 32, h: 26, flip: false };

describe('hut beds', () => {
  it('a bed within reach can be slept in', () => {
    expect(bedFor([bed], 100, 110, [])).toEqual({ bed, taken: false });
  });
  it('a bed is out of reach from across the room', () => expect(bedFor([bed], 200, 200, [])).toBeNull());
  it('a resident lying in the bed takes it', () => {
    expect(bedFor([bed], 100, 110, [{ x: 100, y: 114 }])?.taken).toBe(true);
  });
  it('a resident lying elsewhere does not', () => {
    expect(bedFor([bed], 100, 110, [{ x: 160, y: 114 }])?.taken).toBe(false);
  });
  it('the player lies on the bed, not below it', () => {
    const s = sleepSpot(bed); expect(s.x).toBe(100); expect(s.y).toBeLessThan(bed.y); expect(s.y).toBeGreaterThan(bed.y - bed.h);
  });
  it('every hut style has at least one bed to sleep in', () => {
    for (const owner of ['camp', 'nordic', 'dragon', 'desert'] as const) {
      const items = furnishHut(`t-${owner}`, styleOf(owner), hutOptions(`t-${owner}`, owner, owner === 'nordic'));
      expect(items.some(i => i.kind === 'bed')).toBe(true);
    }
  });
});
