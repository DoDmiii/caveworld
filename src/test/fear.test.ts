import { describe, it, expect } from 'vitest';
import { EMPTY_FEAR, addFear, decayFear, moraleBreaks, demandTribute, fearOf } from '@/game/fear';

describe('fear', () => {
  it('execution adds 18 fear, capped at 100', () => {
    expect(fearOf(addFear(EMPTY_FEAR, 'frostheim', 'execution'), 'frostheim')).toBe(18);
    let s = EMPTY_FEAR; for (let i = 0; i < 10; i++) s = addFear(s, 'frostheim', 'champion');
    expect(fearOf(s, 'frostheim')).toBe(100);
  });
  it('fear fades 6 per game day', () => {
    const s = addFear(EMPTY_FEAR, 'eisfurt', 'champion');
    expect(fearOf(decayFear(s, 2), 'eisfurt')).toBe(18);
  });
  it('warriors break at 70, or 55 at night', () => {
    expect(moraleBreaks(60, false)).toBe(false);
    expect(moraleBreaks(55, true)).toBe(true);
    expect(moraleBreaks(70, false)).toBe(true);
  });
  it('tribute needs 50 fear and is once per day; third payment triggers revenge', () => {
    let s = { ...EMPTY_FEAR, fear: { v: 49 } };
    expect(demandTribute(s, 'v', 1)).toBeNull();
    s = { ...s, fear: { v: 60 } };
    const a = demandTribute(s, 'v', 1)!; expect(a.cooked).toBe(3); expect(a.revenge).toBe(false);
    expect(demandTribute(a.state, 'v', 1)).toBeNull();
    const b = demandTribute(a.state, 'v', 2)!; const c = demandTribute(b.state, 'v', 3)!;
    expect(c.revenge).toBe(true);
  });
});
