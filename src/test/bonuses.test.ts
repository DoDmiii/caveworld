import { campWarrior } from '@/game/signals';
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
import { refusesFight, partyHungerFactor, followRefusal, nukaSnack } from '@/game/bonuses';
describe('profile quirks', () => {
  it('Torvik never fights, Kuruk does', () => { expect(refusesFight('torvik', 'gazelle', 1)).toBe(true); expect(refusesFight('kuruk', undefined, 1)).toBe(false); });
  it('Tamo avoids mammoth, bear and wolves and backs off below 50 % health', () => {
    expect(refusesFight('tamo', 'bear', 1)).toBe(true);
    expect(refusesFight('tamo', 'gazelle', 1)).toBe(false);
    expect(refusesFight('tamo', 'gazelle', 0.49)).toBe(true);
  });
  it('Orka eats 25 % and Bruk 20 % more', () => { expect(partyHungerFactor(['orka'])).toBe(1.25); expect(partyHungerFactor(['orka', 'bruk'])).toBeCloseTo(1.5); });
  it('Skorra follows only from 60 trust', () => { expect(followRefusal('skorra', 59)).not.toBeNull(); expect(followRefusal('skorra', 60)).toBeNull(); });
  it('Nuka eats one berry a day', () => { expect(nukaSnack(5, true)).toBe(4); expect(nukaSnack(0, true)).toBe(0); expect(nukaSnack(5, false)).toBe(5); });
});

import { companionPace, leashExceeded, uraColdDamage, triesToFlee } from '@/game/bonuses';
describe('eigenständige Schwächen', () => {
  it('Kuruk läuft normal schnell', () => { expect(companionPace('kuruk')).toBe(1); });
  it('Kuruk kehrt nie um', () => { expect(leashExceeded('kuruk', 2000)).toBe(false); });
  it('Kuruk kämpft bei Lageralarm', () => { expect(campWarrior('kuruk')).toBe(true); });
  it('Ura friert im Schnee ohne Fell', () => { expect(uraColdDamage('ura', 'nordics', false)).toBe(1); expect(uraColdDamage('ura', 'nordics', true)).toBe(0); expect(uraColdDamage('ura', 'valley', false)).toBe(0); });
  it('Ilvar flieht nachts unter 40 Vertrauen einmal pro Nacht', () => {
    expect(triesToFlee('ilvar', 39, true, false)).toBe(true);
    expect(triesToFlee('ilvar', 40, true, false)).toBe(false);
    expect(triesToFlee('ilvar', 10, false, false)).toBe(false);
    expect(triesToFlee('ilvar', 10, true, true)).toBe(false);
  });
});
