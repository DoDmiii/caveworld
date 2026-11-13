// Engine-free rules for Nordic ford patrols, revenge squads and retaliation raids (incl. camp arson) on the player's camp.
import { FORDS, riverX } from './biomes';
import type { DeedKind } from './events';
import { isBurning, type FireState } from './arson';

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
/** A revenge squad marches with three to five warriors (never more than the village has). */
export const MIN_SQUAD = 3;
export const MAX_RAIDERS = 5;
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
export type ActiveRaid = { village: number; phase: RaidPhase; until: number; size?: number | undefined; burned?: number | undefined };
export type WarbandState = {
  pending: Record<string, number>;
  cooldown: Record<string, number>;
  /** Revenge points per village from witnessed deeds; a squad swears revenge at REVENGE_THRESHOLD. */
  fury?: Record<string, number> | undefined;
  /** Planned squad size per pending raid. */
  squads?: Record<string, number> | undefined;
  active?: ActiveRaid | undefined;
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
  const squads = { ...(s.squads ?? {}) }, size = squads[due[0]] ?? MIN_SQUAD; delete squads[due[0]];
  return { ...s, pending, squads, active: { village: Number(due[0]), phase: 'march', until: clock + MARCH_LIMIT_MINUTES, size, burned: 0 } };
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

/** Turns an assault into the march home right away (goals reached). */
export function retreat(s: WarbandState, clock: number): WarbandState {
  return s.active?.phase === 'assault' ? { ...s, active: { ...s.active, phase: 'return', until: clock + MARCH_LIMIT_MINUTES } } : s;
}

// ---------- Revenge squads ----------
/** How much a deed seen by the victim's own village feeds its thirst for revenge. */
export const REVENGE_POINTS: Record<DeedKind, number> = { attack: 0, steal: 1, kill: 2, capture: 3, finisher: 3, arson: 3, execution: 4, champion: 5 };
export const REVENGE_THRESHOLD = 6;
/** A sworn squad gathers for one to two game days before it marches. */
export const REVENGE_DELAY_MIN = 1440;
export const REVENGE_DELAY_SPAN = 1440;
const FURY_CAP = 30;

/** Bigger grudges send bigger squads: 3 at the threshold, up to 5. */
export const squadSize = (fury: number) => Math.max(MIN_SQUAD, Math.min(MAX_RAIDERS, MIN_SQUAD + Math.floor((fury - REVENGE_THRESHOLD) / 3)));

/**
 * A deed the victim village saw adds revenge points. At the threshold the village swears revenge:
 * a squad is scheduled 1–2 days later (or an already planned one grows). Liberated villages, running
 * raids and cooldowns keep the fury for later.
 */
export function addRevenge(s: WarbandState, village: number, deed: DeedKind, clock: number, liberated: boolean, rng: () => number): { state: WarbandState; sworn: boolean } {
  const k = String(village), gain = REVENGE_POINTS[deed];
  if (liberated || gain <= 0) return { state: s, sworn: false };
  const fury = Math.min(FURY_CAP, (s.fury?.[k] ?? 0) + gain);
  const keep = { ...s, fury: { ...(s.fury ?? {}), [k]: fury } };
  if (fury < REVENGE_THRESHOLD || s.active?.village === village || clock < (s.cooldown[k] ?? 0)) return { state: keep, sworn: false };
  const size = Math.max(squadSize(fury), s.squads?.[k] ?? 0);
  const pending = k in s.pending ? s.pending : { ...s.pending, [k]: clock + REVENGE_DELAY_MIN + Math.floor(rng() * REVENGE_DELAY_SPAN) };
  return { state: { ...s, pending, squads: { ...(s.squads ?? {}), [k]: size }, fury: { ...(s.fury ?? {}), [k]: 0 } }, sworn: !(k in s.pending) };
}

// ---------- Camp arson by raiders ----------
/** A raider holds his torch to the roof this many real milliseconds; a hit or a fight interrupts him. */
export const RAID_TORCH_MS = 3500;
/** Torchbearers ignore everything but enemies this close. */
export const TORCH_ENGAGE = 44;
/** Other raiders turn on camp defenders this close. */
export const DEFENDER_ENGAGE = 80;
/** Big squads bring two torches. */
export const torchCount = (size: number) => (size >= 4 ? 2 : 1);

type Hut = { id: string; x: number; y: number };
/** The nearest intact camp hut that no other torchbearer has picked. */
export function burnTarget<T extends Hut>(huts: readonly T[], fires: FireState, clock: number, from: { x: number; y: number }, taken: ReadonlySet<string>): T | undefined {
  return huts.filter(h => !fires[h.id] && !taken.has(h.id)).sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
}
/** The assault is done once the torches have burned their share and no kin is left to free. */
export function raidGoalsDone(a: ActiveRaid, kinLeft: boolean, huts: readonly Hut[], fires: FireState, clock: number) {
  const intact = huts.some(h => !fires[h.id]);
  return !kinLeft && ((a.burned ?? 0) >= torchCount(a.size ?? MIN_SQUAD) || !intact) && !huts.some(h => isBurning(fires[h.id], clock) && false);
}

/** Spoils of a beaten squad: their flint blades, sinew and travel food. */
export function raidSpoils(defeated: number) {
  const n = Math.max(0, defeated);
  return { flint: n, fiber: 2 * n, cooked: n, xp: 30 * n };
}
/** Beating a whole squad terrifies its village. */
export const SQUAD_BROKEN_FEAR = 20;
