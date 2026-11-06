// Regeln für abbaubare Umwelt (Bäume, Felsen) und ihre Beute.
export type Resource = 'wood' | 'stone' | 'flint' | 'fiber';
/** Skulls are a trophy material: counted with the stock, but never harvested or stored in the chest. */
export type Stock = Record<Resource, number> & { skull?: number; wolfPelt?: number; sabrePelt?: number };
export type CostKey = Resource | 'skull' | 'wolfPelt' | 'sabrePelt';

export const TREE_HP = 5;
export const ROCK_HP = 3;

/** Beute beim Fällen eines Baums. */
export const TREE_DROP: Partial<Record<Resource, number>> = { wood: 3, fiber: 1 };
/** Beute beim Abbau eines Felsens. */
export const ROCK_DROP: Partial<Record<Resource, number>> = { stone: 2, flint: 1 };

export const RESOURCE_NAME: Record<Resource, string> = {
  wood: 'Holz',
  stone: 'Stein',
  flint: 'Feuerstein',
  fiber: 'Pflanzenfaser',
};

export const emptyStock = (): Stock => ({ wood: 0, stone: 0, flint: 0, fiber: 0 });
export const COST_NAME: Record<CostKey, string> = { ...RESOURCE_NAME, skull: 'Schädel', wolfPelt: 'Wolfsfell', sabrePelt: 'Säbelzahnfell' };

/** Schlägt eine Ressource zum Vorrat; gibt den neuen Vorrat zurück. */
export function gain(stock: Stock, res: Resource, n = 1): Stock {
  return { ...stock, [res]: stock[res] + n };
}
