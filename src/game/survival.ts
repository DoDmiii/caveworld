// Engine-freie Überlebensregeln: Tageszeit, Hunger und Kälte (Wärme).
// Alle Zahlenwerte sind hier gebündelt, damit sich das Spielgefühl an einer Stelle einstellen lässt.
import type { Biome } from './biomes';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// ---------- Uhr ----------
export const MINUTES_PER_DAY = 1440;
/** So viele echte Sekunden dauert ein Spieltag. */
export const REAL_SECONDS_PER_DAY = 720; // 12 Minuten
export const GAME_MIN_PER_SEC = MINUTES_PER_DAY / REAL_SECONDS_PER_DAY;
/** Spielbeginn: Tag 1, 08:24 (wie bisher im HUD). */
export const START_MINUTES = 8 * 60 + 24;

export type Clock = { day: number; hour: number; minute: number; minutesOfDay: number };

export function clockOf(totalMinutes: number): Clock {
  const t = Math.max(0, totalMinutes);
  const minutesOfDay = Math.floor(t % MINUTES_PER_DAY);
  return {
    day: Math.floor(t / MINUTES_PER_DAY) + 1,
    hour: Math.floor(minutesOfDay / 60),
    minute: minutesOfDay % 60,
    minutesOfDay,
  };
}

export const formatMinutes = (minutesOfDay: number) =>
  `${String(Math.floor(minutesOfDay / 60) % 24).padStart(2, '0')}:${String(Math.floor(minutesOfDay % 60)).padStart(2, '0')}`;

export const advanceClock = (totalMinutes: number, seconds: number) => totalMinutes + seconds * GAME_MIN_PER_SEC;

// ---------- Tageslicht ----------
/** 0 = tiefe Nacht, 1 = voller Tag. Sonnenaufgang gegen 6 Uhr, Sonnenuntergang gegen 20 Uhr. */
export function daylight(minutesOfDay: number): number {
  const h = (minutesOfDay % MINUTES_PER_DAY) / 60;
  return Math.min(smooth(5, 7.5, h), 1 - smooth(18.5, 21, h));
}
export const isNight = (minutesOfDay: number) => daylight(minutesOfDay) < 0.3;

export type Tint = { r: number; g: number; b: number; a: number };
export const MAX_NIGHT_ALPHA = 0.74;

/** Farbe und Stärke der Dunkelheit: warmes Violett in der Dämmerung, tiefes Blau in der Nacht. */
export function skyTint(minutesOfDay: number): Tint {
  const dark = 1 - daylight(minutesOfDay);
  const k = smooth(0.35, 0.95, dark); // 0 = Dämmerung, 1 = tiefe Nacht
  return {
    r: Math.round(lerp(70, 6, k)),
    g: Math.round(lerp(34, 12, k)),
    b: Math.round(lerp(52, 38, k)),
    a: Math.round(MAX_NIGHT_ALPHA * dark * 1000) / 1000,
  };
}

// ---------- Hunger ----------
export const HUNGER_PER_SEC = 0.1; // voll -> leer in ca. 17 Minuten
export const HUNGER_WARN = 25;

export const tickHunger = (hunger: number, seconds: number) => Math.max(0, hunger - HUNGER_PER_SEC * seconds);

// ---------- Kälte / Wärme (100 = warm, 0 = erfroren) ----------
export const COMFORT_TEMP = 10;
export const COLD_WARN = 30;
export const FIRE_WARMTH_PER_SEC = 8;
export const WARM_RECOVERY_PER_SEC = 1.5;
export const COLD_LOSS_PER_DEGREE_SEC = 0.012;

const BIOME_TEMP: Record<Biome, number> = {
  nordics: -4, dragon: 0, wenjaWest: 14, wenjaEast: 14, dry: 20, jungle: 24,
};

/** Gefühlte Temperatur: Biom-Grundwert, nachts bis zu 12 Grad kälter. */
export const ambientTemp = (biome: Biome, minutesOfDay: number) =>
  BIOME_TEMP[biome] - 12 * (1 - daylight(minutesOfDay));

export function tickWarmth(
  warmth: number,
  o: { ambient: number; nearFire: boolean; seconds: number; insulation?: number },
): number {
  const insulation = clamp(o.insulation ?? 0, 0, 0.9); // Platz für spätere Kleidung (Fell, Leder)
  let d: number;
  if (o.nearFire) d = FIRE_WARMTH_PER_SEC;
  else if (o.ambient >= COMFORT_TEMP) d = WARM_RECOVERY_PER_SEC;
  else d = -(COMFORT_TEMP - o.ambient) * COLD_LOSS_PER_DEGREE_SEC * (1 - insulation);
  return clamp(warmth + d * o.seconds, 0, 100);
}

// ---------- Folgen ----------
export const STARVE_DAMAGE_PER_SEC = 0.5;
export const FREEZE_DAMAGE_PER_SEC = 0.5;

/** Lebensverlust durch Verhungern und Erfrieren; beides zusammen wirkt doppelt. */
export const survivalDamage = (hunger: number, warmth: number, seconds: number) =>
  ((hunger <= 0 ? STARVE_DAMAGE_PER_SEC : 0) + (warmth <= 0 ? FREEZE_DAMAGE_PER_SEC : 0)) * seconds;

// ---------- Schlafen ----------
export const SLEEP_ADVANCE_MIN = 8 * 60;
export const SLEEP_SECONDS = 3.2;
export const SLEEP_CLOCK_PER_SEC = SLEEP_ADVANCE_MIN / SLEEP_SECONDS;
export const SLEEP_HUNGER_COST = 10;

// ---------- Ausdauer / Sprint ----------
/** Nach völliger Erschöpfung darf erst ab dieser Ausdauer wieder gesprintet werden (verhindert Sprint-Flackern). */
export const SPRINT_RECOVER = 20;
/** Sprinten ist nur erlaubt, solange die Figur nicht außer Atem ist. */
export function canSprint(exhausted: boolean, stamina: number): boolean {
  return !exhausted && stamina > 0;
}
/** Leer gesprintet → außer Atem; erst ab SPRINT_RECOVER wieder frei. */
export function nextExhausted(exhausted: boolean, stamina: number): boolean {
  if (stamina <= 0) return true;
  if (exhausted && stamina >= SPRINT_RECOVER) return false;
  return exhausted;
}
