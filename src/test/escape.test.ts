import { describe, it, expect } from 'vitest';
import { loosen, isLoose, guarded, syncBound, rescueDue, sentRescue, runnerStep, EMPTY_ESCAPE, RESCUE_DELAY_MIN, ESCAPE_DIST } from '@/game/escape';

describe('captive escape', () => {
  it('guarded captives make no progress', () => { expect(loosen(10, 100, true, true)).toBe(10); });
  it('unguarded nights loosen ropes much faster than days', () => {
    expect(isLoose(loosen(0, 250, true, false))).toBe(true);
    expect(isLoose(loosen(0, 250, false, false))).toBe(false);
  });
  it('a sleeping player does not guard', () => {
    expect(guarded({ x: 0, y: 0 }, { x: 10, y: 0, asleep: true }, [])).toBe(false);
    expect(guarded({ x: 0, y: 0 }, { x: 10, y: 0, asleep: false }, [])).toBe(true);
    expect(guarded({ x: 0, y: 0 }, null, [{ x: 20, y: 0 }])).toBe(true);
  });
  it('tracks when captives were bound and forgets freed ones', () => {
    const a = syncBound(EMPTY_ESCAPE, ['x'], 50);
    expect(a.since['x']).toBe(50);
    const b = syncBound({ ...a, progress: { x: 40 } }, [], 90);
    expect(b.progress['x']).toBeUndefined();
  });
  it('rescue scouts only come at night after a day of captivity, then wait', () => {
    const s = syncBound(EMPTY_ESCAPE, ['x'], 0);
    expect(rescueDue(s, 'v', ['x'], RESCUE_DELAY_MIN - 1, true, false)).toBe(false);
    expect(rescueDue(s, 'v', ['x'], RESCUE_DELAY_MIN, false, false)).toBe(false);
    expect(rescueDue(s, 'v', ['x'], RESCUE_DELAY_MIN, true, true)).toBe(false);
    expect(rescueDue(s, 'v', ['x'], RESCUE_DELAY_MIN, true, false)).toBe(true);
    expect(rescueDue(sentRescue(s, 'v', RESCUE_DELAY_MIN), 'v', ['x'], RESCUE_DELAY_MIN + 10, true, false)).toBe(false);
  });
  it('runners are caught on touch and free beyond the escape distance', () => {
    expect(runnerStep({ x: 0, y: 0 }, { x: 0, y: 0 }, [{ x: 10, y: 0 }])).toBe('caught');
    expect(runnerStep({ x: ESCAPE_DIST + 1, y: 0 }, { x: 0, y: 0 }, [])).toBe('escaped');
    expect(runnerStep({ x: 100, y: 0 }, { x: 0, y: 0 }, [])).toBe('running');
  });
});
