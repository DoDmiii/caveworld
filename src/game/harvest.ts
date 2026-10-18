// Regeln für abbaubare Umwelt (Bäume, Felsen) und ihre Beute.
export type Resource = 'wood' | 'stone' | 'flint' | 'fiber';
export type Stock = Record<Resource, number>;

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

/** Schlägt eine Ressource zum Vorrat; gibt den neuen Vorrat zurück. */
export function gain(stock: Stock, res: Resource, n = 1): Stock {
  return { ...stock, [res]: stock[res] + n };
}
