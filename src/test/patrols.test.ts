import { describe, it, expect } from 'vitest';
import { warningLevel, patrolsActive, patrolAttacks, patrolRoute, pickBark, BARKS } from '@/game/patrols';

describe('Warnstufen und Patrouillen', () => {
  it('Alarm macht ein Dorf sofort feindselig', () => expect(warningLevel(80, true)).toBe(3));
  it('Ruf -25 ist angespannt, -60 feindselig, 0 ruhig', () => {
    expect(warningLevel(-25, false)).toBe(2);
    expect(warningLevel(-60, false)).toBe(3);
    expect(warningLevel(0, false)).toBe(0);
  });
  it('Patrouillen laufen erst ab angespannt', () => {
    expect(patrolsActive(1)).toBe(false); expect(patrolsActive(2)).toBe(true);
  });
  it('nur feindselige Patrouillen greifen in Sichtweite an', () => {
    expect(patrolAttacks(2, 50)).toBe(false); expect(patrolAttacks(3, 50)).toBe(true); expect(patrolAttacks(3, 200)).toBe(false);
  });
  it('Route liegt außerhalb des Dorfzauns', () => {
    const v = { x: 0, y: 0, r: 200 };
    for (const w of patrolRoute(v, 2)) expect(Math.hypot(w.x, w.y)).toBeGreaterThan(v.r);
  });
  it('Sprechblasen stammen aus der passenden Liste', () => expect(BARKS.attack).toContain(pickBark('attack', 7)));
});
