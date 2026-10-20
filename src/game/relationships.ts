/** Serializable relationship state; independent from Phaser and React. */
import { clampRelationship } from './behavior';

export interface RelationshipState {
  village: Record<string, number>;
  personal: Record<string, number>;
  alarmUntil: Record<string, number>;
}
export const EMPTY_RELATIONSHIPS: RelationshipState = { village: {}, personal: {}, alarmUntil: {} };

export function getVillageRelationship(state: RelationshipState, villageId: string): number {
  return clampRelationship(state.village[villageId] ?? 0);
}
export function getPersonalRelationship(state: RelationshipState, personId: string, villageId?: string): number {
  return clampRelationship(state.personal[personId] ?? (villageId ? getVillageRelationship(state, villageId) : 0));
}
export function changeVillageRelationship(state: RelationshipState, villageId: string, delta: number): RelationshipState {
  return { ...state, village: { ...state.village, [villageId]: clampRelationship(getVillageRelationship(state, villageId) + delta) } };
}
export function changePersonalRelationship(state: RelationshipState, personId: string, delta: number, villageId?: string): RelationshipState {
  const current = getPersonalRelationship(state, personId, villageId);
  return { ...state, personal: { ...state.personal, [personId]: clampRelationship(current + delta) } };
}
export function raiseAlarm(state: RelationshipState, villageId: string, now: number, durationMs = 20_000): RelationshipState {
  return { ...state, alarmUntil: { ...state.alarmUntil, [villageId]: now + durationMs } };
}
export function isAlarmActive(state: RelationshipState, villageId: string, now: number): boolean {
  return (state.alarmUntil[villageId] ?? 0) > now;
}
