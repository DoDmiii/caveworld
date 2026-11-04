import { describe, it, expect } from 'vitest';
import { headStage, SKULL_DECAY_MINUTES } from '@/game/decay';
import { STRUCTURES, canAfford, pay } from '@/game/building';

describe('skull decay', () => {
  it('head stays fresh before three game days', () => {
    expect(SKULL_DECAY_MINUTES).toBe(4320);
    expect(headStage(1000, 1000 + 4319)).toBe('fresh');
  });
  it('head is a skull after three game days', () => expect(headStage(1000, 1000 + 4320)).toBe('skull'));
  it('a taken skull never comes back', () => expect(headStage(0, 99999, true)).toBe('taken'));
});
describe('trophy pole', () => {
  it('costs 1 skull and 4 wood', () => {
    const stock = { wood: 4, stone: 0, flint: 0, fiber: 0, skull: 1 };
    expect(canAfford(STRUCTURES.totem.cost, stock)).toBe(true);
    expect(canAfford(STRUCTURES.totem.cost, { ...stock, skull: 0 })).toBe(false);
    expect(pay(STRUCTURES.totem.cost, stock)).toEqual({ wood: 0, stone: 0, flint: 0, fiber: 0, skull: 0 });
  });
});

import { pickCarcass, MAX_FEEDERS } from '@/game/scavenge';
describe('scavenging wolves', () => {
  const c = { id: 'a', x: 100, y: 0, deathClock: 0 };
  it('smell a fresh corpse within 420 px', () => {
    expect(pickCarcass({ x: 0, y: 0 }, [c], 100, {})?.id).toBe('a');
    expect(pickCarcass({ x: 0, y: 0 }, [{ ...c, x: 500 }], 100, {})).toBeUndefined();
  });
  it('ignore bones after three days', () => expect(pickCarcass({ x: 0, y: 0 }, [c], 4320, {})).toBeUndefined());
  it('at most 3 wolves per corpse', () => {
    expect(MAX_FEEDERS).toBe(3);
    expect(pickCarcass({ x: 0, y: 0 }, [c], 100, { a: 3 })).toBeUndefined();
  });
});

import { feedingSight, FEED_ALERT_RATE } from '@/game/scavenge';
describe('feeding wolves', () => {
  it('only notice the player very close', () => { expect(feedingSight(false)).toBe(48); expect(feedingSight(true)).toBe(28); });
  it('build alert at half speed', () => expect(FEED_ALERT_RATE).toBe(0.5));
});
