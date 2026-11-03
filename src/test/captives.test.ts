import { describe, expect, it } from 'vitest';
import { strike, interact, drop, adopt, canExecute, type Captive } from '@/game/captives';

const free: Captive = { id: 'nordic-w0', state: 'free', x: 0, y: 0 };

describe('captives', () => {
  it('a hit makes a capturable villager surrender', () => expect(strike(free, true).state).toBe('surrender'));
  it('guards cannot be captured', () => expect(strike(free, false).state).toBe('free'));
  it('surrendered villagers get tied up', () => expect(interact({ ...free, state: 'surrender' }, false).state).toBe('bound'));
  it('only one captive can be carried at a time', () => expect(interact({ ...free, state: 'bound' }, true).state).toBe('bound'));
  it('dropping in the camp keeps the captive bound until released manually', () => expect(drop({ ...free, state: 'carried' }, 1000, 700, true).state).toBe('bound'));
  it('adopting only works for bound captives inside the camp', () => { expect(adopt({ ...free, state: 'bound' }, true).state).toBe('camp'); expect(adopt({ ...free, state: 'bound' }, false).state).toBe('bound'); });
  it('only surrendered or bound people can be executed, and only with the Steinkeil', () => { expect(canExecute({ ...free, state: 'bound' }, true)).toBe(true); expect(canExecute({ ...free, state: 'surrender' }, true)).toBe(true); expect(canExecute({ ...free, state: 'bound' }, false)).toBe(false); expect(canExecute({ ...free, state: 'camp' }, true)).toBe(false); expect(canExecute(free, true)).toBe(false); });
  it('dropping outside the camp leaves them bound', () => expect(drop({ ...free, state: 'carried' }, 300, -300, false)).toEqual({ id: 'nordic-w0', state: 'bound', x: 300, y: -300 }));
});
