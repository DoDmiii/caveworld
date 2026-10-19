// Wildlife sprite URL maps. Tiger & gazelle 40x40; snow animals use their own cell size. 8 directions.
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

export type SnowKind = 'wolf' | 'bear' | 'mammoth';
export type SnowSpecies = {
  name: string; cell: number; body: [number, number, number, number];
  hp: number; damage: number; speed: number; sight: number; aggressive: boolean; count: number;
  idle: string[]; walk: string[]; attack?: string[];
};
// Wolves hunt in small packs, bears are slow tanks, mammoths only fight back.
export const SNOW: Record<SnowKind, SnowSpecies> = {
  wolf: { name: 'Schneewolf', cell: 36, body: [14, 8, 11, 24], hp: 40, damage: 8, speed: 82, sight: 160, aggressive: true, count: 6, idle: pick('wolf-idle'), walk: pick('wolf-walk'), attack: pick('wolf-attack') },
  bear: { name: 'Höhlenbär', cell: 48, body: [20, 10, 14, 32], hp: 110, damage: 16, speed: 58, sight: 120, aggressive: true, count: 3, idle: pick('bear-idle'), walk: pick('bear-walk') },
  mammoth: { name: 'Mammut', cell: 96, body: [40, 16, 28, 66], hp: 200, damage: 22, speed: 48, sight: 0, aggressive: false, count: 4, idle: pick('mammoth-idle'), walk: pick('mammoth-walk'), attack: pick('mammoth-attack') },
};
