import { describe, it, expect } from 'vitest';
import { DRAGON_VILLAGE, biomeAt, streamDist, STREAM_HALF } from '@/game/biomes';
import { DRAGON_HOUSES } from '@/game/dragon';

describe('Drachenterrasse', () => {
  it('liegt im Gebirge der Drachenmenschen', () => expect(biomeAt(DRAGON_VILLAGE.x, DRAGON_VILLAGE.y)).toBe('dragon'));
  it('nutzt alle 7 Hüttenvarianten', () => expect(new Set(DRAGON_HOUSES.map(h => h.key)).size).toBe(7));
  it('keine Hütte steht in einem Bach', () => DRAGON_HOUSES.forEach(h => expect(streamDist(h.x, h.y + 20)).toBeGreaterThan(STREAM_HALF + 10)));
});

import { DRAGON_FENCES } from '@/game/dragon';
import { DRAGON_VILLAGE as DV } from '@/game/biomes';
describe('Drachenzaun', () => {
  it('lässt das Südtor frei begehbar', () => {
    const blocking = DRAGON_FENCES.filter(f => f.bw > 0 && Math.abs(f.x - DV.x) < 30 && f.y > DV.y + 100);
    expect(blocking).toHaveLength(0);
  });
  it('kein Zaunteil steht in einer Hütte', () => DRAGON_FENCES.filter(f => f.bw > 0).forEach(f =>
    DRAGON_HOUSES.forEach(h => expect(Math.abs(f.x - h.x) < 28 && Math.abs(f.y - h.y) < 24).toBe(false))));
});
