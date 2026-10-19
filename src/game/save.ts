// Lokaler Spielstand (localStorage). Engine-frei, damit React-HUD und Phaser-Welt ihn teilen
// und vitest ihn ohne Phaser testen kann.
import { z } from 'zod';

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
  berries: count,
  meat: count,
  cooked: count,
  stock: z.object({ wood: count, stone: count, flint: count, fiber: count }),
  xp: count,
  owned: z.array(z.enum(['axe', 'spear', 'club'])).max(10),
  // Die Welt wird deterministisch (Seeds) neu erzeugt. Gespeichert wird nur die Abweichung davon.
  stumps: z.array(z.object({ x: coord, y: coord, dir: z.number().int().min(0).max(7) })).max(5000),
  minedRocks: z.array(z.tuple([coord, coord])).max(5000),
  pickedBerries: z.array(z.number().int().min(0).max(999)).max(100),
});

/** Alles, was das React-HUD besitzt (Schnellleiste, Ausrüstung). */
const UiSchema = z.object({
  hotbar: z.array(z.string().nullable()).length(3),
  hand: z.string(),
  active: z.number().int().min(0).max(3),
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
