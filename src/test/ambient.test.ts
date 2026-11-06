import { describe, it, expect } from 'vitest';
import { createFlocks, createFish, tickFlocks, tickFish, flushRadius } from '../game/ambient';

const walk = { running: false, crouching: false, moving: true };
const sneak = { running: false, crouching: true, moving: true };

describe('ambient wildlife', () => {
  it('sneaking keeps birds calm at walking distance, walking flushes them', () => {
    const f = createFlocks()[0]!;
    expect(tickFlocks([f], f.x + 50, f.y, sneak, 0, 16)).toHaveLength(0);
    expect(tickFlocks([f], f.x + 50, f.y, walk, 0, 16)).toHaveLength(1);
    expect(f.birds.every(b => b.state === 'flee')).toBe(true);
  });
  it('standing still never scares', () => expect(flushRadius({ running: true, crouching: false, moving: false })).toBe(0));
  it('fish dart away from a wading player but not from a crouching one', () => {
    const fish = createFish(); const f = fish[0]!;
    expect(tickFish([f], f.x + 10, f.y, sneak, 0, 16)).toBe(false);
    expect(tickFish([f], f.x + 10, f.y, walk, 0, 16)).toBe(true);
  });
});
