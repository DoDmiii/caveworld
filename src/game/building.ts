// Engine-free rules for player-built structures: costs, build zones, placement checks and the drying rack.
import type { Stock, Resource } from './harvest';
import { CAMP_POS } from './biomes';

export type StructureKind = 'rack' | 'shelter' | 'barricade' | 'drum';
export const STRUCTURE_KINDS = ['rack', 'shelter', 'barricade', 'drum'] as const satisfies readonly StructureKind[];

export type StructureDef = { name: string; cost: Partial<Record<Resource, number>>; zone: 'camp' | 'anywhere'; radius: number; rotates: boolean; effect: string };
export const STRUCTURES: Record<StructureKind, StructureDef> = {
  drum: { name: 'Alarm-Trommel', cost: { wood: 4, fiber: 3 }, zone: 'camp', radius: 14, rotates: false, effect: 'Warnt das Lager vor Feinden; Krieger verteidigen, andere suchen Schutz' },
  rack: { name: 'Räuchergestell', cost: { wood: 4, fiber: 2 }, zone: 'camp', radius: 14, rotates: false, effect: 'Trocknet rohes Fleisch zu Dörrfleisch' },
  shelter: { name: 'Leder-Unterstand', cost: { wood: 3, fiber: 4 }, zone: 'anywhere', radius: 20, rotates: true, effect: 'Halbe Kälte darunter' },
  barricade: { name: 'Barrikade', cost: { wood: 5 }, zone: 'anywhere', radius: 14, rotates: true, effect: 'Versperrt Tieren und Feinden den Weg' },
};

/** Camp-only structures must stand within this distance of the campfire. */
export const CAMP_BUILD_RADIUS = 200;
export const MAX_STRUCTURES = 60;
export const RACK_SLOTS = 3;
/** Game minutes until one strip of meat is dry: half an in-game day. */
export const DRY_MINUTES = 720;
export const SHELTER_RANGE = 34;

export type Placed = { id: string; kind: StructureKind; x: number; y: number; dir: number; meat: number[] };
export type Blocker = { x: number; y: number; r: number };

export function canAfford(cost: StructureDef['cost'], stock: Stock): boolean {
  return (Object.entries(cost) as [Resource, number][]).every(([k, n]) => stock[k] >= n);
}
export function pay(cost: StructureDef['cost'], stock: Stock): Stock {
  const next = { ...stock };
  for (const [k, n] of Object.entries(cost) as [Resource, number][]) next[k] -= n;
  return next;
}
export function refund(cost: StructureDef['cost'], stock: Stock): Stock {
  const next = { ...stock };
  for (const [k, n] of Object.entries(cost) as [Resource, number][]) next[k] += n;
  return next;
}

/** Returns why a structure cannot stand here, or null when the spot is fine. */
export function placementError(kind: StructureKind, x: number, y: number, placed: readonly Placed[], blockers: readonly Blocker[] = []): string | null {
  const def = STRUCTURES[kind];
  if (def.zone === 'camp' && Math.hypot(x - CAMP_POS.x, y - CAMP_POS.y) > CAMP_BUILD_RADIUS) return 'Nur im Höhlenlager';
  if (placed.length >= MAX_STRUCTURES) return 'Zu viele Bauten';
  for (const s of placed) if (Math.hypot(s.x - x, s.y - y) < def.radius + STRUCTURES[s.kind].radius) return 'Zu nah an einem Bau';
  for (const b of blockers) if (Math.hypot(b.x - x, b.y - y) < def.radius + b.r) return 'Platz ist belegt';
  return null;
}

/** Hangs one raw meat on a rack; undefined when full. */
export function hangMeat(rack: Placed, clock: number): Placed | undefined {
  if (rack.kind !== 'rack' || rack.meat.length >= RACK_SLOTS) return undefined;
  return { ...rack, meat: [...rack.meat, clock] };
}
/** Drying progress of one strip, 0..1. */
export const dryProgress = (hungAt: number, clock: number) => Math.min(1, Math.max(0, (clock - hungAt) / DRY_MINUTES));
export const dryCount = (rack: Placed, clock: number) => rack.meat.filter(t => clock - t >= DRY_MINUTES).length;
/** Takes every finished strip off the rack. */
export function collectJerky(rack: Placed, clock: number): { rack: Placed; jerky: number } {
  const left = rack.meat.filter(t => clock - t < DRY_MINUTES);
  return { rack: { ...rack, meat: left }, jerky: rack.meat.length - left.length };
}
