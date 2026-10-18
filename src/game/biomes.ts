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
  dragon: [104, 100, 118],
  wenjaWest: [86, 101, 76],
  wenjaEast: [78, 106, 72],
  dry: [168, 138, 90],
  jungle: [47, 74, 44],
};

/** Tree tint and density (0–1) per biome. */
export const BIOME_FLORA: Record<Biome, { tint: number; trees: number; rocks: number }> = {
  nordics: { tint: 0xdde8f0, trees: 0.45, rocks: 0.25 },
  dragon: { tint: 0xa69ebc, trees: 0.25, rocks: 0.45 },
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
