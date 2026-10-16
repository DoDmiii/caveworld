// Wildlife sprite URL maps (tiger & gazelle). 40x40 cells, 8 directions.
const tigerIdle = import.meta.glob('../assets/npc/tiger-idle-*.png.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;
const tigerWalk = import.meta.glob('../assets/npc/tiger-walk-*.png.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;
const tigerAttack = import.meta.glob('../assets/npc/tiger-attack-*.png.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;
const gazelleIdle = import.meta.glob('../assets/npc/gazelle-idle-*.png.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;
const gazelleWalk = import.meta.glob('../assets/npc/gazelle-walk-*.png.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;
const gazelleRun = import.meta.glob('../assets/npc/gazelle-run-*.png.asset.json', { eager: true, import: 'default' }) as Record<string, { url: string }>;

const pick = (map: Record<string, { url: string }>, token: string) => {
  const arr: string[] = [];
  for (let i = 0; i < 8; i++) {
    const key = Object.keys(map).find(k => k.endsWith(`${token}-${i}.png.asset.json`));
    if (!key) throw new Error(`missing ${token}-${i}`);
    arr.push(map[key]!.url);
  }
  return arr;
};

export const TIGER = { idle: pick(tigerIdle, 'idle'), walk: pick(tigerWalk, 'walk'), attack: pick(tigerAttack, 'attack') };
export const GAZELLE = { idle: pick(gazelleIdle, 'idle'), walk: pick(gazelleWalk, 'walk'), run: pick(gazelleRun, 'run') };
