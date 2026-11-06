import { describe, it, expect } from 'vitest';
import { armorSpeed, armorDamage, armorCold, isBloodied, peltFor, playerTint, BLOOD_TINT, skinFor } from '../game/appearance';
import { RECIPES, canCraft } from '../game/progress';

describe('Rüstungen und Blut-Zustand', () => {
  it('Blut-Skin ab halber Lebensanzeige', () => {
    expect(isBloodied(50)).toBe(true);
    expect(isBloodied(51)).toBe(false);
    expect(playerTint('wolfArmor', 40)).toBe(BLOOD_TINT);
  });
  it('Pelz zeigt eigenen Skin, sonst Blut-Skin ab halber Lebensanzeige', () => {
    expect(skinFor('wolfArmor', 100)).toBe('wolf');
    expect(skinFor('sabreArmor', 30)).toBe('sabre');
    expect(skinFor(null, 50)).toBe('blood');
    expect(skinFor(null, 51)).toBeNull();
  });
  it('Wolf ist schneller, Säbelzahn macht mehr Schaden', () => {
    expect(armorSpeed('wolfArmor')).toBeGreaterThan(1);
    expect(armorDamage('sabreArmor')).toBeGreaterThan(1);
    expect(armorSpeed(null)).toBe(1);
  });
  it('beide schützen vor Kälte, Wolf stärker', () => {
    expect(armorCold('wolfArmor')).toBeLessThan(armorCold('sabreArmor'));
    expect(armorCold('sabreArmor')).toBeLessThan(1);
  });
  it('Wölfe und Säbelzahntiger lassen ihr Fell fallen', () => {
    expect(peltFor('wolf')).toBe('wolfPelt');
    expect(peltFor('tiger')).toBe('sabrePelt');
    expect(peltFor('gazelle')).toBeNull();
  });
  it('Wolfspelz braucht drei Wolfsfelle', () => {
    const r = RECIPES.find(r => r.id === 'wolfArmor')!;
    const base = { wood: 0, stone: 0, flint: 0, fiber: 0 };
    expect(canCraft(r, { ...base, wolfPelt: 2 }, 1, [])).toBe(false);
    expect(canCraft(r, { ...base, wolfPelt: 3 }, 1, [])).toBe(true);
  });
});
