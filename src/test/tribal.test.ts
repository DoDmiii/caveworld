import { describe, it, expect } from 'vitest';
import { resolveInteraction } from '@/game/tribal';
import { decideReaction } from '@/game/behavior';
import { EMPTY_RELATIONSHIPS, raiseAlarm, isAlarmActive, changeVillageRelationship, getVillageRelationship } from '@/game/relationships';

const goods = { berries: 1, cooked: 0, flint: 0, fiber: 0 };
const free = { state: 'free' as const, capturable: true, relationship: 0, goods };

describe('tribal interactions', () => {
  it('Geschenk kostet eine Beere und bringt +15 Ruf', () => {
    const o = resolveInteraction('gift', free);
    expect(o.goods.berries).toBe(0); expect(o.rel).toBe(15);
  });
  it('ohne Geschenk keine Rufänderung', () => {
    expect(resolveInteraction('gift', { ...free, goods: { ...goods, berries: 0 } }).rel).toBe(0);
  });
  it('Angriff kostet 35 Ruf, alarmiert und lässt Dorfbewohner kapitulieren', () => {
    const o = resolveInteraction('attack', free);
    expect(o).toMatchObject({ rel: -35, alarm: true, state: 'surrender' });
  });
  it('Wachen ergeben sich beim Angriff nicht', () => {
    expect(resolveInteraction('attack', { ...free, capturable: false }).state).toBe('free');
  });
  it('Lösegeld bringt 3 Feuerstein und 2 Fasern und lässt frei', () => {
    const o = resolveInteraction('ransom', { ...free, state: 'bound' });
    expect(o.goods.flint).toBe(3); expect(o.goods.fiber).toBe(2); expect(o.state).toBe('free');
  });
  it('Ruf bleibt zwischen -100 und 100', () => {
    let s = EMPTY_RELATIONSHIPS;
    for (let i = 0; i < 5; i++) s = changeVillageRelationship(s, 'frostheim', -35);
    expect(getVillageRelationship(s, 'frostheim')).toBe(-100);
  });
  it('Alarm läuft nach 20 Sekunden ab', () => {
    const s = raiseAlarm(EMPTY_RELATIONSHIPS, 'eisfurt', 1000);
    expect(isAlarmActive(s, 'eisfurt', 20_999)).toBe(true);
    expect(isAlarmActive(s, 'eisfurt', 21_000)).toBe(false);
  });
  it('bei aktivem Alarm greifen Wachen an', () => {
    const d = decideReaction({ relationship: 0, armed: false, crouching: false, carryingCaptive: false, night: false, witnessedCrime: false, insideVillage: true, alarmActive: true, role: 'guard' });
    expect(d.shouldAttack).toBe(true);
  });
});
