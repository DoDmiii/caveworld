import type { Resource, Stock } from './harvest';

/** XP-Belohnungen pro Tätigkeit. */
export const XP = { tree: 15, rock: 15, gazelle: 35, tiger: 100, berry: 5, roast: 10, craft: 25 } as const;

/** Gesamt-XP, die für das Erreichen eines Levels nötig sind (Lv. 1 = 0). */
export function xpForLevel(level: number): number {
  return level <= 1 ? 0 : 50 * (level - 1) * level; // 2:100, 3:300, 4:600 …
}
export function levelFromXp(xp: number): number {
  let l = 1;
  while (xp >= xpForLevel(l + 1)) l++;
  return l;
}

export type ItemId = 'axe' | 'spear' | 'club';
export type Recipe = { id: ItemId; name: string; level: number; cost: Partial<Record<Resource, number>> };
export const RECIPES: Recipe[] = [
  { id: 'club', name: 'Holzkeule', level: 1, cost: { wood: 3 } },
  { id: 'spear', name: 'Steinspeer', level: 2, cost: { wood: 4, stone: 1, fiber: 1 } },
];

export function canCraft(r: Recipe, stock: Stock, level: number, owned: readonly ItemId[]): boolean {
  if (level < r.level || owned.includes(r.id)) return false;
  return (Object.entries(r.cost) as [Resource, number][]).every(([k, n]) => stock[k] >= n);
}
export function craft(r: Recipe, stock: Stock, level: number, owned: readonly ItemId[]): Stock | null {
  if (!canCraft(r, stock, level, owned)) return null;
  const next = { ...stock };
  for (const [k, n] of Object.entries(r.cost) as [Resource, number][]) next[k] -= n;
  return next;
}
