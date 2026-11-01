import { describe, it, expect } from 'vitest';
import { XP, levelFromXp, xpForLevel, RECIPES, canCraft, craft } from '@/game/progress';
const stock = { wood: 4, stone: 1, flint: 0, fiber: 1 };
const spear = RECIPES.find(r => r.id === 'spear')!;
const club = RECIPES.find(r => r.id === 'club')!;
describe('progress', () => {
  it('crafts horn once from 2 flint, 1 wood, 2 fiber', () => {
    const horn=RECIPES.find(r=>r.id==='horn');if(!horn)throw new Error('Missing horn');
    const s={wood:1,stone:0,flint:2,fiber:2};
    expect(craft(horn,s,1,[])).toEqual({wood:0,stone:0,flint:0,fiber:0});
    expect(canCraft(horn,s,1,['horn'])).toBe(false);
  });
  it('crafts a primitive Steinkeil from stone and flint, once', () => {
    const wedge = RECIPES.find(r => r.id === 'wedge');
    if (!wedge) throw new Error('Missing Steinkeil recipe');
    expect(craft(wedge, { wood: 0, stone: 2, flint: 1, fiber: 0 }, 1, [])).toEqual({ wood: 0, stone: 0, flint: 0, fiber: 0 });
    expect(canCraft(wedge, { wood: 0, stone: 1, flint: 1, fiber: 0 }, 1, [])).toBe(false);
    expect(canCraft(wedge, { wood: 0, stone: 2, flint: 1, fiber: 0 }, 1, ['wedge'])).toBe(false);
  });
  it('XP rewards', () => { expect(XP.tree).toBe(15); expect(XP.rock).toBe(15); expect(XP.gazelle).toBe(35); expect(XP.tiger).toBe(100); expect(XP.craft).toBe(25); });
  it('levels', () => { expect(levelFromXp(0)).toBe(1); expect(levelFromXp(xpForLevel(2))).toBe(2); expect(levelFromXp(xpForLevel(2) - 1)).toBe(1); });
  it('spear needs level 2', () => { expect(canCraft(spear, stock, 1, [])).toBe(false); expect(canCraft(spear, stock, 2, [])).toBe(true); });
  it('craft deducts cost', () => { expect(craft(club, stock, 1, [])).toEqual({ ...stock, wood: 1 }); });
  it('no craft when missing or owned', () => { expect(craft(club, { ...stock, wood: 2 }, 1, [])).toBeNull(); expect(craft(club, stock, 1, ['club'])).toBeNull(); });
});
import { coldFactor, pickupAmount } from '@/game/progress';
describe('crafted helpers', () => {
  it('fur halves cold, torch halves at night', () => { expect(coldFactor(['fur'], false)).toBe(0.5); expect(coldFactor(['torch'], false)).toBe(1); expect(coldFactor(['torch', 'fur'], true)).toBe(0.25); });
  it('bag doubles pickups', () => { expect(pickupAmount(['bag'])).toBe(2); expect(pickupAmount([])).toBe(1); });
});
