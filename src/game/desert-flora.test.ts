import { describe, it, expect } from 'vitest';
import { desertTree, oasisPalms, thornbushes, inCanopyShade, nearOasis } from './desert-flora';
import { WATERHOLES } from './desert';
import { biomeAt } from './biomes';

describe('desert flora', () => {
  it('date palms grow at waterholes, acacias in the open sand', () => {
    const w = WATERHOLES[0];
    expect(desertTree(w.x + w.r + 40, w.y).kind).toBe('palm');
    expect(desertTree(w.x + w.r + 400, w.y + 300).kind).toBe('acacia');
  });
  it('the same spot always regrows the same tree', () => {
    expect(desertTree(-300, 2800)).toEqual(desertTree(-300, 2800));
  });
  it('every waterhole gets a palm ring that stays out of the water', () => {
    const palms = oasisPalms();
    for (const w of WATERHOLES) {
      const ring = palms.filter(p => Math.hypot(p.x - w.x, p.y - w.y) < w.r + 60);
      expect(ring.length).toBeGreaterThanOrEqual(3);
      expect(ring.every(p => Math.hypot(p.x - w.x, p.y - w.y) > w.r)).toBe(true);
    }
    expect(palms.every(p => nearOasis(p.x, p.y))).toBe(true);
  });
  it('thornbushes only grow on dry land and never in waterholes', () => {
    const bushes = thornbushes();
    expect(bushes.length).toBeGreaterThan(40);
    expect(bushes.every(b => biomeAt(b.x, b.y) === 'dry')).toBe(true);
    expect(bushes.every(b => !WATERHOLES.some(w => Math.hypot(b.x - w.x, b.y - w.y) < w.r))).toBe(true);
  });
  it('standing under an acacia crown counts as shade, a few steps away does not', () => {
    const trees = [{ x: 0, y: 0, kind: 'acacia' as const }];
    expect(inCanopyShade(10, 4, trees)).toBe(true);
    expect(inCanopyShade(60, 0, trees)).toBe(false);
  });
});
