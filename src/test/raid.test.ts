import { describe, it, expect } from 'vitest';
import { assignAllyTargets, recordChampionDeath, villagesToRespawn, VILLAGE_RESPAWN_MINUTES, clearRespawn } from '@/game/raid';
import { hitFighter, newFighter, finishFighter } from '@/game/combat';

describe('raid', () => {
  it('champion respawns only after 3.5 game days', () => {
    const s = recordChampionDeath({}, 1, 1000);
    expect(VILLAGE_RESPAWN_MINUTES).toBe(5040);
    expect(villagesToRespawn(s, 1000 + 5039)).toEqual([]);
    expect(villagesToRespawn(s, 1000 + 5040)).toEqual([1]);
    expect(villagesToRespawn(clearRespawn(s, 1), 99999)).toEqual([]);
  });
  it('champion cannot die from hits, only from a finisher', () => {
    let f = newFighter(180);
    for (let i = 0; i < 30; i++) f = hitFighter(f, 50, 0);
    expect(f.phase).toBe('downed');
    expect(finishFighter(f).phase).toBe('dead');
  });
  it('allies spread over foes instead of all following one target', () => {
    const foes = [{ id: 'a', x: 10, y: 0, hostile: true, alive: true }, { id: 'b', x: -10, y: 0, hostile: true, alive: true }];
    const allies = [{ id: '1', x: 0, y: 0 }, { id: '2', x: 0, y: 0 }, { id: '3', x: 0, y: 0 }];
    const t = assignAllyTargets(allies, foes, { x: 0, y: 0 });
    expect(new Set([...t.values()].map(f => f.id)).size).toBe(2);
  });
});
