import { describe, it, expect } from 'vitest';
import { canRecruit, formationSlot, companionSpeed } from '../game/companions';
import { clearCompanionPoint, findCompanionPath } from '../game/companion-movement';
import { getAvailableInteractions, type InteractionContext } from '../game/interactions';

describe('hunting party', () => {
  it('recruits up to three companions', () => {
    expect(canRecruit(true, 2, false)).toBe(true);
    expect(canRecruit(true, 3, false)).toBe(false);
  });
  it('only recruits own tribe members', () => {
    expect(canRecruit(false, 0, false)).toBe(false);
    expect(canRecruit(true, 0, false)).toBe(true);
  });
  it('does not recruit the same companion twice', () => {
    expect(canRecruit(true, 1, true)).toBe(false);
  });
  it('keeps three distinct slots behind the player', () => {
    const slots = [0, 1, 2].map(i => formationSlot(i, { x: 100, y: 100 }, 0));
    expect(slots.every(s => s.x < 100)).toBe(true);
    slots.forEach((slot, i) => { for (const other of slots.slice(i + 1)) expect(Math.hypot(slot.x - other.x, slot.y - other.y)).toBeGreaterThanOrEqual(28); });
  });
  it('keeps pace when sprinting and slows while sneaking', () => {
    expect(companionSpeed(true, false, 40)).toBeGreaterThanOrEqual(105);
    expect(companionSpeed(false, true, 40)).toBe(34);
  });
  it('offers follow and wait to camp members, but no attack', () => {
    const ctx: InteractionContext = { target: 'ally', targetRole: 'villager', relationship: 100, hasGift: false, hasTradeGoods: false, targetDefeated: false, targetBound: false, targetCarried: false, isOwnTribe: true, inRange: true, companionCount: 3 };
    const options = getAvailableInteractions(ctx);
    expect(options.find(o => o.id === 'follow')?.disabled).toBe(true);
    expect(options.find(o => o.id === 'wait')?.disabled).toBe(false);
    expect(options.some(o => o.id === 'attack')).toBe(false);
  });
  it('walks around solid obstacles instead of crossing them', () => {
    const blocks = [{ x: 140, y: 90, width: 24, height: 60 }];
    const path = findCompanionPath({ x: 100, y: 100 }, { x: 210, y: 100 }, blocks);
    expect(path.length).toBeGreaterThan(1);
    expect(path.every(p => clearCompanionPoint(p, blocks))).toBe(true);
    expect(path.at(-1)?.x).toBeGreaterThanOrEqual(200);
  });
  it('can return to camp from a distant region without teleporting', () => {
    const blocks = [{ x: 1500, y: 800, width: 24, height: 500 }];
    const path = findCompanionPath({ x: 2200, y: 1000 }, { x: 950, y: 710 }, blocks);
    expect(path.length).toBeGreaterThan(20);
    expect(path.every(p => clearCompanionPoint(p, blocks))).toBe(true);
    expect(Math.hypot((path.at(-1)?.x ?? 0) - 950, (path.at(-1)?.y ?? 0) - 710)).toBeLessThan(24);
  });
});
import { pickAllyTarget, ALLY_ENGAGE_RANGE } from '@/game/companions';
describe('joint combat targeting', () => {
  const player = { x: 0, y: 0 };
  it('prefers the foe the player is fighting', () => {
    const t = pickAllyTarget([{ id: 'a', x: 20, y: 0, hostile: true, alive: true }, { id: 'b', x: 90, y: 0, hostile: false, alive: true }], player, 'b');
    expect(t?.id).toBe('b');
  });
  it('otherwise attacks the nearest hostile foe', () => {
    const t = pickAllyTarget([{ id: 'a', x: 120, y: 0, hostile: true, alive: true }, { id: 'b', x: 40, y: 0, hostile: true, alive: true }, { id: 'c', x: 10, y: 0, hostile: false, alive: true }], player);
    expect(t?.id).toBe('b');
  });
  it('ignores dead foes and foes beyond the leash range', () => {
    expect(pickAllyTarget([{ id: 'a', x: ALLY_ENGAGE_RANGE + 1, y: 0, hostile: true, alive: true }, { id: 'b', x: 5, y: 0, hostile: true, alive: false }], player)).toBeUndefined();
  });
});
import { hitAlly, newAllyHealth, tickAllyHealth, pickVictim, ALLY_HP } from '@/game/companions';
describe('companion health', () => {
  it('is knocked out at 0 HP, not killed, and stands up after 9 s with 20 HP', () => {
    const down = hitAlly({ hp: 10, downUntil: 0 }, 12, 1000);
    expect(down).toEqual({ hp: 0, downUntil: 10000 });
    expect(hitAlly(down, 12, 2000)).toBe(down);
    expect(tickAllyHealth(down, 9999, 16, false)).toBe(down);
    expect(tickAllyHealth(down, 10000, 16, false)).toEqual({ hp: 20, downUntil: 0 });
  });
  it('heals 1 HP/s in the field and 5 HP/s by the fire', () => {
    expect(tickAllyHealth({ hp: 20, downUntil: 0 }, 0, 1000, false).hp).toBe(21);
    expect(tickAllyHealth({ hp: 20, downUntil: 0 }, 0, 1000, true).hp).toBe(25);
    expect(tickAllyHealth(newAllyHealth(), 0, 1000, true).hp).toBe(ALLY_HP);
  });
  it('enemies hit the closest standing target', () => {
    expect(pickVictim({ x: 0, y: 0 }, { x: 15, y: 0 }, [{ id: 'a', x: 8, y: 0 }], 19)).toBe('a');
    expect(pickVictim({ x: 0, y: 0 }, { x: 8, y: 0 }, [{ id: 'a', x: 15, y: 0 }], 19)).toBe('player');
    expect(pickVictim({ x: 0, y: 0 }, { x: 50, y: 0 }, [], 19)).toBeUndefined();
  });
});
