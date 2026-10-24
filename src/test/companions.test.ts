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
    for (let i = 0; i < slots.length; i++) for (const other of slots.slice(i + 1)) expect(Math.hypot(slots[i].x - other.x, slots[i].y - other.y)).toBeGreaterThanOrEqual(28);
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
});