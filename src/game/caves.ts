/** Engine-free cave geography, finite mineral deposits and permanent ritual bonuses. */
export const CAVE_IDS = ['home', 'ice', 'obsidian'] as const;
export type CaveId = typeof CAVE_IDS[number];
export const PAINTING_IDS = ['mammoth', 'gazelle', 'lion'] as const;
export type PaintingId = typeof PAINTING_IDS[number];
export const CAVE_SIZE = 640;
export const TILE = 16;
export const CAVE_SPAWN = { x: 320, y: 558 };
export const CAVE_EXIT = { x: 320, y: 588 };
export const PAINT_WALL = { x: 320, y: 120 };
export const CAVES: Record<CaveId, { name: string; x: number; y: number; ambient: number }> = {
  home: { name: 'Sippenhöhle', x: 1000, y: 560, ambient: 12 },
  ice: { name: 'Eishöhle', x: -720, y: -1280, ambient: -2 },
  obsidian: { name: 'Obsidian-Grotte', x: -720, y: 1120, ambient: 10 },
};
export const PAINTINGS: Record<PaintingId, { name: string; effect: string; cost: number }> = {
  mammoth: { name: 'Das Ur-Mammut', effect: '+20 % Nahkampfschaden für dich und deinen Trupp', cost: 3 },
  gazelle: { name: 'Die Sonnen-Gazelle', effect: '−25 % Ausdauer- und Nahrungsverbrauch beim Sprinten', cost: 3 },
  lion: { name: 'Der Höhlenlöwe', effect: '+15 % Kälteresistenz für dich und deine Begleiter', cost: 3 },
};
export type CaveBuild = { id: string; kind: 'fire' | 'shelter'; x: number; y: number };
export type CaveState = { current: CaveId | null; mined: string[]; paintings: PaintingId[]; obsidian: number; pigment: number; sharpened: boolean; builds: Partial<Record<CaveId, CaveBuild[]>> };
export const newCaves = (): CaveState => ({ current: null, mined: [], paintings: [], obsidian: 0, pigment: 0, sharpened: false, builds: {} });
export function caveAt(x: number, y: number): CaveId | undefined {
  return CAVE_IDS.find(id => Math.hypot(x - CAVES[id].x, y - CAVES[id].y - 22) < 45);
}
/** Connected entrance, winding passage and three chambers. */
export function caveFloor(x: number, y: number): boolean {
  const rooms = [[224, 464, 416, 608], [272, 320, 368, 496], [160, 224, 464, 368], [288, 144, 352, 256], [192, 112, 448, 192], [96, 288, 192, 400], [448, 224, 544, 336]];
  return rooms.some(([l = 0, t = 0, r = 0, b = 0]) => x >= l && x < r && y >= t && y < b);
}
export function caveWalkable(x: number, y: number): boolean {
  return [[-10, 0], [10, 0], [-10, 18], [10, 18]].every(([dx = 0, dy = 0]) => caveFloor(x + dx, y + dy));
}
export type Deposit = { id: string; kind: 'obsidian' | 'pigment'; x: number; y: number; yield: number };
export function caveDeposits(id: CaveId): Deposit[] {
  return [[128, 320], [160, 368], [208, 256], [432, 288], [496, 256], [496, 304], [240, 160], [400, 160]].map(([x = 0, y = 0], i) => ({ id: `${id}:${i}`, x, y, kind: i < (id === 'obsidian' ? 4 : 2) ? 'obsidian' : 'pigment', yield: 2 }));
}
export function mineDeposit(state: CaveState, depositId: string): CaveState | null {
  if (!state.current || state.mined.includes(depositId)) return null;
  const d = caveDeposits(state.current).find(d => d.id === depositId);
  return d ? { ...state, mined: [...state.mined, d.id], [d.kind]: state[d.kind] + d.yield } : null;
}
export function paint(state: CaveState, id: PaintingId): CaveState | null {
  if (!state.current || state.paintings.includes(id) || state.pigment < PAINTINGS[id].cost) return null;
  return { ...state, pigment: state.pigment - PAINTINGS[id].cost, paintings: [...state.paintings, id] };
}
export function sharpen(state: CaveState): CaveState | null {
  return state.sharpened || state.obsidian < 3 ? null : { ...state, obsidian: state.obsidian - 3, sharpened: true };
}
export const caveDamageFactor = (state: CaveState, weapon: string) => (state.paintings.includes('mammoth') ? 1.2 : 1) * (state.sharpened && (weapon === 'spear' || weapon === 'club') ? 1.25 : 1);
export const caveSprintFactor = (state: CaveState) => state.paintings.includes('gazelle') ? 0.75 : 1;
export const caveColdFactor = (state: CaveState) => state.paintings.includes('lion') ? 0.85 : 1;