import { describe, it, expect } from 'vitest';
import { childLook, childAnchor, isGirl, FOLLOW_RADIUS, HOME_RADIUS } from '@/game/children';
import { EMPTY_REPRO, conceive, advanceDay, PLAYER } from '@/game/reproduction';

describe('children', () => {
  it('a Nordic couple gets a blond child, the player a dark-haired one', () => {
    expect(childLook({ hair: 'blond', name: 'Keno' })).toBe('nordic-boy');
    expect(childLook({ hair: 'dunkel', name: 'Alva' })).toBe('wenja-girl');
    expect(childLook({ hair: 'schwarz', name: 'Lin' })).toBe('dragon-girl');
  });
  it('older saves without sex use the alternating name list', () => {
    expect(isGirl({ name: 'Sigra' })).toBe(true);
    expect(isGirl({ name: 'Hu' })).toBe(false);
    expect(isGirl({ name: 'Hu', girl: true })).toBe(true);
  });
  it('the second child born in a tribe is a girl', () => {
    let s = { ...conceive(EMPTY_REPRO, 'nordic-w1', PLAYER, undefined, 1, 0), day: 1 };
    s = conceive(s, 'nordic-w0', PLAYER, undefined, 1, 0);
    const kids = advanceDay(s, 4, {}, () => 1).state.children;
    expect(kids.map(k => k.girl)).toEqual([false, true]);
  });
  it('follows a living free mother, otherwise stays at the village', () => {
    const home = { x: 0, y: 0 };
    expect(childAnchor({ x: 50, y: 60, state: 'free', alive: true }, home)).toEqual({ x: 50, y: 60, r: FOLLOW_RADIUS });
    expect(childAnchor({ x: 50, y: 60, state: 'free', alive: false }, home)).toEqual({ x: 0, y: 0, r: HOME_RADIUS });
    expect(childAnchor({ x: 50, y: 60, state: 'other', alive: true }, home).r).toBe(HOME_RADIUS);
  });
});
