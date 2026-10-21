import type { Resource, Stock } from './harvest';

/** XP-Belohnungen pro Tätigkeit. */
export const XP = { tree: 15, rock: 15, gazelle: 35, tiger: 100, wolf: 50, bear: 120, mammoth: 150, berry: 5, roast: 10, craft: 25 } as const;

/** Gesamt-XP, die für das Erreichen eines Levels nötig sind (Lv. 1 = 0). */
export function xpForLevel(level: number): number {
  return level <= 1 ? 0 : 50 * (level - 1) * level; // 2:100, 3:300, 4:600 …
}
export function levelFromXp(xp: number): number {
  let l = 1;
  while (xp >= xpForLevel(l + 1)) l++;
  return l;
}

export type ItemId = 'axe' | 'spear' | 'club' | 'torch' | 'bandage' | 'bag' | 'fur' | 'bundle' | 'bola';
export const ITEM_IDS = ['axe', 'spear', 'club', 'torch', 'bandage', 'bag', 'fur', 'bundle', 'bola'] as const satisfies readonly ItemId[];
export type Recipe = { id: ItemId; name: string; level: number; cost: Partial<Record<Resource, number>>; effect?: string };
export const RECIPES: Recipe[] = [
  { id: 'club', name: 'Holzkeule', level: 1, cost: { wood: 3 } },
  { id: 'torch', name: 'Fackel', level: 1, cost: { wood: 2, fiber: 1 }, effect: 'Nachts halb so viel Kälte' },
  { id: 'bandage', name: 'Heilwickel', level: 1, cost: { fiber: 3 }, effect: 'Heilt langsam, solange du satt bist' },
  { id: 'spear', name: 'Steinspeer', level: 2, cost: { wood: 4, stone: 1, fiber: 1 } },
  { id: 'bag', name: 'Lederbeutel', level: 2, cost: { fiber: 4, wood: 1 }, effect: 'Doppelte Ressourcen beim Aufheben' },
  { id: 'fur', name: 'Fellkleidung', level: 3, cost: { fiber: 6, wood: 2, flint: 1 }, effect: 'Halbe Kälte überall' },
  { id: 'bundle', name: 'Wurfspeer-Bündel', level: 3, cost: { wood: 8, stone: 3, fiber: 3 }, effect: 'Nach dem Wurf bleibt ein Speer in der Hand' },
  { id: 'bola', name: 'Bola', level: 4, cost: { stone: 4, fiber: 4, flint: 2 }, effect: 'Anvisierte Tiere werden 6 s langsamer' },
];
/** Gegenstände, die passiv wirken (nicht in die Hand). */
export const PASSIVE: readonly ItemId[] = ['torch', 'bandage', 'bag', 'fur', 'bundle', 'bola'];

/** Faktor auf den Wärmeverlust. */
export function coldFactor(owned: readonly ItemId[], night: boolean): number {
  let f = 1;
  if (owned.includes('fur')) f *= 0.5;
  if (night && owned.includes('torch')) f *= 0.5;
  return f;
}
export const BANDAGE_HP_PER_SEC = 0.5;
export const BOLA_SLOW = 0.4;
export const BOLA_MS = 6000;
export const pickupAmount = (owned: readonly ItemId[]) => (owned.includes('bag') ? 2 : 1);

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
