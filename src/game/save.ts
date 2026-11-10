// Lokaler Spielstand (localStorage). Engine-frei, damit React-HUD und Phaser-Welt ihn teilen
// und vitest ihn ohne Phaser testen kann.
import { z } from 'zod';
import { START_MINUTES } from './survival';
import { ITEM_IDS } from './progress';
import { STRUCTURE_KINDS } from './building';
import { TRAP_KINDS } from './traps';

export const SAVE_KEY = 'caveworld:save';
export const SAVE_VERSION = 1;

const count = z.number().int().min(0).max(1_000_000);
const coord = z.number().finite().min(-10_000).max(10_000);

/** Alles, was die Phaser-Welt besitzt. */
const GameSchema = z.object({
  x: coord,
  y: coord,
  health: z.number().min(1).max(100),
  stamina: z.number().min(0).max(100),
  // Neu seit Tag/Nacht + Überleben; Defaults, damit ältere Spielstände weiter laden.
  hunger: z.number().min(0).max(100).default(100),
  warmth: z.number().min(0).max(100).default(100),
  clock: z.number().min(0).max(10_000_000).default(START_MINUTES),
  berries: count,
  meat: count,
  cooked: count,
  jerky: count.default(0),
  tasks: z.record(z.string().max(40), z.object({ kind: z.enum(['none', 'wood', 'stone', 'forage']), since: z.number().min(0).max(10_000_000) })).optional(),
  stock: z.object({ wood: count, stone: count, flint: count, fiber: count, skull: count.optional(), wolfPelt: count.optional(), sabrePelt: count.optional() }),
  xp: count,
  owned: z.array(z.enum(ITEM_IDS)).max(20),
  // Die Welt wird deterministisch (Seeds) neu erzeugt. Gespeichert wird nur die Abweichung davon.
  stumps: z.array(z.object({ x: coord, y: coord, dir: z.number().int().min(0).max(7) })).max(5000),
  minedRocks: z.array(z.tuple([coord, coord])).max(5000),
  pickedBerries: z.array(z.number().int().min(0).max(999)).max(100),
  lootedHouses: z.array(z.string().max(80)).max(100).default([]),
  captives: z.array(z.object({ id: z.string().max(40), state: z.enum(['surrender', 'bound', 'camp']), x: coord, y: coord })).max(50).default([]),
  // Vorratskiste am Lagerfeuer; Default, damit ältere Spielstände weiter laden.
  chest: z.object({ wood: count, stone: count, flint: count, fiber: count, berries: count, meat: count, cooked: count }).default({ wood: 0, stone: 0, flint: 0, fiber: 0, berries: 0, meat: 0, cooked: 0 }),
  structures: z.array(z.object({ id: z.string().max(40), kind: z.enum(STRUCTURE_KINDS), x: coord, y: coord, dir: z.number().int().min(0).max(7), meat: z.array(z.number().min(0)).max(3) })).max(60).default([]),
  traps: z.array(z.object({ id: z.string().max(40), kind: z.enum(TRAP_KINDS), x: coord, y: coord, uses: z.number().int().min(0).max(10), meat: z.number().int().min(0).max(10) })).max(20).default([]),
  signals: z.object({ manualAlarm: z.boolean(), hornReadyAt: z.number().finite().min(0).max(10_000_000) }).optional(),
  tutorial: z.object({ step: z.number().int().min(0).max(20), progress: z.number().min(0).max(10_000) }).optional(),
  caves: z.object({ current: z.enum(['home', 'ice', 'obsidian']).nullable(), mined: z.array(z.string().max(40)).max(24), paintings: z.array(z.enum(['mammoth', 'gazelle', 'lion'])).max(3), obsidian: count, pigment: count, sharpened: z.boolean(), builds: z.record(z.enum(['home', 'ice', 'obsidian']), z.array(z.object({ id: z.string().max(40), kind: z.enum(['fire', 'shelter']), x: coord, y: coord })).max(20)) }).optional(),
  companions: z.array(z.object({ id: z.string().max(40), mode: z.enum(['follow', 'wait', 'return']), x: coord, y: coord })).max(50).optional(),
  allies: z.array(z.object({ id: z.string().max(40), hp: z.number().min(0).max(50), downMs: z.number().min(0).max(60000) })).max(50).optional(),
  profiles: z.record(z.string().max(40), z.object({
    trust: z.number().int().min(0).max(100),
    skills: z.object({ hunt: z.number().int().min(1).max(5), tough: z.number().int().min(1).max(5), gather: z.number().int().min(1).max(5), watch: z.number().int().min(1).max(5), fire: z.number().int().min(1).max(5) }),
  })).optional(),
  campSocial: z.object({
    bonds: z.record(z.string().max(80), z.number().int().min(-100).max(100)),
    resolved: z.record(z.string().max(80), z.number().int().min(1).max(10000)),
  }).optional(),
  couples: z.object({ lure: z.record(z.string().max(40), z.number().min(0).max(100)), affairs: z.record(z.string().max(40), z.number().int().min(0).max(10000)), suspicion: z.record(z.string().max(40), z.number().min(0).max(100)), broken: z.array(z.string().max(40)).max(30) }).optional(),
  repro: z.object({
    pregnant: z.record(z.string().max(40), z.object({ father: z.string().max(40), social: z.string().max(40).optional(), day: z.number().int().min(0) })),
    children: z.array(z.object({ id: z.string().max(80), name: z.string().max(30), mother: z.string().max(40), father: z.string().max(40), social: z.string().max(40).optional(), born: z.number().int().min(0), hair: z.enum(['blond', 'dunkel', 'schwarz']) })).max(200),
    day: z.number().int().min(-1),
  }).optional(),
  trustProgress: z.record(z.string().max(40), z.object({ done: z.array(z.string().max(40)).max(10), since: z.number().min(0), peacefulSince: z.number().min(0), trades: z.number().int().min(0).max(2), watch: z.number().min(0).max(240) })).optional(),
  warband: z.object({
    pending: z.record(z.string().max(4), z.number().min(0)),
    cooldown: z.record(z.string().max(4), z.number().min(0)),
    active: z.object({ village: z.number().int().min(0).max(10), phase: z.enum(['march', 'assault', 'return']), until: z.number().min(0) }).optional(),
  }).optional(),
  raid: z.record(z.string().max(4), z.number().min(0).max(10_000_000)).optional(),
  fighters: z.array(z.object({ id: z.string().max(40), hp: z.number().min(0).max(200), phase: z.enum(['ready', 'downed', 'dead']), x: coord, y: coord, facing: z.number().int().min(0).max(7), beheaded: z.boolean().optional(), headPosition: z.object({ x: coord, y: coord }).optional(), deathClock: z.number().min(0).max(10_000_000).optional(), skullTaken: z.boolean().optional() })).max(50).optional(),
  fear: z.object({
    fear: z.record(z.string().max(40), z.number().min(0).max(100)),
    tributeDay: z.record(z.string().max(40), z.number().int().min(0)),
    grudge: z.record(z.string().max(40), z.number().int().min(0).max(10)),
    day: z.number().int().min(0),
  }).optional(),
  rumors: z.object({ rumors: z.array(z.object({ id: z.string().max(80), kind: z.enum(['attack', 'kill', 'finisher', 'steal', 'capture', 'execution', 'champion']), origin: z.string().max(40), bornAt: z.number().min(0), reached: z.array(z.string().max(40)).max(20) })).max(30) }).optional(),
  relationships: z.object({
    village: z.record(z.string(), z.number().int().min(-100).max(100)).default({}),
    personal: z.record(z.string(), z.number().int().min(-100).max(100)).default({}),
    alarmUntil: z.record(z.string(), z.number().finite()).default({}),
  }).default({ village: {}, personal: {}, alarmUntil: {} }),
});

/** Alles, was das React-HUD besitzt (Schnellleiste, Ausrüstung). */
const UiSchema = z.object({
  hotbar: z.array(z.string().nullable()).length(3),
  hand: z.string(),
  active: z.number().int().min(0).max(3),
  armor: z.enum(['wolfArmor', 'sabreArmor']).nullable().optional(),
  off: z.string().nullable().optional(),
});

const SaveSchema = z.object({
  v: z.literal(SAVE_VERSION),
  savedAt: z.number(),
  game: GameSchema.optional(),
  ui: UiSchema.optional(),
});

export type GameSave = z.infer<typeof GameSchema>;
export type UiSave = z.infer<typeof UiSchema>;
export type SaveData = z.infer<typeof SaveSchema>;

let blocked = false;

function store(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null; // z. B. Safari im privaten Modus oder Zugriff blockiert
  }
}

/** Liest und prüft den Spielstand. Gibt bei fehlendem oder kaputtem Stand null zurück. */
export function loadSave(): SaveData | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = SaveSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
    s.setItem(`${SAVE_KEY}:backup`, raw); // nicht stillschweigend wegwerfen
    return null;
  } catch {
    return null;
  }
}

/** Schreibt einen Teilbereich (game und/oder ui); der jeweils andere bleibt erhalten. */
export function saveGame(patch: { game?: GameSave; ui?: UiSave }): boolean {
  if (blocked) return false;
  const s = store();
  if (!s) return false;
  try {
    const current = loadSave();
    const next: SaveData = { ...current, ...patch, v: SAVE_VERSION, savedAt: Date.now() };
    s.setItem(SAVE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false; // Speicher voll oder gesperrt: das Spiel läuft trotzdem weiter
  }
}

export function clearSave(): void {
  try {
    store()?.removeItem(SAVE_KEY);
  } catch {
    /* ignorieren */
  }
}

/** Verhindert weitere Schreibzugriffe (z. B. direkt vor „Neues Spiel“ + Reload). */
export function blockSaving(): void {
  blocked = true;
}
