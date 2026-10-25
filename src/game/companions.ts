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
