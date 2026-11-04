import { describe, it, expect } from 'vitest';
import { TERRACES, cliffPoints, heightAt } from '@/game/terrain';
import { DRAGON_VILLAGE, streamDist } from '@/game/biomes';

describe('dragon terraces', () => {
  it('village sits on the top plateau, valley outside is level 0', () => {
    expect(heightAt(DRAGON_VILLAGE.x, DRAGON_VILLAGE.y)).toBe(2);
    expect(heightAt(1400, 0)).toBe(0);
  });
  it('every cliff ring has walkable passes', () => {
    for (const t of TERRACES) expect(cliffPoints(t).some(p => p.open)).toBe(true);
  });
  it('cliffs never block streams', () => {
    for (const t of TERRACES) for (const p of cliffPoints(t)) if (streamDist(p.x, p.y) < 20) expect(p.open).toBe(true);
  });
});
