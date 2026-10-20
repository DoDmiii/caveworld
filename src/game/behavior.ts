/** Engine-free tribal behaviour rules. Safe to unit-test without Phaser. */
export type ReactionState = 'routine' | 'noticed' | 'suspicious' | 'friendly' | 'hostile' | 'fleeing';
export type VillageId = 'frostheim' | 'gipfelwacht' | 'eisfurt';
export type FolkRole = 'villager' | 'guard' | 'hunter' | 'leader' | 'child';

export interface BehaviorContext {
  relationship: number; // -100..100, village or personal depending on caller
  armed: boolean;
  crouching: boolean;
  carryingCaptive: boolean;
  night: boolean;
  witnessedCrime: boolean;
  insideVillage: boolean;
  alarmActive: boolean;
  role: FolkRole;
}

export interface BehaviorDecision {
  state: ReactionState;
  icon: 'none' | '!' | '?' | '♥' | '⚔' | '↗';
  shouldWarn: boolean;
  shouldRaiseAlarm: boolean;
  shouldAttack: boolean;
  shouldFlee: boolean;
}

export function clampRelationship(value: number): number {
  return Math.max(-100, Math.min(100, Math.round(value)));
}

/** Returns a deterministic reaction; movement/combat are handled by the game engine. */
export function decideReaction(context: BehaviorContext): BehaviorDecision {
  // Children are never attack targets. They flee or hide when threatened.
  if (context.role === 'child' && (context.armed || context.carryingCaptive || context.witnessedCrime || context.alarmActive)) {
    return { state: 'fleeing', icon: '↗', shouldWarn: false, shouldRaiseAlarm: false, shouldAttack: false, shouldFlee: true };
  }

  const threat = (context.armed ? 22 : 0)
    + (context.crouching ? 8 : 0)
    + (context.carryingCaptive ? 45 : 0)
    + (context.night ? 12 : 0)
    + (context.witnessedCrime ? 70 : 0)
    + (context.alarmActive ? 35 : 0)
    + (context.insideVillage ? 10 : 0)
    - context.relationship * 0.35;

  if (context.relationship >= 55 && !context.witnessedCrime && !context.carryingCaptive) {
    return { state: 'friendly', icon: '♥', shouldWarn: false, shouldRaiseAlarm: false, shouldAttack: false, shouldFlee: false };
  }
  if (context.witnessedCrime || context.alarmActive || threat >= 85) {
    const canFight = context.role !== 'child';
    return { state: canFight ? 'hostile' : 'fleeing', icon: canFight ? '⚔' : '↗', shouldWarn: false, shouldRaiseAlarm: !context.alarmActive, shouldAttack: canFight, shouldFlee: !canFight };
  }
  if (threat >= 42) {
    return { state: 'suspicious', icon: '?', shouldWarn: true, shouldRaiseAlarm: false, shouldAttack: false, shouldFlee: false };
  }
  if (context.insideVillage || context.armed || context.carryingCaptive || context.night) {
    return { state: 'noticed', icon: '!', shouldWarn: false, shouldRaiseAlarm: false, shouldAttack: false, shouldFlee: false };
  }
  return { state: 'routine', icon: 'none', shouldWarn: false, shouldRaiseAlarm: false, shouldAttack: false, shouldFlee: false };
}

export function relationshipAfterAction(current: number, action: 'greet' | 'gift' | 'intimidate' | 'attack' | 'steal' | 'rescue' | 'trade'): number {
  const delta: Record<typeof action, number> = { greet: 3, gift: 15, intimidate: -18, attack: -35, steal: -25, rescue: 20, trade: 5 };
  return clampRelationship(current + delta[action]);
}

export function relationshipTier(value: number): 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'trusted' {
  if (value <= -60) return 'hostile';
  if (value <= -25) return 'unfriendly';
  if (value < 25) return 'neutral';
  if (value < 60) return 'friendly';
  return 'trusted';
}
