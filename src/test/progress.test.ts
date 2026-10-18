import { describe, it, expect } from 'vitest';
import { XP, levelFromXp, xpForLevel, RECIPES, canCraft, craft } from '@/game/progress';
const stock = { wood: 4, stone: 1, flint: 0, fiber: 1 };
const spear = RECIPES.find(r => r.id === 'spear')!;
const club = RECIPES.find(r => r.id === 'club')!;
describe('progress', () => {
  it('XP rewards', () => { expect(XP.tree).toBe(15); expect(XP.rock).toBe(15); expect(XP.gazelle).toBe(35); expect(XP.tiger).toBe(100); expect(XP.craft).toBe(25); });
  it('levels', () => { expect(levelFromXp(0)).toBe(1); expect(levelFromXp(xpForLevel(2))).toBe(2); expect(levelFromXp(xpForLevel(2) - 1)).toBe(1); });
  it('spear needs level 2', () => { expect(canCraft(spear, stock, 1, [])).toBe(false); expect(canCraft(spear, stock, 2, [])).toBe(true); });
  it('craft deducts cost', () => { expect(craft(club, stock, 1, [])).toEqual({ ...stock, wood: 1 }); });
  it('no craft when missing or owned', () => { expect(craft(club, { ...stock, wood: 2 }, 1, [])).toBeNull(); expect(craft(club, stock, 1, ['club'])).toBeNull(); });
});
