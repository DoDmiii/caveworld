import { describe, it, expect } from 'vitest';
import { ignite, firePhase, igniteBlock, inHeat, rebuildDue, respawnExtra, repairHut, repairBlock, clearVillageFires, BLAZE_MINUTES, SMOLDER_MINUTES, REBUILD_MINUTES, COOL_MINUTES, REPAIR_COST, EMPTY_FIRES } from '@/game/arson';
import { villagesToRespawn, VILLAGE_RESPAWN_MINUTES } from '@/game/raid';
import { FLAMMABLE_HOUSES } from '@/game/fire-art';

const rich = { wood: 30, stone: 20, flint: 5, fiber: 20 };
const out = SMOLDER_MINUTES + BLAZE_MINUTES;

describe('arson', () => {
  it('needs the torch in the main hand and only lights intact huts', () => {
    expect(igniteBlock(EMPTY_FIRES, 'Frostheim:0', false, 0)).toBe('no-torch');
    expect(igniteBlock(EMPTY_FIRES, 'Frostheim:0', true, 0)).toBeNull();
    const s = ignite(EMPTY_FIRES, 'Frostheim:0', 'nordic', 100, 0);
    expect(igniteBlock(s, 'Frostheim:0', true, 100)).toBe('burning');
    expect(igniteBlock(s, 'Frostheim:0', true, 100 + out)).toBe('ruin');
    expect(ignite(s, 'Frostheim:0', 'nordic', 500, 0)).toBe(s);
  });
  it('the full blaze lasts half a game day, then the hut is a ruin', () => {
    expect(BLAZE_MINUTES).toBe(720);
    const f = ignite(EMPTY_FIRES, 'a', 'nordic', 0, 0).a!;
    expect(firePhase(f, SMOLDER_MINUTES - 1)).toBe('smolder');
    expect(firePhase(f, SMOLDER_MINUTES)).toBe('blaze');
    expect(firePhase(f, out - 1)).toBe('blaze');
    expect(firePhase(f, out)).toBe('ruin');
    expect(inHeat(f, SMOLDER_MINUTES + 10, 10)).toBe(true);
    expect(inHeat(f, SMOLDER_MINUTES + 10, 60)).toBe(false);
    expect(inHeat(f, out + 1, 5)).toBe(false);
  });
  it('foreign villagers rebuild two days after the fire dies; camp huts never rebuild alone', () => {
    let s = ignite(EMPTY_FIRES, 'Frostheim:0', 'nordic', 0, 0);
    s = ignite(s, 'camp:0', 'camp', 0);
    const never = () => false;
    expect(rebuildDue(s, out + REBUILD_MINUTES - 1, never)).toEqual([]);
    expect(rebuildDue(s, out + REBUILD_MINUTES, never)).toEqual(['Frostheim:0']);
    expect(rebuildDue(s, 99_999_999, never)).not.toContain('camp:0');
    // A defeated village keeps its ruins until it re-arms.
    expect(rebuildDue(s, out + REBUILD_MINUTES, () => true)).toEqual([]);
  });
  it('a burnt, defeated village returns two days later than the usual 3.5 days', () => {
    const fall = 1000;
    const raid = { '0': fall };
    const s = ignite(EMPTY_FIRES, 'Frostheim:0', 'nordic', fall + 10, 0);
    expect(respawnExtra(EMPTY_FIRES, 0, fall)).toBe(0);
    expect(respawnExtra(s, 0, fall)).toBe(REBUILD_MINUTES);
    const extra = (v: number, at: number) => respawnExtra(s, v, at);
    expect(villagesToRespawn(raid, fall + VILLAGE_RESPAWN_MINUTES, extra)).toEqual([]);
    expect(villagesToRespawn(raid, fall + VILLAGE_RESPAWN_MINUTES + 2 * 1440, extra)).toEqual([0]);
    expect(Object.keys(clearVillageFires(ignite(s, 'camp:0', 'camp', 0), 0))).toEqual(['camp:0']);
  });
  it('rebuilding an own hut is costly, needs the axe and a cooled ruin', () => {
    const s = ignite(EMPTY_FIRES, 'camp:0', 'camp', 0);
    expect(repairBlock(s, 'camp:0', out - 1, rich, true)).toBe('not-ruin');
    expect(repairBlock(s, 'camp:0', out + 1, rich, true)).toBe('hot');
    const t = out + COOL_MINUTES;
    expect(repairBlock(s, 'camp:0', t, rich, false)).toBe('no-axe');
    expect(repairBlock(s, 'camp:0', t, { wood: 23, stone: 20, flint: 5, fiber: 20 }, true)).toBe('cost');
    const r = repairHut(s, 'camp:0', t, rich, true)!;
    expect(r.state['camp:0']).toBeUndefined();
    expect(r.stock).toMatchObject({ wood: 30 - REPAIR_COST.wood, stone: 20 - REPAIR_COST.stone, fiber: 20 - REPAIR_COST.fiber, flint: 5 - REPAIR_COST.flint });
    expect(repairBlock(ignite(EMPTY_FIRES, 'Frostheim:0', 'nordic', 0, 0), 'Frostheim:0', t, rich, true)).toBe('foreign');
  });
  it('every hut of all three peoples can burn under a unique ID', () => {
    const ids = FLAMMABLE_HOUSES.map(h => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(FLAMMABLE_HOUSES.filter(h => h.owner === 'camp')).toHaveLength(4);
    expect(FLAMMABLE_HOUSES.filter(h => h.owner === 'dragon')).toHaveLength(8);
    expect(FLAMMABLE_HOUSES.filter(h => h.owner === 'nordic').every(h => (h.village ?? -1) >= 0)).toBe(true);
  });
});
