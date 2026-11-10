/** Visible children: look selection (hair + sex) and where a child stays. Engine-free. */
import { NAMES, type Child } from './reproduction';

export type ChildLook = 'nordic-boy' | 'nordic-girl' | 'wenja-boy' | 'wenja-girl' | 'dragon-boy' | 'dragon-girl';
/** Blond Nordic children only have idle turns; the others also walk (8 frames per direction). */
export const CHILD_WALKS: Record<ChildLook, boolean> = {
  'nordic-boy': false, 'nordic-girl': false, 'wenja-boy': true, 'wenja-girl': true, 'dragon-boy': true, 'dragon-girl': true,
};
export const CHILD_WALK_FRAMES = 8;
/** Children stay this close to a free mother and wander a little further around the village centre otherwise. */
export const FOLLOW_RADIUS = 34;
export const HOME_RADIUS = 60;
export const CHILD_SPEED = 22;
/** Player gets the child's name shown within this distance. */
export const NAME_RADIUS = 40;

/** Older saves have no sex; recover it from the alternating name lists. */
export function isGirl(c: Pick<Child, 'name' | 'girl'>): boolean {
  if (c.girl !== undefined) return c.girl;
  for (const list of Object.values(NAMES)) { const i = list.indexOf(c.name); if (i >= 0) return i % 2 === 1; }
  return false;
}

/** The hair decides the people the child looks like – a dark-haired child in a blond village gives the cuckoo away. */
export function childLook(c: Pick<Child, 'hair' | 'name' | 'girl'>): ChildLook {
  const tribe = c.hair === 'blond' ? 'nordic' : c.hair === 'dunkel' ? 'wenja' : 'dragon';
  return `${tribe}-${isGirl(c) ? 'girl' : 'boy'}`;
}

export type MotherSpot = { x: number; y: number; state: 'free' | 'camp' | 'other'; alive: boolean };
/** Children follow a free (or camp-integrated) living mother; otherwise they stay at the village centre. */
export function childAnchor(mother: MotherSpot | undefined, home: { x: number; y: number }): { x: number; y: number; r: number } {
  if (mother && mother.alive && (mother.state === 'free' || mother.state === 'camp')) return { x: mother.x, y: mother.y, r: FOLLOW_RADIUS };
  return { x: home.x, y: home.y, r: HOME_RADIUS };
}
