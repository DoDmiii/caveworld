import { describe, it, expect } from 'vitest';
import { newCaves, caveAt, caveWalkable, caveDeposits, mineDeposit, paint, sharpen, caveDamageFactor, caveSprintFactor, caveColdFactor } from '@/game/caves';
describe('caves', () => {
  it('finds the home entrance at 1000/560 and keeps chambers connected', () => {
    expect(caveAt(1000, 582)).toBe('home'); expect(caveAt(1000, 680)).toBeUndefined();
    for (let y = 144; y <= 558; y += 8) expect(caveWalkable(320, y)).toBe(true);
    expect(caveWalkable(16, 16)).toBe(false);
  });
  it('deposits are finite and cannot be mined from another cave', () => {
    const s = { ...newCaves(), current: 'home' as const }; const d = caveDeposits('home')[0]; if (!d) throw new Error('missing deposit');
    const next = mineDeposit(s, d.id); expect(next?.obsidian).toBe(2);
    expect(next && mineDeposit(next, d.id)).toBeNull(); expect(mineDeposit(s, 'ice:0')).toBeNull();
  });
  it('mammoth adds exactly 20 percent melee damage and cannot repeat', () => {
    const s = paint({ ...newCaves(), current: 'home', pigment: 3 }, 'mammoth');
    expect(s?.pigment).toBe(0); expect(s && caveDamageFactor(s, 'axe')).toBe(1.2); expect(s && paint(s, 'mammoth')).toBeNull();
  });
  it('gazelle reduces sprint costs by 25 percent', () => { expect(caveSprintFactor({ ...newCaves(), paintings: ['gazelle'] })).toBe(0.75); expect(caveSprintFactor(newCaves())).toBe(1); });
  it('lion reduces cold loss by 15 percent', () => { expect(caveColdFactor({ ...newCaves(), paintings: ['lion'] })).toBe(0.85); expect(caveColdFactor(newCaves())).toBe(1); });
  it('obsidian upgrades spear and club by 25 percent but not the axe', () => {
    const s = sharpen({ ...newCaves(), obsidian: 3 }); expect(s?.obsidian).toBe(0);
    if (!s) throw new Error('upgrade missing');
    expect(caveDamageFactor(s, 'spear')).toBe(1.25); expect(caveDamageFactor(s, 'club')).toBe(1.25); expect(caveDamageFactor(s, 'axe')).toBe(1); expect(sharpen(s)).toBeNull();
  });
});