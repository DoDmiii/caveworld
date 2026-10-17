export type Food = 'berries' | 'meat' | 'cooked';
export type Pantry = { health: number; stamina: number; berries: number; meat: number; cooked: number };

export const FOOD: Record<Food, { name: string; heal: number; stamina: number }> = {
  berries: { name: 'Beeren', heal: 15, stamina: 0 },
  meat: { name: 'Rohes Fleisch', heal: 20, stamina: 0 },
  cooked: { name: 'Gebratenes Fleisch', heal: 45, stamina: 100 },
};

/** Eats one portion; returns undefined when nothing is left or it would have no effect. */
export function eat(p: Pantry, food: Food): Pantry | undefined {
  if (p[food] <= 0) return undefined;
  const f = FOOD[food];
  if (p.health >= 100 && (f.stamina === 0 || p.stamina >= 100)) return undefined;
  return { ...p, [food]: p[food] - 1, health: Math.min(100, p.health + f.heal), stamina: Math.min(100, p.stamina + f.stamina) };
}

/** Roasts one raw meat at the fire. */
export function roast(p: Pantry): Pantry | undefined {
  return p.meat > 0 ? { ...p, meat: p.meat - 1, cooked: p.cooked + 1 } : undefined;
}
