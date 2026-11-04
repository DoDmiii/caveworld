// Engine-free world geography: map bounds, river course and biome zones.
// The original 2048² start region keeps its coordinates; the world grows around it.
export const MAP = { x: -1024, y: -1536, w: 4096, h: 5120 } as const;
export const START_REGION = 2048;
export const CAMP_POS = { x: 1000, y: 640 } as const;

export type Biome = 'nordics' | 'dragon' | 'wenjaWest' | 'wenjaEast' | 'dry' | 'jungle';

export const BIOME_NAME: Record<Biome, string> = {
  nordics: 'Schneegebirge der Nordics',
  dragon: 'Gebirge der Drachenmenschen',
  wenjaWest: 'Westliches Grünes Tal der Wenja',
  wenjaEast: 'Grünes Tal der unbekannten Wenja',
  dry: 'Trockengebiet',
  jungle: 'Dschungel der Afrikans',
};

/** Base ground colour per biome (RGB). */
export const BIOME_COLOR: Record<Biome, [number, number, number]> = {
  nordics: [200, 210, 214],
  dragon: [92, 98, 88],
  wenjaWest: [86, 101, 76],
  wenjaEast: [78, 106, 72],
  dry: [168, 138, 90],
  jungle: [47, 74, 44],
};

/** Tree tint and density (0–1) per biome. */
export const BIOME_FLORA: Record<Biome, { tint: number; trees: number; rocks: number }> = {
  nordics: { tint: 0xdde8f0, trees: 0.45, rocks: 0.25 },
  dragon: { tint: 0xb4c8a8, trees: 0.4, rocks: 0.45 },
  wenjaWest: { tint: 0xffffff, trees: 0.6, rocks: 0.12 },
  wenjaEast: { tint: 0xe8ffe0, trees: 0.7, rocks: 0.12 },
  dry: { tint: 0xe0c080, trees: 0.12, rocks: 0.35 },
  jungle: { tint: 0x86b870, trees: 1, rocks: 0.06 },
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** River centre x for a given y; matches the original bezier inside the start region. */
export function riverX(y: number) {
  if (y < 0) return 1570 + 170 * Math.sin(-y / 520);
  if (y > START_REGION) return 1580 + 190 * Math.sin((y - START_REGION) / 470);
  const t = clamp(y / START_REGION, 0, 1);
  return (1 - t) ** 3 * 1570 + 3 * (1 - t) ** 2 * t * 1290 + 3 * (1 - t) * t * t * 1750 + t ** 3 * 1580;
}

/** Shallow fords where the river can be waded. */
export const FORDS = [-760, 1080, 2780] as const;
export const isFord = (y: number) => FORDS.some(f => Math.abs(y - f) < 30);

export const snowLine = (x: number) => 260 + 70 * Math.sin(x / 310) + 30 * Math.sin(x / 97);
export const southLine = (x: number) => 2280 + 90 * Math.sin(x / 260 + 1) + 35 * Math.sin(x / 83);

export function biomeAt(x: number, y: number): Biome {
  const east = x > riverX(y);
  if (y < snowLine(x)) return east ? 'dragon' : 'nordics';
  if (y > southLine(x)) return east ? 'jungle' : 'dry';
  return east ? 'wenjaEast' : 'wenjaWest';
}

/** Nordic villages: centre and protected radius wildlife keeps away from. */
export const VILLAGES = [
  { name: 'Frostheim', x: 250, y: -350, r: 220 },
  { name: 'Gipfelwacht', x: -560, y: -1050, r: 185 },
  { name: 'Eisfurt', x: 1150, y: -880, r: 185 },
] as const;
/** Dragon-people terrace village in the north-eastern mountains. */
export const DRAGON_VILLAGE = { name: 'Drachenterrasse', x: 2330, y: -720, r: 200 } as const;
export const dragonVillageAt = (x: number, y: number, margin = 0) =>
  Math.hypot(x - DRAGON_VILLAGE.x, y - DRAGON_VILLAGE.y) < DRAGON_VILLAGE.r + margin;

/** Shallow mountain streams (polylines) flowing west into the main river; wadeable, never blocking. */
export const STREAMS: readonly (readonly [number, number][])[] = [
  [[3060, -1300], [2800, -1180], [2560, -1000], [2400, -930], [2150, -860], [1930, -760], [riverX(-700), -700]],
  [[3060, -380], [2850, -440], [2620, -500], [2470, -560], [2250, -470], [2000, -350], [riverX(-300), -300]],
  [[2700, -1530], [2620, -1400], [2560, -1000]],
];
const segDist = (px: number, py: number, [ax, ay]: readonly [number, number], [bx, by]: readonly [number, number]) => {
  const dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
/** Distance to the nearest mountain stream centre line. */
export function streamDist(x: number, y: number) {
  let d = Infinity;
  for (const s of STREAMS) for (let i = 1; i < s.length; i++) d = Math.min(d, segDist(x, y, s[i - 1]!, s[i]!));
  return d;
}
export const STREAM_HALF = 14;

/** Village whose protected zone (plus margin) contains the point, if any. */
export const villageAt = (x: number, y: number, margin = 0) =>
  VILLAGES.find(v => Math.hypot(x - v.x, y - v.y) < v.r + margin);
