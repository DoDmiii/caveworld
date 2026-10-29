import { describe, it, expect } from 'vitest';
import { placementError, hangMeat, collectJerky, canAfford, pay, refund, STRUCTURES, DRY_MINUTES, RACK_SLOTS, type Placed } from '@/game/building';
import { eat } from '@/game/food';
import { saveGame, loadSave } from '@/game/save';

const rack = (x = 1000, y = 700): Placed => ({ id: 'r', kind: 'rack', x, y, dir: 0, meat: [] });

describe('building', () => {
  it('Räuchergestell nur im Lager (200 um das Feuer)', () => {
    expect(placementError('rack', 1000, 830, [])).toBeNull();
    expect(placementError('rack', 1000, 900, [])).toBe('Nur im Höhlenlager');
  });
  it('Unterstand und Barrikade überall', () => {
    expect(placementError('shelter', 300, 2000, [])).toBeNull();
    expect(placementError('barricade', 250, -350, [])).toBeNull();
  });
  it('Bauten dürfen sich nicht überlappen', () => {
    expect(placementError('barricade', 1010, 700, [rack()])).toBe('Zu nah an einem Bau');
  });
  it('kostet Material und Abbauen gibt alles zurück', () => {
    const s = { wood: 4, stone: 0, flint: 0, fiber: 2 };
    expect(canAfford(STRUCTURES.rack.cost, s)).toBe(true);
    const after = pay(STRUCTURES.rack.cost, s);
    expect(after).toEqual({ wood: 0, stone: 0, flint: 0, fiber: 0 });
    expect(canAfford(STRUCTURES.rack.cost, after)).toBe(false);
    expect(refund(STRUCTURES.rack.cost, after)).toEqual(s);
  });
  it('Gestell hält 3 Streifen, trocken nach einem halben Spieltag (720 Min.)', () => {
    let r = rack();
    for (let i = 0; i < RACK_SLOTS; i++) r = hangMeat(r, 100)!;
    expect(hangMeat(r, 100)).toBeUndefined();
    expect(collectJerky(r, 100 + DRY_MINUTES - 1).jerky).toBe(0);
    const c = collectJerky(r, 100 + DRY_MINUTES);
    expect(c.jerky).toBe(3);
    expect(c.rack.meat).toEqual([]);
  });
  it('Dörrfleisch heilt 30 und sättigt 45', () => {
    const r = eat({ health: 50, stamina: 0, hunger: 20, berries: 0, meat: 0, cooked: 0, jerky: 1 }, 'jerky');
    expect(r?.health).toBe(80); expect(r?.hunger).toBe(65); expect(r?.jerky).toBe(0);
  });
  it('Bauten und Trocknung überleben das Neuladen', () => {
    localStorage.clear();
    const game = { x: 1000, y: 610, health: 80, stamina: 60, hunger: 55, warmth: 70, clock: 1500, berries: 0, meat: 0, cooked: 0, jerky: 2,
      stock: { wood: 0, stone: 0, flint: 0, fiber: 0 }, xp: 0, owned: ['axe' as const], stumps: [], minedRocks: [], pickedBerries: [], lootedHouses: [], captives: [],
      chest: { wood: 0, stone: 0, flint: 0, fiber: 0, berries: 0, meat: 0, cooked: 0 }, relationships: { village: {}, personal: {}, alarmUntil: {} },
      structures: [{ ...rack(), meat: [1400] }, { id: 's', kind: 'shelter' as const, x: 300, y: 2000, dir: 5, meat: [] }] };
    expect(saveGame({ game })).toBe(true);
    expect(loadSave()?.game?.structures).toEqual(game.structures);
    expect(loadSave()?.game?.jerky).toBe(2);
  });
});
describe('Trocknungsanzeige', () => {
  it('halber Tag = 720 Minuten, Fortschritt 0..1', async () => {
    const { dryProgress, DRY_MINUTES } = await import('@/game/building');
    expect(DRY_MINUTES).toBe(720);
    expect(dryProgress(0, 360)).toBe(0.5);
    expect(dryProgress(0, 2000)).toBe(1);
  });
});
