import { describe, expect, it } from 'vitest';
import { ADULT_WOMEN, isWillingByRelationship, closenessReluctance, willingRelationship, closenessRefusal, closenessWitnesses, blocksSight, type ClosenessContext } from '../game/bonding';
import type { Observer } from '../game/events';
import { getAvailableInteractions } from '../game/interactions';
const eligible: ClosenessContext = { adultWoman: true, playerAdult: true, free: true, ready: true, willing: true, playerArmed: false, carrying: false, inRange: true };
const target = { id: 'dragon-w2', village: 'dragon', x: 0, y: 0, ownTribe: false };
const guard: Observer = { id: 'guard', village: 'dragon', role: 'guard', x: 100, y: 0 };
describe('voluntary closeness', () => {
  it('permits an adult woman who freely accepts', () => expect(closenessRefusal(eligible)).toBeNull());
  it('requires adult participants', () => {
    expect(closenessRefusal({ ...eligible, playerAdult: false })).not.toBeNull();
    expect(closenessRefusal({ ...eligible, adultWoman: false })).not.toBeNull();
    expect(ADULT_WOMEN.has('dragon-w2')).toBe(true);
    expect(ADULT_WOMEN.has('ally-0')).toBe(false);
  });
  it('excludes captives', () => expect(closenessRefusal({ ...eligible, free: false })).not.toBeNull());
  it('excludes defeated participants', () => expect(closenessRefusal({ ...eligible, ready: false })).not.toBeNull());
  it('requires willingness, not just availability', () => expect(closenessRefusal({ ...eligible, willing: false })).not.toBeNull());
  it('does not offer intimacy to captive targets', () => {
    expect(getAvailableInteractions({ target: 'captive', targetRole: 'villager', relationship: 100, hasGift: false, hasTradeGoods: false, targetDefeated: true, targetBound: true, targetCarried: false, isOwnTribe: false, inRange: true, closeness: eligible }).some(o => o.id === 'bond')).toBe(false);
  });
  it('same-tribe visible witnesses interrupt foreign encounters', () => expect(closenessWitnesses(target, [guard], false)).toEqual([guard]));
  it('other tribes do not interrupt', () => expect(closenessWitnesses(target, [{ ...guard, village: 'other' }], false)).toEqual([]));
  it('own-tribe encounters are not interrupted by witnesses', () => expect(closenessWitnesses({ ...target, ownTribe: true }, [guard], false)).toEqual([]));
  it('cannot see through obstacles', () => expect(closenessWitnesses(target, [guard], false, () => true)).toEqual([]));
  it('sleeping, bound witnesses and the partner are excluded', () => expect(closenessWitnesses(target, [{ ...guard, asleep: true }, { ...guard, bound: true }, { ...guard, id: target.id }], false)).toEqual([]));
  it('uses the shorter night sight range', () => expect(closenessWitnesses(target, [{ ...guard, x: 120 }], true)).toEqual([]));
  it('building intersection blocks only intersecting sight lines', () => {
    const rect = { x: 40, y: -10, width: 20, height: 20 };
    expect(blocksSight(0, 0, 100, 0, rect)).toBe(true);
    expect(blocksSight(0, 30, 100, 30, rect)).toBe(false);
  });
  it('Drachenfrauen stimmen früher zu als andere Fremde, nie bei Alarm', () => {
    expect(willingRelationship('dragon-w2')).toBeLessThan(willingRelationship('nordic-w0'));
    expect(isWillingByRelationship('dragon-w2', 30, false)).toBe(true);
    expect(isWillingByRelationship('nordic-w0', 30, false)).toBe(false);
    expect(isWillingByRelationship('dragon-w2', 90, true)).toBe(false);
    expect(isWillingByRelationship('dragon-w2', 10, false)).toBe(false);
  });
  it('nennt dem Spieler den Grund statt nur abzulehnen', () => {
    expect(closenessReluctance('dragon-w2', 10, false)).toContain('10/25');
    expect(closenessReluctance('nordic-w0', 10, false)).toContain('10/55');
    expect(closenessReluctance('dragon-w2', 90, true)).toContain('Alarm');
    expect(closenessRefusal({ ...eligible, willing: false, reluctance: 'Grund X' })).toBe('Grund X');
  });
});
