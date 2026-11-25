// Wildlife sprite URL maps. Tiger 64x64 (all anims share one cell), gazelle 40x40; snow animals use their own cell size. 8 directions.
type Map = Record<string, { url: string }>;
const all = import.meta.glob('../assets/npc/*.png.asset.json', { eager: true, import: 'default' }) as Map;

const pick = (prefix: string) => {
  const arr: string[] = [];
  for (let i = 0; i < 8; i++) {
    const key = Object.keys(all).find(k => k.endsWith(`/${prefix}-${i}.png.asset.json`));
    if (!key) throw new Error(`missing ${prefix}-${i}`);
    arr.push(all[key]!.url);
  }
  return arr;
};

export const TIGER = { idle: pick('tiger-idle'), walk: pick('tiger-walk'), attack: pick('tiger-attack') };
export const GAZELLE = { idle: pick('gazelle-idle'), walk: pick('gazelle-walk'), run: pick('gazelle-run') };

/** Wolves feeding on the ground: 9 frames per direction in 52 px cells. */
export const WOLF_EAT = pick('wolf-eat');

export type SnowKind = 'wolf' | 'bear' | 'mammoth' | 'dhole' | 'buffalo';
export type SnowSpecies = {
  name: string; cell: number; body: [number, number, number, number];
  hp: number; damage: number; speed: number; sight: number; aggressive: boolean; count: number;
  idle: string[]; walk: string[]; attack?: string[];
  /** Where the species roams; packs spawn in threes. */ home: 'nordics' | 'dragon'; pack?: boolean;
};
// Wolves hunt in small packs, bears are slow tanks, mammoths only fight back.
export const SNOW: Record<SnowKind, SnowSpecies> = {
  wolf: { name: 'Schneewolf', cell: 52, body: [14, 8, 19, 32], hp: 40, damage: 8, speed: 82, sight: 160, aggressive: true, count: 6, home: 'nordics', pack: true, idle: pick('wolf-idle'), walk: pick('wolf-walk'), attack: pick('wolf-attack') },
  bear: { name: 'Höhlenbär', cell: 80, body: [20, 10, 30, 48], hp: 110, damage: 16, speed: 58, sight: 120, aggressive: true, count: 3, home: 'nordics', idle: pick('bear-idle'), walk: pick('bear-walk'), attack: pick('bear-attack') },
  mammoth: { name: 'Mammut', cell: 112, body: [40, 16, 36, 74], hp: 200, damage: 22, speed: 48, sight: 0, aggressive: false, count: 4, home: 'nordics', idle: pick('mammoth-idle'), walk: pick('mammoth-walk'), attack: pick('mammoth-attack') },
  // Dragon mountains: red mountain wolves hunt in packs, water buffalo only defend themselves.
  dhole: { name: 'Roter Bergwolf', cell: 64, body: [14, 8, 25, 42], hp: 45, damage: 9, speed: 88, sight: 170, aggressive: true, count: 6, home: 'dragon', pack: true, idle: pick('dhole-idle'), walk: pick('dhole-walk'), attack: pick('dhole-attack') },
  buffalo: { name: 'Wasserbüffel', cell: 96, body: [30, 12, 33, 62], hp: 160, damage: 20, speed: 52, sight: 0, aggressive: false, count: 4, home: 'dragon', idle: pick('buffalo-idle'), walk: pick('buffalo-walk'), attack: pick('buffalo-attack') },
};

/** Death atlases: 8 rows (directions E, SE, S, SW, W, NW, N, NE), one column per frame; the last frame is the lying corpse. */
const one = (name: string) => { const k = Object.keys(all).find(k => k.endsWith(`/${name}.png.asset.json`)); if (!k) throw new Error(`missing ${name}`); return all[k]!.url; };
export type AnimalKind = 'tiger' | 'gazelle' | SnowKind;
export const DEATH: Record<AnimalKind, { url: string; cell: number; frames: number }> = {
  tiger: { url: one('tiger-death'), cell: 52, frames: 9 },
  gazelle: { url: one('gazelle-death'), cell: 64, frames: 6 },
  mammoth: { url: one('mammoth-death'), cell: 112, frames: 6 },
  wolf: { url: one('wolf-death'), cell: 52, frames: 9 },
  bear: { url: one('bear-death'), cell: 64, frames: 9 },
  dhole: { url: one('dhole-death'), cell: 68, frames: 9 },
  buffalo: { url: one('buffalo-death'), cell: 96, frames: 6 },
};
/** First atlas frame of a direction's death row. */
export const deathStart = (kind: AnimalKind, facing: number) => (((facing % 8) + 8) % 8) * DEATH[kind].frames;
