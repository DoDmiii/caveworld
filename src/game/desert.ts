// Engine-free dry-land rules: waterholes, thirst, heat and shade. world.ts only reports position/shade and applies results.
import { biomeAt, riverX, streamDist, STREAM_HALF } from './biomes';
import { aruunWaterAt } from './aruun';
import { daylight } from './survival';
import type { Weather } from './weather';

/** Waterholes (oases) in the south-western dry land; r = water radius in px. */
export const WATERHOLES = [
  { name: 'Schilfloch', x: -480, y: 2650, r: 46 },
  { name: 'Ockerquelle', x: 420, y: 2980, r: 38 },
  { name: 'Gazellentränke', x: 1050, y: 2560, r: 52 },
  { name: 'Knochenmulde', x: -150, y: 3300, r: 34 },
] as const;

/** Sandstone outcrops that cast shade; r = shade radius. */
export const OUTCROPS = [
  { x: -700, y: 2900, r: 40 }, { x: 160, y: 2700, r: 36 }, { x: 760, y: 3150, r: 44 },
  { x: -300, y: 3000, r: 34 }, { x: 1200, y: 2900, r: 38 }, { x: 300, y: 3400, r: 40 },
] as const;

export const DRINK_RANGE = 22;
export const THIRST_WARN = 25;
/** Base thirst loss per real second (full → empty ≈ 28 min in mild land). */
export const THIRST_PER_SEC = 0.06;
export const DRINK_PER_SEC = 25;
export const DEHYDRATE_DAMAGE_PER_SEC = 0.5;

export const waterholeAt = (x: number, y: number, margin = 0) =>
  WATERHOLES.find(w => Math.hypot(x - w.x, y - w.y) < w.r + margin);
export const inOutcropShade = (x: number, y: number) => OUTCROPS.some(o => Math.hypot(x - o.x, y - o.y) < o.r);

/** Player stands at drinkable water: river bank, mountain stream or waterhole. */
export const canDrinkAt = (x: number, y: number) =>
  !!waterholeAt(x, y, DRINK_RANGE) || Math.abs(x - riverX(y)) < 64 + DRINK_RANGE || streamDist(x, y) < STREAM_HALF + DRINK_RANGE || aruunWaterAt(x, y, DRINK_RANGE);

/** Heat strength 0..1: only the dry land at daytime, more under heat waves; shade cuts it to a quarter. */
export function heatLevel(o: { biome: ReturnType<typeof biomeAt>; minutesOfDay: number; weather: Weather; shaded: boolean }) {
  if (o.biome !== 'dry') return 0;
  let h = daylight(o.minutesOfDay) * (o.weather === 'heat' ? 1 : o.weather === 'sandstorm' ? 0.4 : 0.6);
  if (o.shaded) h *= 0.25;
  return h;
}

/** Thirst multiplier: running and heat dry you out faster. */
export const thirstFactor = (heat: number, running: boolean) => (1 + heat * 3) * (running ? 1.5 : 1);

export function tickThirst(thirst: number, o: { seconds: number; heat: number; running: boolean; drinking: boolean }) {
  const d = o.drinking ? DRINK_PER_SEC : -THIRST_PER_SEC * thirstFactor(o.heat, o.running);
  return Math.min(100, Math.max(0, thirst + d * o.seconds));
}

export const thirstDamage = (thirst: number, seconds: number) => (thirst <= 0 ? DEHYDRATE_DAMAGE_PER_SEC * seconds : 0);
/** Strong heat drains stamina recovery: share of regeneration kept. */
export const heatStaminaFactor = (heat: number) => 1 - heat * 0.5;
