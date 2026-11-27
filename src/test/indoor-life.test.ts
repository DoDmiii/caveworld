import { it, expect } from 'vitest';
import { indoorGoal } from '@/game/indoor-life';
import { roomWalkable, leavesHut } from '@/game/interiors';
it('Bewohner bewegen sich innerhalb jedes Hüttenstils ohne die Tür zu verlassen', () => {
  for (const style of ['wenja', 'nordic', 'dragon', 'desert'] as const) {
    let pos = { x: 240, y: 172 }, seed = 77;
    for (let n = 0; n < 300; n++) {
      const from = pos; pos = indoorGoal(style, [], pos, () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; });
      expect(roomWalkable(style, pos.x, pos.y)).toBe(true); expect(leavesHut(style, pos.x, pos.y + 16)).toBe(false);
      expect(Math.hypot(pos.x - from.x, pos.y - from.y)).toBeLessThan(55);
    }
  }
});