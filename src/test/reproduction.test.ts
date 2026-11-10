import { describe, it, expect } from 'vitest';
import { EMPTY_REPRO, conceive, advanceDay, birthSuspicion, hairFor, PLAYER } from '@/game/reproduction';

describe('reproduction', () => {
  it('nordic children are blond, player children dark', () => {
    expect(hairFor('nordic-w1', 'nordic-m2')).toBe('blond');
    expect(hairFor('nordic-w1', PLAYER)).toBe('dunkel');
  });
  it('conceives at under 50 % roll only', () => {
    expect(conceive(EMPTY_REPRO, 'w', PLAYER, 'm', 1, 0.6).pregnant.w).toBeUndefined();
    expect(conceive(EMPTY_REPRO, 'w', PLAYER, 'm', 1, 0.4).pregnant.w?.father).toBe(PLAYER);
  });
  it('is born after 3 days as cuckoo', () => {
    let s = { ...conceive(EMPTY_REPRO, 'nordic-w1', PLAYER, 'nordic-m2', 1, 0), day: 1 };
    expect(advanceDay(s, 3, {}, () => 1).births).toHaveLength(0);
    const r = advanceDay(s, 4, {}, () => 1);
    expect(r.births[0]?.cuckoo).toBe(true);
    expect(r.births[0]?.foreign).toBe(true);
    expect(r.state.pregnant['nordic-w1']).toBeUndefined();
  });
  it('foreign child exposes at suspicion 50, otherwise doubt 70', () => {
    const b = { child: {} as never, cuckoo: true, foreign: true };
    expect(birthSuspicion(b, 50).exposed).toBe(true);
    expect(birthSuspicion(b, 0)).toEqual({ suspicion: 70, exposed: false });
  });
});
