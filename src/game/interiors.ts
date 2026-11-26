// Engine-free hut interiors: every hut opens into its own small pocket room behind the door.
// Room shapes depend on the people who built the hut; furniture is chosen deterministically from the hut ID
// so a hut always looks the same, while neighbouring huts differ.
import type { HouseOwner } from './arson';

export type HutStyle = 'wenja' | 'nordic' | 'dragon' | 'desert';
export const styleOf = (owner: HouseOwner): HutStyle => owner === 'camp' || owner === 'aruun' ? 'wenja' : owner;

/** Pocket space the room is drawn into (outdoor objects are hidden meanwhile, like caves). */
export const POCKET = { w: 480, h: 360 } as const;
export const ROOM_CENTER = { x: 240, y: 172 } as const;
/** Half sizes of the walkable floor. Wenja: round, Nordic: rounded rectangle, Dragon people: octagon, Oshkora: round clay room. */
export const ROOMS: Record<HutStyle, { rx: number; ry: number; ambient: number }> = {
  wenja: { rx: 112, ry: 80, ambient: 14 },
  nordic: { rx: 124, ry: 74, ambient: 12 },
  dragon: { rx: 108, ry: 84, ambient: 14 },
  desert: { rx: 104, ry: 80, ambient: 16 },
};
/** Half width of the door gap in the south wall. */
export const DOOR_HALF = 13;
/** Outdoor door point offset below the hut's centre (matches the arson door point). */
export const HUT_DOOR_DY = 28;
export const HUT_ENTER_RANGE = 22;
export const HEARTH_WARM_RANGE = 100;
export const INTERACT_RANGE = 28;

/** Inside the room outline, optionally grown outwards by `grow` pixels. */
export function inRoomShape(style: HutStyle, x: number, y: number, grow = 0): boolean {
  const { rx: r0, ry: q0 } = ROOMS[style];
  const rx = r0 + grow, ry = q0 + grow, dx = Math.abs(x - ROOM_CENTER.x), dy = Math.abs(y - ROOM_CENTER.y);
  if (rx <= 0 || ry <= 0) return false;
  if (style === 'wenja' || style === 'desert') return (dx / rx) ** 2 + (dy / ry) ** 2 <= 1;
  if (style === 'nordic') {
    if (dx > rx || dy > ry) return false;
    const c = 24, ex = dx - (rx - c), ey = dy - (ry - c);
    return ex <= 0 || ey <= 0 || ex * ex + ey * ey <= c * c;
  }
  return dx <= rx && dy <= ry && dx + dy <= rx + ry - 40 + grow * 0.6;
}
/** Walkable floor: the room plus the short door passage leading south. */
export function roomFloor(style: HutStyle, x: number, y: number): boolean {
  const ry = ROOMS[style].ry;
  if (Math.abs(x - ROOM_CENTER.x) <= DOOR_HALF && y >= ROOM_CENTER.y && y <= ROOM_CENTER.y + ry + 22) return true;
  return inRoomShape(style, x, y);
}
/** A standing figure (sprite centre) fits when both feet corners touch floor. */
export function roomWalkable(style: HutStyle, x: number, y: number): boolean {
  return [[-5, 7], [5, 7], [-5, 14], [5, 14]].every(([dx = 0, dy = 0]) => roomFloor(style, x + dx, y + dy));
}
export const hutSpawn = (style: HutStyle) => ({ x: ROOM_CENTER.x, y: ROOM_CENTER.y + ROOMS[style].ry - 22 });
export const hutExit = (style: HutStyle) => ({ x: ROOM_CENTER.x, y: ROOM_CENTER.y + ROOMS[style].ry + 6 });
/** Walking down into the doorway leaves the hut. */
export const leavesHut = (style: HutStyle, x: number, y: number) => Math.abs(x - ROOM_CENTER.x) <= DOOR_HALF + 4 && y >= ROOM_CENTER.y + ROOMS[style].ry - 2;

export type HutRef = { id: string; x: number; y: number; owner: HouseOwner };
export const hutDoor = (h: { x: number; y: number }) => ({ x: h.x, y: h.y + HUT_DOOR_DY });
/** Hut whose door the player stands at (burnt huts are filtered by the caller). */
export function hutDoorAt<T extends { x: number; y: number }>(huts: readonly T[], x: number, y: number): T | undefined {
  let best: T | undefined, bd = HUT_ENTER_RANGE;
  for (const h of huts) { const d = Math.hypot(x - h.x, y - h.y - HUT_DOOR_DY); if (d < bd) { bd = d; best = h; } }
  return best;
}
/** Where the player reappears outside after leaving. */
export const outsideSpot = (h: { x: number; y: number }) => ({ x: h.x, y: h.y + HUT_DOOR_DY + 10 });

export type FurnitureKind = 'hearth' | 'bed' | 'cradle' | 'basket' | 'pot';
/** Trimmed sprite sizes in the packed furniture atlas (pixels untouched). */
export type FurnitureFrame = { id: string; kind: FurnitureKind; x: number; y: number; w: number; h: number; upright?: boolean };
export const FURNITURE_FRAMES: FurnitureFrame[] = [
  { id: 'hearth-0', kind: 'hearth', w: 29, h: 28, x: 0, y: 0 }, { id: 'hearth-1', kind: 'hearth', w: 30, h: 29, x: 30, y: 0 },
  { id: 'hearth-2', kind: 'hearth', w: 28, h: 27, x: 61, y: 0 }, { id: 'hearth-3', kind: 'hearth', w: 30, h: 22, x: 90, y: 0 },
  { id: 'hearth-4', kind: 'hearth', w: 29, h: 27, x: 121, y: 0 },
  { id: 'bed-0', kind: 'bed', w: 32, h: 26, x: 0, y: 30 }, { id: 'bed-1', kind: 'bed', w: 24, h: 30, x: 33, y: 30, upright: true },
  { id: 'bed-2', kind: 'bed', w: 24, h: 29, x: 58, y: 30, upright: true }, { id: 'bed-3', kind: 'bed', w: 32, h: 24, x: 83, y: 30 },
  { id: 'bed-4', kind: 'bed', w: 24, h: 29, x: 116, y: 30, upright: true }, { id: 'bed-5', kind: 'bed', w: 24, h: 30, x: 0, y: 61, upright: true },
  { id: 'cradle-0', kind: 'cradle', w: 19, h: 17, x: 25, y: 61 }, { id: 'cradle-1', kind: 'cradle', w: 19, h: 21, x: 45, y: 61 },
  { id: 'cradle-2', kind: 'cradle', w: 19, h: 20, x: 65, y: 61 }, { id: 'cradle-3', kind: 'cradle', w: 20, h: 20, x: 85, y: 61 },
  { id: 'cradle-4', kind: 'cradle', w: 20, h: 17, x: 106, y: 61 },
  { id: 'basket-0', kind: 'basket', w: 18, h: 19, x: 127, y: 61 }, { id: 'basket-1', kind: 'basket', w: 20, h: 20, x: 0, y: 92 },
  { id: 'basket-2', kind: 'basket', w: 21, h: 19, x: 21, y: 92 }, { id: 'basket-3', kind: 'basket', w: 20, h: 19, x: 43, y: 92 },
  { id: 'basket-4', kind: 'basket', w: 20, h: 20, x: 64, y: 92 }, { id: 'basket-5', kind: 'basket', w: 20, h: 20, x: 85, y: 92 },
  { id: 'basket-6', kind: 'basket', w: 18, h: 19, x: 106, y: 92 },
  { id: 'pot-0', kind: 'pot', w: 15, h: 12, x: 125, y: 92 }, { id: 'pot-1', kind: 'pot', w: 14, h: 13, x: 141, y: 92 },
  { id: 'pot-2', kind: 'pot', w: 14, h: 15, x: 0, y: 113 }, { id: 'pot-3', kind: 'pot', w: 14, h: 13, x: 15, y: 113 },
  { id: 'pot-4', kind: 'pot', w: 10, h: 14, x: 30, y: 113 }, { id: 'pot-5', kind: 'pot', w: 14, h: 15, x: 41, y: 113 },
  { id: 'pot-6', kind: 'pot', w: 14, h: 13, x: 56, y: 113 }, { id: 'pot-7', kind: 'pot', w: 14, h: 15, x: 71, y: 113 },
  { id: 'pot-8', kind: 'pot', w: 14, h: 14, x: 86, y: 113 },
];
const framesOf = (kind: FurnitureKind, upright?: boolean) => FURNITURE_FRAMES.filter(f => f.kind === kind && (upright === undefined || !!f.upright === upright));

/** One placed piece: (x, y) is the bottom centre of the sprite. `stash` marks the lootable supply basket. */
export type Furnishing = { id: string; kind: FurnitureKind; frame: string; x: number; y: number; w: number; h: number; flip: boolean; stash?: boolean };
type Rect = { l: number; t: number; r: number; b: number };
const rectOf = (x: number, y: number, w: number, h: number): Rect => ({ l: x - w / 2, t: y - h, r: x + w / 2, b: y });
const overlaps = (a: Rect, b: Rect, gap: number) => a.l < b.r + gap && b.l < a.r + gap && a.t < b.b + gap && b.t < a.b + gap;

function hashId(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed: number) { let a = seed || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Clear walking lane from the door to the hearth. */
export function doorLane(style: HutStyle): Rect {
  return { l: ROOM_CENTER.x - DOOR_HALF - 8, t: ROOM_CENTER.y + 18, r: ROOM_CENTER.x + DOOR_HALF + 8, b: ROOM_CENTER.y + ROOMS[style].ry + 30 };
}
/** Sprite fits: bottom corners on the floor, top may lean into the wall face. */
function fits(style: HutStyle, r: Rect) {
  const inset = 3;
  return inRoomShape(style, r.l + inset, r.b - 1) && inRoomShape(style, r.r - inset, r.b - 1)
    && inRoomShape(style, r.l + inset, r.t, 10) && inRoomShape(style, r.r - inset, r.t, 10)
    && inRoomShape(style, (r.l + r.r) / 2, r.b - 1);
}

export type FurnishOptions = { beds: number; cradle: boolean; stash: boolean; baskets: number; pots: number };
/** Furnishing defaults per hut: deterministic per ID. */
export function hutOptions(id: string, owner: HouseOwner, stash: boolean): FurnishOptions {
  const r = rng(hashId(`opt:${id}`));
  const beds = owner === 'aruun' ? 2 : owner === 'camp' ? 2 + (r() < 0.4 ? 1 : 0) : owner === 'nordic' ? 1 + Math.floor(r() * 3) : 1 + Math.floor(r() * 2);
  // Oshkora farmers store grain: more baskets and jars.
  const farm = owner === 'desert' ? 1 : 0;
  return { beds, cradle: r() < 0.4, stash, baskets: 1 + farm + Math.floor(r() * 3), pots: 2 + farm * 2 + Math.floor(r() * 4) };
}

/** Lays out hearth, beds, cradle, baskets and pots; same ID → same room. */
export function furnishHut(id: string, style: HutStyle, opts: FurnishOptions): Furnishing[] {
  const rand = rng(hashId(id));
  const pick = <T,>(a: T[]): T => a[Math.floor(rand() * a.length) % a.length]!;
  const { rx, ry } = ROOMS[style], cx = ROOM_CENTER.x, cy = ROOM_CENTER.y;
  const out: Furnishing[] = [], taken: Rect[] = [doorLane(style)];
  const place = (kind: FurnitureKind, frame: FurnitureFrame, x: number, y: number, gap: number, extra?: Partial<Furnishing>) => {
    x = Math.round(x); y = Math.round(y);
    const r = rectOf(x, y, frame.w, frame.h);
    if (!fits(style, r) || taken.some(t => overlaps(r, t, gap))) return false;
    taken.push(r);
    out.push({ id: `${id}#${out.length}`, kind, frame: frame.id, x, y, w: frame.w, h: frame.h, flip: rand() < 0.5, ...extra });
    return true;
  };
  // Ring of wall-hugging candidate centres, shuffled per hut.
  const ring = (inset: number, filter: (a: number) => boolean) => {
    const pts: { x: number; y: number; a: number }[] = [];
    for (let k = 0; k < 48; k++) { const a = (k / 48) * Math.PI * 2; if (filter(a)) pts.push({ x: cx + Math.cos(a) * (rx - inset), y: cy + Math.sin(a) * (ry - inset), a }); }
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pts[i], pts[j]] = [pts[j]!, pts[i]!]; }
    return pts;
  };
  const tryRing = (kind: FurnitureKind, frame: () => FurnitureFrame, insets: number[], filter: (a: number) => boolean, gap: number, extra?: Partial<Furnishing>) => {
    for (const inset of insets) for (const p of ring(inset, filter)) { const f = frame(); if (place(kind, f, p.x, p.y + f.h / 2, gap, extra)) return true; }
    return false;
  };
  // Hearth in the middle, slightly varied.
  const hearth = pick(framesOf('hearth'));
  place('hearth', hearth, cx + Math.round((rand() - 0.5) * 16), cy + 10 + Math.round(rand() * 6), 0);
  // Beds: lengthwise along the north wall, upright along the side walls.
  const north = (a: number) => Math.sin(a) < -0.55;
  const side = (a: number) => Math.abs(Math.cos(a)) > 0.8;
  for (let i = 0; i < opts.beds; i++) {
    const preferNorth = i === 0 ? rand() < 0.6 : rand() < 0.4;
    const order: [boolean, (a: number) => boolean][] = preferNorth ? [[false, north], [true, side]] : [[true, side], [false, north]];
    for (const [upright, f] of order) if (tryRing('bed', () => pick(framesOf('bed', upright)), [20, 28, 36], f, 6)) break;
  }
  // Cradle beside a bed.
  if (opts.cradle) {
    const beds = out.filter(o => o.kind === 'bed'); const fr = pick(framesOf('cradle'));
    let ok = false;
    for (const b of beds) { for (const [dx, dy] of [[b.w / 2 + 14, 0], [-b.w / 2 - 14, 0], [0, 22], [0, -b.h - 2]]) if (place('cradle', fr, b.x + dx!, b.y + dy!, 3)) { ok = true; break; } if (ok) break; }
    if (!ok) tryRing('cradle', () => fr, [18, 26], () => true, 4);
  }
  // Baskets; the first one holds the lootable supplies.
  const nb = Math.max(opts.baskets, opts.stash ? 1 : 0);
  for (let i = 0; i < nb; i++) tryRing('basket', () => pick(framesOf('basket')), [14, 20, 28, 36], a => Math.sin(a) < 0.6, 4, opts.stash && i === 0 ? { stash: true } : undefined);
  // Pots cluster next to baskets or along the walls.
  for (let i = 0; i < opts.pots; i++) {
    const fr = pick(framesOf('pot')), baskets = out.filter(o => o.kind === 'basket');
    const b = baskets.length && rand() < 0.5 ? pick(baskets) : undefined;
    if (b && [[b.w / 2 + 9, 0], [-b.w / 2 - 9, 0], [0, 12]].some(([dx, dy]) => place('pot', fr, b.x + dx!, b.y + dy!, 1))) continue;
    tryRing('pot', () => fr, [10, 16, 24], () => true, 2);
  }
  return out;
}
/** Collision footprint of a piece (bottom part only, so figures can stand right behind low furniture). */
export function footprint(f: Furnishing): { x: number; y: number; w: number; h: number } {
  const h = f.kind === 'pot' ? 6 : f.kind === 'hearth' ? 14 : f.kind === 'bed' ? Math.min(18, f.h - 6) : 9;
  return { x: f.x, y: f.y - h / 2 - 1, w: Math.max(6, f.w - (f.kind === 'pot' ? 4 : 6)), h };
}
export const nearestFurnishing = (items: Furnishing[], x: number, y: number, kind?: FurnitureKind, range = INTERACT_RANGE) => {
  let best: Furnishing | undefined, bd = range;
  for (const f of items) { if (kind && f.kind !== kind) continue; const d = Math.hypot(x - f.x, y + 10 - (f.y - f.h / 3)); if (d < bd) { bd = d; best = f; } }
  return best;
};
export function hutTitle(owner: HouseOwner, village: string) {
  return owner === 'camp' ? 'Deine Hütte im Höhlenlager' : owner === 'nordic' ? `Langhütte in ${village}` : owner === 'desert' ? `Lehmhütte in ${village}` : owner === 'aruun' ? `Kulthütte in ${village}` : `Schieferhütte auf der ${village}`;
}

/** Where the player lies on a bed (bed sprites stand on their bottom edge). */
export const sleepSpot = (b: Furnishing) => ({ x: b.x, y: b.y - b.h / 2 + 2 });
/** A resident lying closer than this to a bed's sleeping place has taken it. */
export const BED_TAKEN_RANGE = 12;
/** Nearest bed within reach and whether a lying resident already sleeps in it. */
export function bedFor(items: readonly Furnishing[], x: number, y: number, lying: readonly { x: number; y: number }[]): { bed: Furnishing; taken: boolean } | null {
  const bed = nearestFurnishing(items as Furnishing[], x, y, 'bed', 34); if (!bed) return null;
  return { bed, taken: lying.some(o => Math.hypot(o.x - bed.x, o.y - (bed.y - 6)) < BED_TAKEN_RANGE) };
}
