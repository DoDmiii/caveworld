// Engine-free rules for Nordic ford patrols and retaliation raids on the player's camp.
import { FORDS, riverX } from './biomes';

type Pt = { x: number; y: number };
type Village = { x: number; y: number; r: number };

/** Game minutes between a village turning hostile and its war party setting off. */
export const RAID_DELAY_MINUTES = 720;
/** How long raiders stay at the camp before turning home. */
export const ASSAULT_MINUTES = 240;
/** A march or retreat that takes longer than this is abandoned. */
export const MARCH_LIMIT_MINUTES = 900;
/** Minimum pause before the same village raids again. */
export const RAID_COOLDOWN_MINUTES = 2880;
export const MAX_RAIDERS = 4;
/** Distance to the camp at which marching raiders start the assault. */
export const CAMP_ARRIVAL = 150;
/** Raiders attack the player once he comes this close during an assault. */
export const RAID_SIGHT = 220;

/** The ford guarded by a village: the closest wading point, on the west bank. */
export function fordPost(v: Village): Pt {
  const y = [...FORDS].sort((a, b) => Math.abs(a - v.y) - Math.abs(b - v.y))[0]!;
  return { x: Math.round(riverX(y) - 45), y };
}
/** Ford guards walk from the village edge to the ford and back. */
export function fordRoute(v: Village): Pt[] {
  const post = fordPost(v), dx = post.x - v.x, dy = post.y - v.y, d = Math.hypot(dx, dy) || 1;
  const edge = { x: Math.round(v.x + dx / d * (v.r + 60)), y: Math.round(v.y + dy / d * (v.r + 60)) };
  const mid = { x: Math.round((edge.x + post.x) / 2), y: Math.round((edge.y + post.y) / 2) };
  return [edge, mid, post, { x: post.x, y: post.y + 40 }, post, mid];
}

export type RaidPhase = 'march' | 'assault' | 'return';
export type WarbandState = {
  pending: Record<string, number>;
  cooldown: Record<string, number>;
  active?: { village: number; phase: RaidPhase; until: number } | undefined;
};
export const EMPTY_WARBANDS: WarbandState = { pending: {}, cooldown: {} };

/** A hostile village schedules one retaliation raid unless one is pending, running or on cooldown. Liberated villages never raid. */
export function scheduleRaid(s: WarbandState, village: number, hostile: boolean, clock: number, liberated: boolean): WarbandState {
  const k = String(village);
  if (!hostile || liberated || k in s.pending || s.active?.village === village || clock < (s.cooldown[k] ?? 0)) return s;
  return { ...s, pending: { ...s.pending, [k]: clock + RAID_DELAY_MINUTES } };
}
/** Starts the earliest due raid when none is running. */
export function launchDue(s: WarbandState, clock: number): WarbandState {
  if (s.active) return s;
  const due = Object.entries(s.pending).filter(([, at]) => clock >= at).sort((a, b) => a[1] - b[1])[0];
  if (!due) return s;
  const pending = { ...s.pending }; delete pending[due[0]];
  return { ...s, pending, active: { village: Number(due[0]), phase: 'march', until: clock + MARCH_LIMIT_MINUTES } };
}
export function arrive(s: WarbandState, clock: number): WarbandState {
  return s.active?.phase === 'march' ? { ...s, active: { ...s.active, phase: 'assault', until: clock + ASSAULT_MINUTES } } : s;
}
export function endRaid(s: WarbandState, clock: number): WarbandState {
  if (!s.active) return s;
  return { ...s, active: undefined, cooldown: { ...s.cooldown, [String(s.active.village)]: clock + RAID_COOLDOWN_MINUTES } };
}
/** Advances time limits: an expired assault turns into a retreat, expired marches end; no raiders left ends the raid. */
export function advanceRaid(s: WarbandState, clock: number, raidersLeft: number): WarbandState {
  const a = s.active; if (!a) return s;
  if (raidersLeft === 0) return endRaid(s, clock);
  if (clock < a.until) return s;
  if (a.phase === 'assault') return { ...s, active: { ...a, phase: 'return', until: clock + MARCH_LIMIT_MINUTES } };
  return endRaid(s, clock);
}
