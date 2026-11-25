import { describe, it, expect } from 'vitest';
import { ARUUN_VILLAGES, ARUUN_HOUSES, aruunVillageAt } from './aruun-villages';
import { aruunWaterAt } from './aruun';
import { biomeAt } from './biomes';

describe('Aruun villages', () => {
  it('has three villages in the fir forest, none on water', () => {
    expect(ARUUN_VILLAGES).toHaveLength(3);
    for (const v of ARUUN_VILLAGES) { expect(biomeAt(v.x, v.y)).toBe('wenjaEast'); expect(aruunWaterAt(v.x, v.y)).toBe(false); }
  });
  it('every hut stands inside its own clearing so no tree grows through it', () => {
    for (const h of ARUUN_HOUSES) expect(aruunVillageAt(h.x, h.y)?.name).toBe(h.name);
  });
});
