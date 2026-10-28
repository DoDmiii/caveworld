/** Engine-free profile bonuses (step 2). Field bonuses need the person following; camp bonuses need them in the tribe. */
import type { ItemId, Recipe } from './progress';

export type PartyBonuses = { meat: number; berries: number; craftDiscount: boolean; bandage: number; fireRange: number; snowCold: number };
export const NO_BONUS: PartyBonuses = { meat: 0, berries: 0, craftDiscount: false, bandage: 1, fireRange: 1, snowCold: 1 };

/** following/tribe hold profile ids (e.g. 'tamo'); trust maps profile id → trust. */
export function partyBonuses(following: readonly string[], tribe: readonly string[], trust: Record<string, number> = {}): PartyBonuses {
  const f = new Set(following), t = new Set(tribe);
  return {
    meat: (f.has('tamo') ? 0.15 : 0) + (f.has('skorra') && (trust['skorra'] ?? 0) >= 60 ? 0.25 : 0),
    berries: f.has('nuka') ? 0.4 : 0,
    craftDiscount: t.has('orka'),
    bandage: t.has('ura') ? 1.5 : 1,
    fireRange: t.has('kuruk') ? 1.25 : 1,
    snowCold: f.has('torvik') ? 0.85 : 1,
  };
}

const FORGED: readonly ItemId[] = ['axe', 'spear', 'club'];
/** Orka: axe, spear and club cost 1 less of each material (minimum 1). */
export function discountedRecipe(r: Recipe, b: PartyBonuses): Recipe {
  if (!b.craftDiscount || !FORGED.includes(r.id)) return r;
  return { ...r, cost: Object.fromEntries(Object.entries(r.cost).map(([k, n]) => [k, Math.max(1, (n ?? 0) - 1)])) };
}

/** Deterministic fractional yield: returns whole amount and the remaining carry. */
export function bonusYield(base: number, pct: number, carry: number): { amount: number; carry: number } {
  const total = carry + base * pct;
  const extra = Math.floor(total + 1e-9);
  return { amount: base + extra, carry: total - extra };
}

export const BRUK_EXTRA_HP = 20;
