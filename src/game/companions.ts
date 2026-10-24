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