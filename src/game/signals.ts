// Engine-free signals; temporary movement never overwrites companion orders.
import type { Pt } from './combat';
import type { CompanionOrder, Foe } from './companions';
import { CAMP_POS } from './biomes';

export const HORN_RANGE = 600;
export const HORN_COOLDOWN_MINUTES = 60;
export const HORN_RECALL_MINUTES = 20;
export const ALARM_RANGE = 280;
export const CAMP_RESPONSE_RANGE = 360;
export const DRUM_REACH = 38;
export function hornReady(owned: readonly string[], clock: number, readyAt: number) {
  return owned.includes('horn') && clock >= readyAt;
}
export function recallOrders(actors: readonly (Pt & { id: string; down: boolean })[], orders: ReadonlyMap<string, CompanionOrder>, player: Pt) {
  return new Map(actors.filter(a => !a.down && orders.get(a.id)?.mode === 'follow' && Math.hypot(a.x-player.x,a.y-player.y) <= HORN_RANGE)
    .map(a => [a.id, { id: a.id, mode: 'follow' as const, x: player.x, y: player.y }]));
}
/** Wenja men are warriors; camp women stay out of battle. */
export function campWarrior(profile: string) { return ['tamo', 'bruk', 'kuruk', 'ilvar'].includes(profile); }
export function alarmThreats(foes: readonly Foe[], drums: readonly Pt[]) {
  return foes.filter(f => f.alive && f.hostile && drums.some(d => Math.hypot(f.x-d.x,f.y-d.y) <= ALARM_RANGE));
}
export function campResponse(actors: readonly (Pt & { id: string; profile: string; down: boolean })[], foes: readonly Foe[], active: boolean) {
  const orders = new Map<string, CompanionOrder>(), targets = new Map<string, Foe>();
  if (!active) return { orders, targets };
  for (const a of actors) {
    if (a.down || Math.hypot(a.x-CAMP_POS.x,a.y-CAMP_POS.y)>CAMP_RESPONSE_RANGE) continue;
    const target = campWarrior(a.profile) ? foes.filter(f => f.alive && f.hostile && Math.hypot(f.x-CAMP_POS.x,f.y-CAMP_POS.y)<=CAMP_RESPONSE_RANGE)
      .sort((b,c) => Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(a.x-c.x,a.y-c.y))[0] : undefined;
    const goal = target ?? (campWarrior(a.profile) ? { x: CAMP_POS.x + (a.id.length%2 ? -50 : 50), y: CAMP_POS.y+50 } : { x: CAMP_POS.x-40+(a.id.charCodeAt(a.id.length-1)%5)*20, y: CAMP_POS.y-35 });
    orders.set(a.id, { id: a.id, mode: 'wait', x: goal.x, y: goal.y });
    if (target) targets.set(a.id, target);
  }
  return { orders, targets };
}