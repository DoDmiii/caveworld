import { describe, it, expect } from 'vitest';
import { TRAPS, TRAP_KINDS, MAX_TRAPS, TRAP_GAP, PIT_DAMAGE, canAffordTrap, trapPlacementError, triggerTrap, collectTrap, type Trap } from '@/game/traps';

const snare = (over: Partial<Trap> = {}): Trap => ({ id: 't1', kind: 'snare', x: 100, y: 100, uses: 3, meat: 0, ...over });

describe('traps: Definitionen', () => {
  it('kennt genau drei Fallentypen', () => {
    expect(TRAP_KINDS).toEqual(['snare', 'pit', 'rattle']);
  });
  it('Schlinge: 3 Nutzungen, Faserbedarf unter 3', () => {
    expect(TRAPS.snare.uses).toBe(3);
    expect(TRAPS.snare.cost.fiber!).toBeLessThan(3);
  });
  it('Fallgrube: 2 Nutzungen, kostet Holz und Stein', () => {
    expect(TRAPS.pit.uses).toBe(2);
    expect(TRAPS.pit.cost.wood).toBeGreaterThan(0);
    expect(TRAPS.pit.cost.stone).toBeGreaterThan(0);
  });
  it('Knochenrassel: 5 Alarme und der größte Radius', () => {
    expect(TRAPS.rattle.uses).toBe(5);
    expect(TRAPS.rattle.radius).toBeGreaterThan(TRAPS.snare.radius);
    expect(TRAPS.rattle.radius).toBeGreaterThan(TRAPS.pit.radius);
  });
  it('Fallgrube richtet 35 Schaden an', () => {
    expect(PIT_DAMAGE).toBe(35);
  });
});

describe('traps: Auslöselogik', () => {
  it('Schlinge fängt nur Beutetiere und legt 1 Fleisch ab', () => {
    const r = triggerTrap(snare(), 'prey')!;
    expect(r.event.kind).toBe('catch');
    expect(r.trap).toEqual({ ...snare(), uses: 2, meat: 1 });
    expect(triggerTrap(snare(), 'predator')).toBeNull();
    expect(triggerTrap(snare(), 'raider')).toBeNull();
  });
  it('Schlinge ist nach 3 Fängen verbraucht', () => {
    let t: Trap | null = snare();
    for (let i = 0; i < 3; i++) t = triggerTrap(t!, 'prey')!.trap;
    expect(t).toBeNull();
  });
  it('Fallgrube reagiert nur auf Raubtiere', () => {
    const pit: Trap = { id: 't2', kind: 'pit', x: 0, y: 0, uses: 2, meat: 0 };
    const r = triggerTrap(pit, 'predator')!;
    expect(r.event.kind).toBe('wound');
    expect(r.trap!.uses).toBe(1);
    expect(triggerTrap(pit, 'prey')).toBeNull();
    expect(triggerTrap(pit, 'raider')).toBeNull();
  });
  it('Knochenrassel reagiert nur auf Krieger', () => {
    const rattle: Trap = { id: 't3', kind: 'rattle', x: 0, y: 0, uses: 5, meat: 0 };
    const r = triggerTrap(rattle, 'raider')!;
    expect(r.event.kind).toBe('alarm');
    expect(r.trap!.uses).toBe(4);
    expect(triggerTrap(rattle, 'prey')).toBeNull();
    expect(triggerTrap(rattle, 'predator')).toBeNull();
  });
  it('verbrauchte Fallen lösen nicht mehr aus', () => {
    expect(triggerTrap(snare({ uses: 0 }), 'prey')).toBeNull();
  });
  it('Einsammeln leert die Schlinge und gibt das Fleisch zurück', () => {
    const c = collectTrap(snare({ meat: 2 }));
    expect(c.meat).toBe(2);
    expect(c.trap.meat).toBe(0);
  });
});

describe('traps: Platzierung', () => {
  it('lehnt Fallen zu nah aneinander ab', () => {
    expect(trapPlacementError(100 + TRAP_GAP - 1, 100, [snare()])).toBe('Zu nah an einer Falle');
    expect(trapPlacementError(100 + TRAP_GAP, 100, [snare()])).toBeNull();
  });
  it('begrenzt die Gesamtzahl', () => {
    const many = Array.from({ length: MAX_TRAPS }, (_, i) => snare({ id: `t${i}`, x: i * 100 }));
    expect(trapPlacementError(5000, 5000, many)).toBe('Zu viele Fallen');
  });
  it('respektiert blockierte Plätze', () => {
    expect(trapPlacementError(100, 100, [], [{ x: 100, y: 100, r: 20 }])).toBe('Platz ist belegt');
  });
  it('prüft die Materialkosten', () => {
    expect(canAffordTrap('snare', { wood: 2, stone: 0, flint: 0, fiber: 2 })).toBe(true);
    expect(canAffordTrap('snare', { wood: 2, stone: 0, flint: 0, fiber: 1 })).toBe(false);
    expect(canAffordTrap('pit', { wood: 4, stone: 1, flint: 0, fiber: 0 })).toBe(false);
  });
});
