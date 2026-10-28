import { describe, it, expect } from 'vitest';
import { partyBonuses, discountedRecipe, bonusYield } from '@/game/bonuses';
import { RECIPES } from '@/game/progress';
describe('profile bonuses', () => {
  it('Tamo following gives 15 % more meat', () => expect(partyBonuses(['tamo'], []).meat).toBeCloseTo(0.15));
  it('Skorra only helps from 60 trust', () => {
    expect(partyBonuses(['skorra'], [], { skorra: 59 }).meat).toBe(0);
    expect(partyBonuses(['skorra'], [], { skorra: 60 }).meat).toBeCloseTo(0.25);
  });
  it('Nuka following gives 40 % more berries', () => expect(partyBonuses(['nuka'], []).berries).toBeCloseTo(0.4));
  it('Ura heals bandages 50 % stronger, Kuruk fire 25 % wider, Torvik 15 % less snow cold', () => {
    const b = partyBonuses(['torvik'], ['ura', 'kuruk']);
    expect([b.bandage, b.fireRange, b.snowCold]).toEqual([1.5, 1.25, 0.85]);
  });
  it('Orka lowers spear cost by 1 per material, minimum 1', () => {
    const spear = RECIPES.find(r => r.id === 'spear')!;
    expect(discountedRecipe(spear, partyBonuses([], ['orka'])).cost).toEqual({ wood: 3, stone: 1, fiber: 1 });
    const torch = RECIPES.find(r => r.id === 'torch')!;
    expect(discountedRecipe(torch, partyBonuses([], ['orka'])).cost).toEqual(torch.cost);
  });
  it('40 % berry bonus yields 2 extra over 5 picks', () => {
    let carry = 0, total = 0;
    for (let i = 0; i < 5; i++) { const y = bonusYield(1, 0.4, carry); carry = y.carry; total += y.amount; }
    expect(total).toBe(7);
  });
});
