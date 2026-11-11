// Engine-free player appearance: worn armor skins, their stats and the bloodied state.
export type ArmorId = 'wolfArmor' | 'sabreArmor';
export type Pelt = 'wolfPelt' | 'sabrePelt';

export type ArmorDef = {
  id: ArmorId;
  name: string;
  pelt: Pelt;
  pelts: number;
  /** Multiplier on walk/run speed. */
  speed: number;
  /** Multiplier on melee damage. */
  damage: number;
  /** Multiplier on cold loss (lower = warmer). */
  cold: number;
  /** Has its own faster run animation. */
  runAnim: boolean;
  /** Placeholder tint until the final skin atlas is delivered. */
  tint: number;
  effect: string;
};

export const ARMORS: Record<ArmorId, ArmorDef> = {
  wolfArmor: { id: 'wolfArmor', name: 'Wolfspelz', pelt: 'wolfPelt', pelts: 3, speed: 1.15, damage: 1, cold: 0.3, runAnim: true, tint: 0xc9d3e6, effect: 'Schneller · starker Kälteschutz' },
  sabreArmor: { id: 'sabreArmor', name: 'Säbelzahnpelz', pelt: 'sabrePelt', pelts: 3, speed: 1, damage: 1.2, cold: 0.45, runAnim: false, tint: 0xf0c27a, effect: 'Mehr Schaden · guter Kälteschutz' },
};
export const ARMOR_IDS = Object.keys(ARMORS) as ArmorId[];
export const PELT_NAME: Record<Pelt, string> = { wolfPelt: 'Wolfsfell', sabrePelt: 'Säbelzahnfell' };

/** Which pelt an animal drops when killed (one per kill). */
export const peltFor = (kind: string): Pelt | null => (kind === 'wolf' ? 'wolfPelt' : kind === 'tiger' ? 'sabrePelt' : null);

const def = (a: ArmorId | null | undefined) => (a ? ARMORS[a] : undefined);
export const armorSpeed = (a: ArmorId | null | undefined) => def(a)?.speed ?? 1;
export const armorDamage = (a: ArmorId | null | undefined) => def(a)?.damage ?? 1;
export const armorCold = (a: ArmorId | null | undefined) => def(a)?.cold ?? 1;

/** Blood skin shows once health is at half or below. */
export const BLOODY_AT = 50;
export const isBloodied = (health: number, max = 100) => health <= max * (BLOODY_AT / 100);

export const BLOOD_TINT = 0xd98080;
export type SkinId = 'wolf' | 'sabre' | 'blood';
/** Worn armor shows its own skin; without armor the blood skin appears at ≤50 % health. */
export function skinFor(armor: ArmorId | null | undefined, health: number): SkinId | null {
  if (armor === 'wolfArmor') return 'wolf';
  if (armor === 'sabreArmor') return 'sabre';
  return isBloodied(health) ? 'blood' : null;
}
/** No extra tint: only the default skin shows blood (via its own blood sprites); armor skins stay unchanged. */
export function playerTint(armor: ArmorId | null | undefined, health: number): number | null {
  void armor; void health; return null;
}
