// Engine-free guard-post rules: the player assigns camp warriors to named posts (or a spot of their choice) in the camp management panel.
import type { Pt } from './combat';
import { CAMP_POS } from './biomes';

export const GUARD_POST_IDS = ['free', 'gate', 'fire', 'chest', 'captives', 'west', 'east', 'north', 'here'] as const;
export type GuardPostId = typeof GUARD_POST_IDS[number];
export type GuardAssignment = { post: GuardPostId; x?: number | undefined; y?: number | undefined };
export type GuardBook = Record<string, GuardAssignment>;

export const GUARD_POST_LABEL: Record<GuardPostId, string> = {
  free: 'Frei (wie bisher)', gate: 'Südtor', fire: 'Lagerfeuer', chest: 'Vorratskiste', captives: 'Bei den Gefangenen',
  west: 'Westseite', east: 'Ostseite', north: 'Nordhang', here: 'Mein Standort',
};
/** Fixed posts; none lies on the fur bed, a hut wall or the palisade. */
export const GUARD_POST_POS: Record<Exclude<GuardPostId, 'free' | 'captives' | 'here'>, Pt> = {
  gate: { x: CAMP_POS.x, y: CAMP_POS.y + 128 },
  fire: { x: CAMP_POS.x, y: CAMP_POS.y + 72 },
  chest: { x: CAMP_POS.x - 60, y: CAMP_POS.y + 68 },
  west: { x: CAMP_POS.x - 88, y: CAMP_POS.y + 52 },
  east: { x: CAMP_POS.x + 90, y: CAMP_POS.y + 52 },
  north: { x: CAMP_POS.x, y: CAMP_POS.y - 30 },
};
/** A chosen spot must lie inside the camp. */
export const HERE_RADIUS = 200;
/** Several guards on one post spread out instead of sharing a spot. */
const SPREAD: readonly Pt[] = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: -20, y: 0 }, { x: 0, y: 16 }, { x: 0, y: -16 }, { x: 20, y: 16 }];

export const canPostHere = (p: Pt) => Math.hypot(p.x - CAMP_POS.x, p.y - CAMP_POS.y) <= HERE_RADIUS;

/** Returns the new book, or null when the request is invalid (e.g. "here" outside the camp). */
export function assignPost(book: GuardBook, id: string, post: GuardPostId, player?: Pt): GuardBook | null {
  const next = { ...book };
  if (post === 'free') { delete next[id]; return next; }
  if (post === 'here') {
    if (!player || !canPostHere(player)) return null;
    next[id] = { post, x: Math.round(player.x), y: Math.round(player.y) };
    return next;
  }
  next[id] = { post };
  return next;
}

/** Stand-by spot per assigned warrior; `captives` watch the nearest bound captive in camp, else the fire. */
export function postSpots(book: GuardBook, ids: readonly string[], captives: readonly Pt[]): Map<string, Pt> {
  const out = new Map<string, Pt>(), used = new Map<string, number>();
  for (const id of [...ids].sort()) {
    const a = book[id]; if (!a || a.post === 'free') continue;
    let base: Pt;
    if (a.post === 'here') { if (a.x === undefined || a.y === undefined) continue; base = { x: a.x, y: a.y }; }
    else if (a.post === 'captives') {
      const c = captives.filter(canPostHere).sort((p, q) => Math.hypot(p.x - CAMP_POS.x, p.y - CAMP_POS.y) - Math.hypot(q.x - CAMP_POS.x, q.y - CAMP_POS.y))[0];
      base = c ? { x: c.x + 22, y: c.y } : GUARD_POST_POS.fire;
    } else base = GUARD_POST_POS[a.post];
    const key = `${Math.round(base.x)},${Math.round(base.y)}`, n = used.get(key) ?? 0; used.set(key, n + 1);
    const o = SPREAD[n % SPREAD.length]!;
    out.set(id, { x: base.x + o.x, y: base.y + o.y });
  }
  return out;
}
