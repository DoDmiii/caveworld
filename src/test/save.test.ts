import { describe, it, expect, beforeEach } from 'vitest';
import { SAVE_KEY, loadSave, saveGame, clearSave, blockSaving, type GameSave } from '@/game/save';

const game: GameSave = {
  x: 1000, y: 610, health: 80, stamina: 60, hunger: 55, warmth: 70, clock: 1500, berries: 2, meat: 1, cooked: 0,
  stock: { wood: 3, stone: 1, flint: 0, fiber: 1 }, xp: 120, owned: ['axe', 'club'],
  stumps: [{ x: 790, y: 770, dir: 3 }], minedRocks: [[800, 610]], pickedBerries: [0, 4],
  lootedHouses: ['Frostheim:0'], jerky: 0, structures: [], traps: [],
  captives: [],
  chest: { wood: 5, stone: 0, flint: 1, fiber: 0, berries: 2, meat: 0, cooked: 1 },
  relationships: { village: { frostheim: 15 }, personal: {}, alarmUntil: {} },
};

beforeEach(() => localStorage.clear());

describe('save', () => {
  it('retains a headless corpse and its own detached head after reload', () => {
    const fighters = [{ id: 'nordic-w0', hp: 0, phase: 'dead' as const, x: 1018, y: 610, facing: 2, beheaded: true, headPosition: { x: 1040, y: 616 } }];
    expect(saveGame({ game: { ...game, fighters } })).toBe(true);
    expect(loadSave()?.game?.fighters).toEqual(fighters);
  });
  it('retains a finisher rumor carried by an escaped witness', () => {
    const rumors = { rumors: [{ id: 'finisher@1500', kind: 'finisher' as const, origin: 'frostheim', bornAt: 1500, reached: ['frostheim'] }] };
    expect(saveGame({ game: { ...game, rumors } })).toBe(true);
    expect(loadSave()?.game?.rumors).toEqual(rumors);
  });
  it('retains notebook progress for foreign tribes', () => {
    const lore = { nordics: { met: 1, contact: 4 }, dragon: { met: 1, contact: 1, champion: true } };
    expect(saveGame({ game: { ...game, lore } })).toBe(true);
    expect(loadSave()?.game?.lore).toEqual(lore);
  });
  it('retains horn, drum and manual alarm across reload', () => {
    const next = { ...game, owned: [...game.owned, 'horn' as const], structures: [{id:'drum',kind:'drum' as const,x:1000,y:750,dir:0,meat:[]}], signals: {manualAlarm:true,hornReadyAt:1600} };
    expect(saveGame({game:next})).toBe(true);
    expect(loadSave()?.game).toEqual(next);
  });
  it('retains cave location, finite deposits, paintings, upgrades and cave buildings', () => {
    const caves = { current: 'ice' as const, mined: ['ice:0'], paintings: ['lion' as const], obsidian: 2, pigment: 4, sharpened: true, builds: { ice: [{ id: 'fire-1', kind: 'fire' as const, x: 320, y: 480 }] } };
    expect(saveGame({ game: { ...game, caves } })).toBe(true);
    expect(loadSave()?.game?.caves).toEqual(caves);
  });
  it('speichert persönliche Vertrauensbedingungen und Nachtwache ohne erneute Belohnung', () => {
    const trustProgress = { 'nordic-m0': { done: ['weapon'], since: 504, peacefulSince: 504, trades: 0, watch: 120 } };
    expect(saveGame({ game: { ...game, trustProgress } })).toBe(true);
    expect(loadSave()?.game?.trustProgress).toEqual(trustProgress);
  });
  it('speichert Sippenbeziehungen und abgeschlossene Lagergespräche', () => {
    const campSocial = { bonds: { 'nuka:tamo': -5 }, resolved: { 'hunters-gatherers': 1 } };
    expect(saveGame({ game: { ...game, campSocial } })).toBe(true);
    expect(loadSave()?.game?.campSocial).toEqual(campSocial);
  });
  it('retains per-person trust and five skill levels across reloads', () => {
    const profiles = { 'nordic-m0': { trust: 76, skills: { hunt: 3, tough: 3, gather: 1, watch: 5, fire: 1 } } };
    expect(saveGame({ game: { ...game, profiles } })).toBe(true);
    expect(loadSave()?.game?.profiles).toEqual(profiles);
  });
  it('loads older saves without NPC profiles without changing existing game data', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: 1, game }));
    expect(loadSave()?.game).toEqual(game);
  });
  it('rejects trust outside 0–100', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: 1, game: { ...game, profiles: { 'nordic-m0': { trust: 101, skills: { hunt: 3, tough: 3, gather: 1, watch: 5, fire: 1 } } } } }));
    expect(loadSave()).toBeNull();
  });
  it('rejects skills outside levels 1–5', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: 1, game: { ...game, profiles: { 'nordic-m0': { trust: 50, skills: { hunt: 6, tough: 3, gather: 1, watch: 5, fire: 1 } } } } }));
    expect(loadSave()).toBeNull();
  });
  it('retains following and waiting companions with their positions', () => {
    const next: GameSave = { ...game, companions: [{ id: 'ally-0', mode: 'follow', x: 950, y: 850 }, { id: 'ally-1', mode: 'wait', x: 900, y: 900 }] };
    expect(saveGame({ game: next })).toBe(true);
    expect(loadSave()?.game?.companions).toEqual(next.companions);
  });
  it('retains injured and downed companion health', () => {
    const allies = [{ id: 'ally-0', hp: 18, downMs: 0 }, { id: 'ally-1', hp: 0, downMs: 4000 }];
    expect(saveGame({ game: { ...game, allies } })).toBe(true);
    expect(loadSave()?.game?.allies).toEqual(allies);
  });
  it('retains the Steinkeil and finished enemies across reload', () => {
    const next = { ...game, owned: ['axe', 'wedge'] as GameSave['owned'], fighters: [{ id: 'nordic-m2-f', hp: 0, phase: 'dead' as const, x: 200, y: -700, facing: 2 }] };
    expect(saveGame({ game: next })).toBe(true);
    expect(loadSave()?.game).toEqual(next);
  });
  it('stellte Fallen überleben das Speichern und Laden', () => {
    const traps = [{ id: 't100_200', kind: 'snare' as const, x: 100, y: 200, uses: 2, meat: 1 }];
    expect(saveGame({ game: { ...game, traps } })).toBe(true);
    expect(loadSave()?.game?.traps).toEqual(traps);
  });
  it('ältere Spielstände ohne Fallen laden mit leerer Fallenliste', () => {
    const { traps: _t, ...old } = game;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: 1, game: old }));
    expect(loadSave()?.game?.traps).toEqual([]);
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

  it('ältere Spielstände ohne Vorratskiste laden mit leerer Kiste', () => {
    const { chest: _ch, ...old } = game;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: 1, game: old }));
    const g = loadSave()?.game;
    expect(g?.chest).toEqual({ wood: 0, stone: 0, flint: 0, fiber: 0, berries: 0, meat: 0, cooked: 0 });
  });

  it('der Kisteninhalt überlebt das Speichern und Laden', () => {
    expect(saveGame({ game })).toBe(true);
    expect(loadSave()?.game?.chest).toEqual(game.chest);
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
