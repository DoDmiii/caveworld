import { describe, it, expect, beforeEach } from 'vitest';
import { SAVE_KEY, loadSave, saveGame, clearSave, blockSaving, type GameSave } from '@/game/save';

const game: GameSave = {
  x: 1000, y: 610, health: 80, stamina: 60, hunger: 55, warmth: 70, clock: 1500, berries: 2, meat: 1, cooked: 0,
  stock: { wood: 3, stone: 1, flint: 0, fiber: 1 }, xp: 120, owned: ['axe', 'club'],
  stumps: [{ x: 790, y: 770, dir: 3 }], minedRocks: [[800, 610]], pickedBerries: [0, 4],
  lootedHouses: ['Frostheim:0'],
  captives: [],
  relationships: { village: { frostheim: 15 }, personal: {}, alarmUntil: {} },
};

beforeEach(() => localStorage.clear());

describe('save', () => {
  it('retains following and waiting companions with their positions', () => {
    const next: GameSave = { ...game, companions: [{ id: 'ally-0', mode: 'follow', x: 950, y: 850 }, { id: 'ally-1', mode: 'wait', x: 900, y: 900 }] };
    expect(saveGame({ game: next })).toBe(true);
    expect(loadSave()?.game?.companions).toEqual(next.companions);
  });
  it('retains the Steinkeil and finished enemies across reload', () => {
    const next = { ...game, owned: ['axe', 'wedge'] as GameSave['owned'], fighters: [{ id: 'nordic-m2-f', hp: 0, phase: 'dead' as const, x: 200, y: -700, facing: 2 }] };
    expect(saveGame({ game: next })).toBe(true);
    expect(loadSave()?.game).toEqual(next);
  });
  it('ohne Spielstand gibt es null', () => { expect(loadSave()).toBeNull(); });

  it('speichert und lädt unverändert', () => {
    expect(saveGame({ game })).toBe(true);
    expect(loadSave()?.game).toEqual(game);
  });

  it('game und ui überschreiben sich nicht gegenseitig', () => {
    saveGame({ game });
    saveGame({ ui: { hotbar: ['axe', null, null], hand: 'axe', active: 1 } });
    const s = loadSave();
    expect(s?.game).toEqual(game);
    expect(s?.ui?.hand).toBe('axe');
  });

  it('ältere Spielstände ohne Hunger, Wärme und Uhr laden mit Standardwerten', () => {
    const { hunger: _h, warmth: _w, clock: _c, ...old } = game;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: 1, game: old }));
    const g = loadSave()?.game;
    expect(g?.hunger).toBe(100); expect(g?.warmth).toBe(100); expect(g?.clock).toBe(504);
  });

  it('kaputtes JSON wird ignoriert', () => {
    localStorage.setItem(SAVE_KEY, '{kaputt');
    expect(loadSave()).toBeNull();
  });

  it('ältere Spielstände ohne Dorfbeute bleiben kompatibel', () => {
    const { lootedHouses: _l, ...old } = game;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: 1, game: old }));
    expect(loadSave()?.game?.lootedHouses).toEqual([]);
  });

  it('unplausible Werte werden abgelehnt und als Backup behalten', () => {
    const bad = JSON.stringify({ v: 1, savedAt: 1, game: { ...game, health: 9999 } });
    localStorage.setItem(SAVE_KEY, bad);
    expect(loadSave()).toBeNull();
    expect(localStorage.getItem(`${SAVE_KEY}:backup`)).toBe(bad);
  });

  it('clearSave löscht den Spielstand', () => {
    saveGame({ game });
    clearSave();
    expect(loadSave()).toBeNull();
  });

  it('blockSaving verhindert weitere Schreibzugriffe (zuletzt testen, Modulzustand bleibt)', () => {
    blockSaving();
    expect(saveGame({ game })).toBe(false);
    expect(loadSave()).toBeNull();
  });
});
