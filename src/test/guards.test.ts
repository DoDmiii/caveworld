import { describe, it, expect } from 'vitest';
import { assignPost, postSpots, GUARD_POST_POS } from '@/game/guards';
import { CAMP_POS } from '@/game/biomes';

describe('camp guard posts', () => {
  it('assigns and clears posts', () => {
    const b = assignPost({}, 'bruk', 'gate')!;
    expect(b['bruk']?.post).toBe('gate');
    expect(assignPost(b, 'bruk', 'free')!['bruk']).toBeUndefined();
  });
  it('"my position" only works inside the camp', () => {
    expect(assignPost({}, 'tamo', 'here', { x: CAMP_POS.x + 50, y: CAMP_POS.y })!['tamo']).toEqual({ post: 'here', x: CAMP_POS.x + 50, y: CAMP_POS.y });
    expect(assignPost({}, 'tamo', 'here', { x: CAMP_POS.x + 500, y: CAMP_POS.y })).toBeNull();
  });
  it('two guards on one post never share a spot', () => {
    const s = postSpots({ a: { post: 'gate' }, b: { post: 'gate' } }, ['a', 'b'], []);
    const a = s.get('a')!, b = s.get('b')!;
    expect(a).toEqual(GUARD_POST_POS.gate);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(16);
  });
  it('captive watch stands beside a bound captive, else at the fire', () => {
    expect(postSpots({ a: { post: 'captives' } }, ['a'], [{ x: CAMP_POS.x, y: CAMP_POS.y + 20 }]).get('a')).toEqual({ x: CAMP_POS.x + 22, y: CAMP_POS.y + 20 });
    expect(postSpots({ a: { post: 'captives' } }, ['a'], []).get('a')).toEqual(GUARD_POST_POS.fire);
  });
  it('unassigned warriors get no post', () => { expect(postSpots({}, ['a'], []).size).toBe(0); });
});
