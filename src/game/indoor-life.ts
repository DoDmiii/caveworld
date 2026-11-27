import { roomWalkable, leavesHut, type HutStyle, type Furnishing } from './interiors';
/** Small steps with a fully clear segment; furniture and doorways are never wander destinations. */
export function indoorGoal(style: HutStyle, items: readonly Furnishing[], from: { x: number; y: number }, rnd: () => number) {
  const clear = (x: number, y: number) => roomWalkable(style, x, y) && !leavesHut(style, x, y + 16) && !items.some(i => Math.abs(x - i.x) < i.w / 2 + 7 && y > i.y - 12 && y < i.y + 8);
  for (let n = 0; n < 24; n++) {
    const x = from.x + (rnd() - 0.5) * 90, y = from.y + (rnd() - 0.5) * 60;
    if ([0.25, 0.5, 0.75, 1].every(k => clear(from.x + (x - from.x) * k, from.y + (y - from.y) * k))) return { x, y };
  }
  return from;
}