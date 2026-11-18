import { describe, it, expect } from 'vitest';
import { DRAGON_VILLAGE, biomeAt, streamDist, STREAM_HALF } from '@/game/biomes';
import { DRAGON_HOUSES, DRAGON_GATE, DRAGON_CANALS, DRAGON_PATHS, dragonPaddyAt, dragonGroundsAt, pathDist } from '@/game/dragon';
import { heightAt, nearCliff } from '@/game/terrain';
import { NORDIC_FOLK } from '@/game/nordic-folk';

const body = (p: { x: number; y: number; bw: number; bh: number }, h = 56) => ({ l: p.x - p.bw / 2, r: p.x + p.bw / 2, t: p.y + h / 2 - 4 - p.bh, b: p.y + h / 2 - 4 });
const hutBodies = DRAGON_HOUSES.map(h => body(h));
const inBody = (x: number, y: number, m = 0) => hutBodies.some(b => x > b.l - m && x < b.r + m && y > b.t - m && y < b.b + m);

describe('Drachenterrasse', () => {
  it('liegt im Gebirge der Drachenmenschen', () => expect(biomeAt(DRAGON_VILLAGE.x, DRAGON_VILLAGE.y)).toBe('dragon'));
  it('nutzt alle 7 Hüttenvarianten', () => expect(new Set(DRAGON_HOUSES.map(h => h.key)).size).toBe(7));
  it('keine Hütte steht in einem Bach', () => DRAGON_HOUSES.forEach(h => expect(streamDist(h.x, h.y + 20)).toBeGreaterThan(STREAM_HALF + 10)));
  it('alle Hütten stehen auf dem Dorfplateau, weg von der Klippe', () => DRAGON_HOUSES.forEach(h => {
    expect(heightAt(h.x, h.y + 20)).toBe(2);
    expect(nearCliff(h.x, h.y + 20, 24)).toBe(false);
  }));
  it('Häuptlingshaus steht am höchsten', () => expect(Math.min(...DRAGON_HOUSES.map(h => h.y))).toBe(DRAGON_HOUSES[0]!.y));
  it('Bewohner starten nicht in einer Hütte', () => NORDIC_FOLK.filter(f => f.village === 3).forEach(f => expect(inBody(f.x, f.y + 6, 6)).toBe(false)));
});

describe('Wege und Tor', () => {
  it('kein Zaunring mehr: nur Torbogen und zwei Totems', () => expect(DRAGON_GATE.map(g => g.key).sort()).toEqual(['dragon-gate', 'dragon-totem-0', 'dragon-totem-1']));
  it('Wege führen an keiner Hütte und keinem Totem vorbei hindurch', () => {
    const totems = DRAGON_GATE.filter(g => g.bw > 0).map(g => body(g, 48));
    for (const line of DRAGON_PATHS) for (let i = 1; i < line.length; i++) for (let t = 0; t <= 1; t += 0.02) {
      const x = line[i - 1]![0] + (line[i]![0] - line[i - 1]![0]) * t, y = line[i - 1]![1] + (line[i]![1] - line[i - 1]![1]) * t;
      expect(inBody(x, y, 4)).toBe(false);
      expect(totems.some(b => x > b.l - 4 && x < b.r + 4 && y > b.t - 4 && y < b.b + 4)).toBe(false);
    }
  });
});

describe('Reisterrassen', () => {
  const beds = new Map<number, number>();
  const samples: [number, number][] = [];
  for (let y = DRAGON_VILLAGE.y; y < DRAGON_VILLAGE.y + 380; y += 4) for (let x = DRAGON_VILLAGE.x - 240; x < DRAGON_VILLAGE.x + 240; x += 4) {
    const p = dragonPaddyAt(x, y); if (!p) continue;
    beds.set(p.id, p.zone); samples.push([x, y]);
  }
  it('drei Terrassen mit je mehreren Beeten', () => {
    for (const z of [0, 1, 2]) expect([...beds.values()].filter(v => v === z).length).toBeGreaterThanOrEqual(3);
  });
  it('kein Beet im Bach, auf dem Weg oder unter einer Hütte', () => samples.forEach(([x, y]) => {
    expect(streamDist(x, y)).toBeGreaterThan(STREAM_HALF);
    expect(pathDist(x, y)).toBeGreaterThan(14);
    expect(inBody(x, y, 8)).toBe(false);
  }));
  it('Felder halten Bäume und Felsen fern', () => samples.forEach(([x, y]) => expect(dragonGroundsAt(x, y)).toBe(true)));
  it('jeder Kanal zweigt vom Bach ab', () => DRAGON_CANALS.forEach(c => expect(streamDist(c[0]![0], c[0]![1])).toBeLessThan(STREAM_HALF)));
});
