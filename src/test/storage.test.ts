import { describe, expect, it } from 'vitest';
import { EMPTY_CHEST, deposit, withdraw, chestTotal, CHEST_POS, CHEST_RANGE } from '@/game/storage';

const player = { wood: 10, stone: 4, flint: 0, fiber: 2, berries: 3, meat: 1, cooked: 0 };

describe('Vorratskiste', () => {
  it('Einlagern bewegt Vorräte vom Beutel in die Kiste', () => {
    const r = deposit(EMPTY_CHEST, player, 'wood', 5);
    expect(r?.chest.wood).toBe(5);
    expect(r?.player.wood).toBe(5);
  });
  it('man kann nicht mehr einlagern als man besitzt', () => {
    expect(deposit(EMPTY_CHEST, player, 'flint', 1)).toBeUndefined();
    expect(deposit(EMPTY_CHEST, player, 'wood', 0)).toBeUndefined();
  });
  it('Entnehmen bewegt Vorräte zurück in den Beutel', () => {
    const chest = { ...EMPTY_CHEST, berries: 6 };
    const r = withdraw(chest, player, 'berries', 4);
    expect(r?.chest.berries).toBe(2);
    expect(r?.player.berries).toBe(7);
  });
  it('man kann nicht mehr entnehmen als gelagert ist', () => {
    expect(withdraw({ ...EMPTY_CHEST, meat: 1 }, player, 'meat', 2)).toBeUndefined();
  });
  it('die Gesamtsumme zählt alle gelagerten Vorräte', () => {
    expect(chestTotal({ ...EMPTY_CHEST, wood: 3, cooked: 2 })).toBe(5);
    expect(chestTotal(EMPTY_CHEST)).toBe(0);
  });
  it('die Kiste steht in Reichweite des Lagerfeuers', () => {
    // Lagerfeuer bei (1000, 680): die Kiste muss nah genug für das Lagerleben stehen.
    expect(Math.hypot(CHEST_POS.x - 1000, CHEST_POS.y - 680)).toBeLessThan(80);
    expect(CHEST_RANGE).toBeGreaterThan(0);
  });
});
