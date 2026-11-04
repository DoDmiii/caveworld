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
