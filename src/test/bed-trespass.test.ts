import { describe, expect, it } from 'vitest';
import { bedTrespass } from '@/game/bed-trespass';

describe('sleeping in foreign beds', () => {
  it('own camp huts have no consequences', () => {
    expect(bedTrespass({ foreign: false, residents: 3, inside: 2, roll: 0 }).noticed).toBe(false);
  });
  it('residents inside catch the player and grow clearly suspicious', () => {
    expect(bedTrespass({ foreign: true, residents: 2, inside: 1, roll: 0.99 })).toEqual({ noticed: true, caught: true, relationship: -15 });
  });
  it('absent residents notice the slept-in bed half of the time', () => {
    expect(bedTrespass({ foreign: true, residents: 2, inside: 0, roll: 0.3 })).toEqual({ noticed: true, caught: false, relationship: -8 });
    expect(bedTrespass({ foreign: true, residents: 2, inside: 0, roll: 0.7 }).noticed).toBe(false);
  });
  it('an empty hut without residents tells no one', () => {
    expect(bedTrespass({ foreign: true, residents: 0, inside: 0, roll: 0 }).noticed).toBe(false);
  });
});
