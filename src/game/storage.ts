// Engine-free rules for the camp storage chest: what can be stored and how transfers work.
export type Storable = 'wood' | 'stone' | 'flint' | 'fiber' | 'berries' | 'meat' | 'cooked';
export type ChestGoods = Record<Storable, number>;

export const STORABLES: Storable[] = ['wood', 'stone', 'flint', 'fiber', 'berries', 'meat', 'cooked'];
export const EMPTY_CHEST: ChestGoods = { wood: 0, stone: 0, flint: 0, fiber: 0, berries: 0, meat: 0, cooked: 0 };

/** Chest stands left of the campfire, mirroring the bed on the right. */
export const CHEST_POS = { x: 954, y: 690 };
export const CHEST_RANGE = 36;

/** Move `n` items of one kind from the player into the chest. Returns undefined when impossible. */
export function deposit(chest: ChestGoods, player: ChestGoods, kind: Storable, n: number): { chest: ChestGoods; player: ChestGoods } | undefined {
  if (n <= 0 || player[kind] < n) return undefined;
  return { chest: { ...chest, [kind]: chest[kind] + n }, player: { ...player, [kind]: player[kind] - n } };
}

/** Move `n` items of one kind from the chest back to the player. Returns undefined when impossible. */
export function withdraw(chest: ChestGoods, player: ChestGoods, kind: Storable, n: number): { chest: ChestGoods; player: ChestGoods } | undefined {
  if (n <= 0 || chest[kind] < n) return undefined;
  return { chest: { ...chest, [kind]: chest[kind] - n }, player: { ...player, [kind]: player[kind] + n } };
}

/** Total items stored, for the HUD summary line. */
export const chestTotal = (c: ChestGoods) => STORABLES.reduce((sum, k) => sum + c[k], 0);
