import { describe, expect, it } from 'vitest';
import { NORDIC_HOUSES, NORDIC_FENCES } from '@/game/nordic';
import { VILLAGES, villageAt } from '@/game/biomes';
import { lootHouse, type VillageLootState } from '@/game/village-loot';

const empty = (): VillageLootState => ({ stock:{wood:0,stone:0,flint:0,fiber:0},berries:0,meat:0,cooked:0,owned:['axe'],lootedHouses:[] });
describe('Nordic villages', () => {
  it('expands all villages with additional protected houses', () => {
    expect(NORDIC_HOUSES.filter(h=>h.village==='Frostheim')).toHaveLength(10);
    expect(NORDIC_HOUSES.filter(h=>h.village==='Gipfelwacht')).toHaveLength(6);
    expect(NORDIC_HOUSES.filter(h=>h.village==='Eisfurt')).toHaveLength(6);
    for(const h of NORDIC_HOUSES) expect(villageAt(h.x,h.y)?.name).toBe(h.village);
  });
  it('leaves the north and south gate centre clear of solid fences', () => {
    for(const v of VILLAGES) for(const dy of [-180,180]) {
      const nearby=NORDIC_FENCES.filter(p=>Math.abs(p.x-v.x)<20 && Math.abs(p.y-v.y)<180);
      expect(nearby.every(p=>p.bw===0 && p.bh===0)).toBe(true);
      expect(villageAt(v.x,v.y+dy)?.name).toBe(v.name);
    }
  });
  it('gives resources from a searched house', () => expect(lootHouse(empty(),'Frostheim:1')?.stock).toEqual({wood:4,stone:3,fiber:2,flint:1}));
  it('gives food from a searched house', () => {
    const next=lootHouse(empty(),'Frostheim:1');
    expect([next?.berries,next?.meat,next?.cooked]).toEqual([3,1,2]);
  });
  it('provides existing equipment in village armouries', () => {
    expect(lootHouse(empty(),'Frostheim:0')?.owned).toEqual(['axe','club']);
    expect(lootHouse(empty(),'Gipfelwacht:0')?.owned).toEqual(['axe','spear']);
    expect(lootHouse(empty(),'Eisfurt:0')?.owned).toEqual(['axe']);
  });
  it('cannot loot the same house twice or unknown houses', () => {
    const next=lootHouse(empty(),'Frostheim:0');
    expect(next).not.toBeNull();
    if(!next) return;
    expect(lootHouse(next,'Frostheim:0')).toBeNull();
    expect(lootHouse(empty(),'unknown')).toBeNull();
    expect(empty().stock.wood).toBe(0);
  });
});