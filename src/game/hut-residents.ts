// Engine-free hut residency: who lives in which hut, when they go in or out, and where they rest inside.
// world.ts only steers residents to the door, hides them while indoors and shows them in the room.
import type { Weather } from './weather';
import type { Furnishing } from './interiors';

export type ResidentHut = { id: string; owner: 'camp' | 'nordic' | 'dragon' | 'desert' | 'aruun'; village?: number; x: number; y: number };
export type Resident = { id: string; home: 'camp' | number };

/** Deterministic round-robin: residents sorted by ID fill their own village's huts in ID order. */
export function assignResidents(huts: readonly ResidentHut[], people: readonly Resident[]): Record<string, string> {
  const out: Record<string, string> = {};
  const groups = new Map<string, Resident[]>();
  for (const p of people) { const k = String(p.home); groups.set(k, [...(groups.get(k) ?? []), p]); }
  for (const [k, list] of groups) {
    const own = huts.filter(h => (k === 'camp' ? h.owner === 'camp' : h.owner !== 'camp' && String(h.village) === k)).map(h => h.id).sort();
    if (!own.length) continue;
    [...list].sort((a, b) => a.id.localeCompare(b.id)).forEach((p, i) => { out[p.id] = own[i % own.length]!; });
  }
  return out;
}

export const STORM: readonly Weather[] = ['rain', 'thunder', 'blizzard', 'sandstorm'];
/** Rest at night; civilians also shelter from storms; any alarm or fire sends everyone outside. */
export function wantsIndoors(o: { night: boolean; weather: Weather; alarm: boolean; warrior: boolean; burning: boolean }) {
  if (o.alarm || o.burning) return false;
  return o.night || (!o.warrior && STORM.includes(o.weather));
}

/** Distance to the door at which a walking resident steps inside. */
export const DOOR_REACH = 14;
/** Give up on pathing and slip in after this long (ms), so nobody loiters at a wall forever. */
export const DOOR_PATIENCE = 12000;

/** Resting spots inside: beds first (lying at night), then around the hearth. */
export function restSpots(items: readonly Furnishing[], n: number, night: boolean): { x: number; y: number; lying: boolean }[] {
  const beds = night ? items.filter(i => i.kind === 'bed').map(b => ({ x: b.x, y: b.y - 6, lying: true })) : [];
  const h = items.find(i => i.kind === 'hearth');
  const ring = h ? [[-26, 4], [26, 4], [0, 24], [-20, 22], [20, 22], [-34, -8], [34, -8]].map(([dx, dy]) => ({ x: h.x + dx!, y: h.y + dy!, lying: false })) : [];
  return [...beds, ...ring].slice(0, n);
}
