// Engine-free recruitment and formation rules, shared by HUD, saves and movement.
import type { Pt } from './combat';

export const MAX_COMPANIONS = 3;
export type CompanionMode = 'follow' | 'wait' | 'return';
export type CompanionOrder = Pt & { id: string; mode: CompanionMode };
export function canRecruit(ownTribe: boolean, following: number, alreadyFollowing: boolean) {
  return ownTribe && !alreadyFollowing && following < MAX_COMPANIONS;
}
export function formationSlot(index: number, player: Pt, facing: number): Pt {
  const angle = facing * Math.PI / 4;
  const back = index === 2 ? 62 : 32;
  const side = index === 2 ? 0 : index === 0 ? -30 : 30;
  return { x: player.x - Math.cos(angle) * back - Math.sin(angle) * side,
    y: player.y - Math.sin(angle) * back + Math.cos(angle) * side };
}
export function companionSpeed(sprinting: boolean, crouching: boolean, distance: number) {
  return crouching ? 34 : sprinting ? 112 : distance > 100 ? 92 : 70;
}
/** Joint-combat rules: companions engage a foe the player is fighting, within leash range of the player. */
export const ALLY_ENGAGE_RANGE = 220;
export const ALLY_REACH = 22;
export const ALLY_STRIKE_MS = 1100;
export const ALLY_DAMAGE = 12;
export type Foe = Pt & { id: string; hostile: boolean; alive: boolean };
export function pickAllyTarget(foes: Foe[], player: Pt, focusId?: string): Foe | undefined {
  const live = foes.filter(f => f.alive && Math.hypot(f.x - player.x, f.y - player.y) <= ALLY_ENGAGE_RANGE);
  const focus = live.find(f => f.id === focusId);
  if (focus) return focus;
  return live.filter(f => f.hostile).sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
}
export function companionWeapon(id: string): 'spear' | 'axe' {
  let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % 2 ? 'spear' : 'axe';
}
/** Companion health: allies are knocked out, never killed, and recover on their own or faster by the fire. */
export const ALLY_HP = 50;
export const ALLY_DOWN_MS = 9000;
export const ALLY_RECOVER_HP = 20;
export const ALLY_REGEN_PER_S = 1;
export const ALLY_FIRE_REGEN_PER_S = 5;
export type AllyHealth = { hp: number; downUntil: number };
export const newAllyHealth = (): AllyHealth => ({ hp: ALLY_HP, downUntil: 0 });
export const allyDowned = (h: AllyHealth) => h.downUntil > 0;
export function hitAlly(h: AllyHealth, damage: number, now: number): AllyHealth {
  if (allyDowned(h) || damage <= 0) return h;
  const hp = Math.max(0, h.hp - damage);
  return hp === 0 ? { hp: 0, downUntil: now + ALLY_DOWN_MS } : { hp, downUntil: 0 };
}
export function tickAllyHealth(h: AllyHealth, now: number, dtMs: number, nearFire: boolean): AllyHealth {
  if (allyDowned(h)) return now >= h.downUntil ? { hp: ALLY_RECOVER_HP, downUntil: 0 } : h;
  if (h.hp >= ALLY_HP) return h;
  const rate = nearFire ? ALLY_FIRE_REGEN_PER_S : ALLY_REGEN_PER_S;
  return { hp: Math.min(ALLY_HP, h.hp + rate * dtMs / 1000), downUntil: 0 };
}
/** Attackers strike whichever standing target is closest; an ally only draws the hit when nearer than the player. */
export function pickVictim(attacker: Pt, player: Pt, allies: (Pt & { id: string })[], reach: number): string | 'player' | undefined {
  const dp = Math.hypot(player.x - attacker.x, player.y - attacker.y);
  let best: string | 'player' | undefined = dp <= reach ? 'player' : undefined, bd = dp <= reach ? dp : Infinity;
  for (const a of allies) { const d = Math.hypot(a.x - attacker.x, a.y - attacker.y); if (d <= reach && d < bd) { bd = d; best = a.id; } }
  return best;
}
