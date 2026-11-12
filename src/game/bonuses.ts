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

// ---------- Schwächen (quirks) ----------
const BIG_GAME = ['mammoth', 'bear', 'wolf'];
/** Torvik never fights; Tamo hesitates at big game/packs and backs off below 50 % health. */
export function refusesFight(profileId: string, targetKind: string | undefined, hpRatio: number): boolean {
  if (profileId === 'torvik') return true;
  if (profileId === 'tamo') return hpRatio < 0.5 || (!!targetKind && BIG_GAME.includes(targetKind));
  return false;
}
/** Orka eats 25 % more, Bruk 20 % more – the hunting party lives off your supplies. */
export function partyHungerFactor(following: readonly string[]): number {
  return (following.includes('orka') ? 1.25 : 1) * (following.includes('bruk') ? 1.2 : 1);
}
/** Skorra only follows orders from 60 trust. */
export function followRefusal(profileId: string, trust: number): string | null {
  return profileId === 'skorra' && trust < 60 ? 'Skorra folgt keinem Befehl, den sie nicht versteht · Vertrauen ab 60 nötig' : null;
}
/** Nuka snacks one berry per new day from your supply. */
export function nukaSnack(berries: number, nukaInTribe: boolean): number {
  return nukaInTribe && berries > 0 ? berries - 1 : berries;
}
export const YMRA_TRADE_BONUS = 0.25;

// ---------- Eigenständige Schwächen ----------
/** Every Wenja keeps pace with the party (warrior culture). */
export const companionPace = (_profileId: string) => 1;
/** No Wenja turns back from a raid. */
export const leashExceeded = (_profileId: string, _distFromCamp: number) => false;
/** Ura freezes in the snow: HP lost per second unless you wear fur clothing. */
export const URA_COLD_HP_PER_S = 1;
export const uraColdDamage = (profileId: string, biome: string, hasFur: boolean) => profileId === 'ura' && biome === 'nordics' && !hasFur ? URA_COLD_HP_PER_S : 0;
/** Ilvar tries to flee at night while his trust is below 40, at most once per night. */
export const ILVAR_FLEE_TRUST = 40;
export const ILVAR_ESCAPE_DIST = 500;
export const triesToFlee = (profileId: string, trust: number, night: boolean, alreadyTriedToday: boolean) =>
  profileId === 'ilvar' && night && trust < ILVAR_FLEE_TRUST && !alreadyTriedToday;
