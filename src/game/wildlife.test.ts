import { describe, expect, it } from 'vitest';
import { SNOW, DEATH, deathStart } from './wildlife';

describe('wildlife', () => {
  it('red mountain wolves and water buffalo live in the dragon mountains', () => {
    expect(SNOW.dhole.home).toBe('dragon');
    expect(SNOW.buffalo.home).toBe('dragon');
    expect(SNOW.buffalo.aggressive).toBe(false);
    expect(SNOW.dhole.pack).toBe(true);
  });
  it('death rows start per facing direction', () => {
    expect(deathStart('wolf', 0)).toBe(0);
    expect(deathStart('wolf', 3)).toBe(3 * DEATH.wolf.frames);
    expect(deathStart('mammoth', 7)).toBe(7 * 6);
  });
});
