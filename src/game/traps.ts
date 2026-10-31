// Engine-free rules for hunting traps: costs, placement, trigger logic and durability.
// world.ts only places sprites, detects nearby targets and applies the outcomes.
import type { Resource, Stock } from './harvest';

export type TrapKind = 'snare' | 'pit' | 'rattle';
export const TRAP_KINDS = ['snare', 'pit', 'rattle'] as const satisfies readonly TrapKind[];

export type TrapDef = { name: string; cost: Partial<Record<Resource, number>>; radius: number; uses: number; effect: string };
export const TRAPS: Record<TrapKind, TrapDef> = {
  snare: { name: 'Schlinge', cost: { wood: 2, fiber: 2 }, radius: 26, uses: 3, effect: 'Fängt Beutetiere · 1 Fleisch pro Fang' },
  pit: { name: 'Fallgrube', cost: { wood: 4, stone: 2 }, radius: 20, uses: 2, effect: 'Verletzt Raubtiere schwer (35 Schaden)' },
  rattle: { name: 'Knochenrassel', cost: { wood: 2, fiber: 2 }, radius: 90, uses: 5, effect: 'Warnt dich vor herannahenden Kriegern' },
};

export const MAX_TRAPS = 20;
/** Minimum distance between two traps. */
export const TRAP_GAP = 24;
export const PIT_DAMAGE = 35;

export type Trap = { id: string; kind: TrapKind; x: number; y: number; uses: number; meat: number };
/** Who a trap reacts to: gazelle = prey, tiger/wolf/bear = predator, hostile warriors = raider. */
export type TrapTarget = 'prey' | 'predator' | 'raider';
export type TrapEvent = { kind: 'catch' | 'wound' | 'alarm'; trap: Trap };

export function canAffordTrap(kind: TrapKind, stock: Stock): boolean {
  return (Object.entries(TRAPS[kind].cost) as [Resource, number][]).every(([k, n]) => stock[k] >= n);
}

/** Returns why a trap cannot stand here, or null when the spot is fine. */
export function trapPlacementError(x: number, y: number, traps: readonly Trap[], blockers: readonly { x: number; y: number; r: number }[] = []): string | null {
  if (traps.length >= MAX_TRAPS) return 'Zu viele Fallen';
  for (const t of traps) if (Math.hypot(t.x - x, t.y - y) < TRAP_GAP) return 'Zu nah an einer Falle';
  for (const b of blockers) if (Math.hypot(b.x - x, b.y - y) < 10 + b.r) return 'Platz ist belegt';
  return null;
}

/**
 * Triggers a trap on a target walking into its radius.
 * Returns the updated trap (null when its last use is spent) plus the event, or null when the trap ignores this target.
 */
export function triggerTrap(trap: Trap, target: TrapTarget): { trap: Trap | null; event: TrapEvent } | null {
  if (trap.uses <= 0) return null;
  if (trap.kind === 'snare' && target === 'prey') {
    const next = { ...trap, uses: trap.uses - 1, meat: trap.meat + 1 };
    return { trap: next.uses > 0 ? next : null, event: { kind: 'catch', trap: next } };
  }
  if (trap.kind === 'pit' && target === 'predator') {
    const next = { ...trap, uses: trap.uses - 1 };
    return { trap: next.uses > 0 ? next : null, event: { kind: 'wound', trap: next } };
  }
  if (trap.kind === 'rattle' && target === 'raider') {
    const next = { ...trap, uses: trap.uses - 1 };
    return { trap: next.uses > 0 ? next : null, event: { kind: 'alarm', trap: next } };
  }
  return null;
}

/** Takes every caught piece of meat out of a snare. */
export function collectTrap(trap: Trap): { trap: Trap; meat: number } {
  return { trap: { ...trap, meat: 0 }, meat: trap.meat };
}
