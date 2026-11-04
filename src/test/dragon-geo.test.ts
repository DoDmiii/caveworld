import { describe, it, expect } from 'vitest';
import { DRAGON_VILLAGE, biomeAt, streamDist, STREAM_HALF } from '@/game/biomes';
import { DRAGON_HOUSES } from '@/game/dragon';

describe('Drachenterrasse', () => {
  it('liegt im Gebirge der Drachenmenschen', () => expect(biomeAt(DRAGON_VILLAGE.x, DRAGON_VILLAGE.y)).toBe('dragon'));
  it('nutzt alle 7 Hüttenvarianten', () => expect(new Set(DRAGON_HOUSES.map(h => h.key)).size).toBe(7));
  it('keine Hütte steht in einem Bach', () => DRAGON_HOUSES.forEach(h => expect(streamDist(h.x, h.y + 20)).toBeGreaterThan(STREAM_HALF + 10)));
});
