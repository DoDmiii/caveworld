import { describe, it, expect } from 'vitest';
import { woundFrom, bleedDamage, limpFactor, inDanger, BLEED_MS, BANDAGE_BLEED_MS } from '../game/wounds';

describe('wounds', () => {
  it('heavy hit can open a wound, weak hit cannot', () => {
    expect(woundFrom(0, 10, 0.1, 1000, false)).toBe(1000 + BLEED_MS);
    expect(woundFrom(0, 5, 0.1, 1000, false)).toBe(0);
  });
  it('bandage shortens bleeding', () => {
    expect(woundFrom(0, 10, 0.1, 1000, true)).toBe(1000 + BANDAGE_BLEED_MS);
    expect(woundFrom(99999, 3, 0.9, 1000, true)).toBe(1000 + BANDAGE_BLEED_MS);
  });
  it('bleeding drains health only while active', () => {
    expect(bleedDamage(2000, 1000, 1)).toBeGreaterThan(0);
    expect(bleedDamage(500, 1000, 1)).toBe(0);
  });
  it('limps below 30 health, danger below 25', () => {
    expect(limpFactor(29)).toBe(0.75);
    expect(limpFactor(30)).toBe(1);
    expect(inDanger(24)).toBe(true);
    expect(inDanger(25)).toBe(false);
  });
});
