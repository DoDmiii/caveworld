import { describe, expect, it } from 'vitest';
import { biomeAt, riverX, MAP, CAMP_POS } from '@/game/biomes';

describe('biomes', () => {
  it('camp lies in the western green valley', () => expect(biomeAt(CAMP_POS.x, CAMP_POS.y + 200)).toBe('wenjaWest'));
  it('north-west is the Nordic snow range', () => expect(biomeAt(0, -1000)).toBe('nordics'));
  it('north-east is the dragon mountains', () => expect(biomeAt(2800, -1000)).toBe('dragon'));
  it('east of the river is the unknown Wenja valley', () => expect(biomeAt(2600, 1200)).toBe('wenjaEast'));
  it('south-west is the dry land', () => expect(biomeAt(0, 3200)).toBe('dry'));
  it('south-east is the jungle', () => expect(biomeAt(2800, 3200)).toBe('jungle'));
  it('river runs east of camp over the full map height', () => {
    for (let y = MAP.y; y < MAP.y + MAP.h; y += 256) expect(riverX(y)).toBeGreaterThan(CAMP_POS.x + 200);
  });
});

import { VILLAGES as V2, villageAt as va, biomeAt as ba } from '@/game/biomes';
describe('nordic villages', () => {
  it('all three lie in the Nordics', () => { expect(V2).toHaveLength(3); for (const v of V2) expect(ba(v.x, v.y)).toBe('nordics'); });
  it('protects the village centre but not the camp', () => { expect(va(250, -350)).toBeTruthy(); expect(va(1000, 640)).toBeUndefined(); });
});
