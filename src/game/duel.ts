/** Engine-free honor duels: challenge, random rules, acceptance, the duelist's fighting rhythm, outcomes, tribute and village mockery. */
import { KNOCKDOWN_MS, type Fighter, type Pt } from './combat';

export type DuelGoal = 'death' | 'submit';
export type DuelArms = 'fists' | 'weapons';
export type DuelRules = { goal: DuelGoal; arms: DuelArms };
export type DuelCause = 'jealousy' | 'player';
export type DuelOutcome = 'win' | 'lose' | 'fled';

/** Every blow in a duel deals half damage so the fight lasts. */
export const DUEL_DAMAGE = 0.5;
/** Duelists fight with more health than an ordinary guard. */
export const DUEL_HP = 70;
/** "Until submission": the duelist yields at or below this share of his health. */
export const SUBMIT_AT = 0.15;
/** "Until submission": the player yields at or below this much health. */
export const PLAYER_SUBMIT_AT = 15;
/** Spectators stand on this ring; stepping clearly beyond it counts as running away. */
export const RING_RADIUS = 78;
export const RING_ESCAPE = RING_RADIUS + 14;
/** Villagers within this distance of the fight come to watch. */
export const SPECTATOR_RANGE = 340;
/** The challenger walks up to this distance before he speaks. */
export const CHALLENGE_REACH = 34;
export const APPROACH_SPEED = 80;
/** Running this far from an approaching challenger is cowardice. */
export const APPROACH_ESCAPE = 420;
/** Time for the ring to form before the first blow. */
export const GATHER_MS = 2600;
/** Base damage of the duelist's blows (halved in the duel). */
export const OPP_BASE_DAMAGE: Record<DuelArms, number> = { fists: 10, weapons: 16 };
export const STRIKE_REACH = 22;
/** Mockery lasts one and a half game days. */
export const SHAME_MINUTES = 1.5 * 1440;
/** A man challenges or is challenged at most once per game day. */
export const CHALLENGE_COOLDOWN_MINUTES = 1440;
/** 1-based frame of the fist finisher on which both fists land. */
export const FIST_FINISHER_IMPACT = 10;

export const DUEL_EFFECTS: Record<DuelOutcome, { rel: number; fear: number; tribute: boolean; shame: boolean }> = {
  win: { rel: 30, fear: 25, tribute: false, shame: false },
  lose: { rel: -15, fear: -10, tribute: true, shame: true },
  fled: { rel: -35, fear: -15, tribute: false, shame: true },
};

export const GOAL_NAME: Record<DuelGoal, string> = { death: 'Bis zum Tod', submit: 'Bis zur Unterwerfung' };
export const ARMS_NAME: Record<DuelArms, string> = { fists: 'Mit Fäusten', weapons: 'Mit Waffen' };
export const rulesText = (r: DuelRules) => `${GOAL_NAME[r.goal]} · ${ARMS_NAME[r.arms]}`;

/** The challenger picks the goal and the arms at random. */
export function rollRules(rng: () => number): DuelRules {
  return { goal: rng() < 0.5 ? 'death' : 'submit', arms: rng() < 0.5 ? 'fists' : 'weapons' };
}

/** Chance that a warrior accepts the player's challenge: fear and friendship hold him back, a wronged man nearly always fights. */
export function acceptChance(o: { fear: number; relationship: number; wronged: boolean }): number {
  if (o.wronged) return 0.95;
  const c = 0.75 - o.fear * 0.008 - (o.relationship > 30 ? 0.2 : 0);
  return Math.max(0.1, Math.min(0.95, c));
}

/** After a win the defeated man's woman leaves him when the duel was about her or she already leans toward the player. */
export function claimsWoman(cause: DuelCause, affairs: number, lure: number, lureNeeded: number): boolean {
  return cause === 'jealousy' || affairs > 0 || lure >= lureNeeded;
}

export const opponentDamage = (arms: DuelArms) => OPP_BASE_DAMAGE[arms] * DUEL_DAMAGE;
export const playerDuelDamage = (base: number) => base * DUEL_DAMAGE;

export type DuelHit = { fighter: Fighter; result: 'hit' | 'submitted' | 'downed' };
/** Applies the player's blow to the duelist under the duel's goal. */
export function hitDuelist(f: Fighter, damage: number, now: number, goal: DuelGoal): DuelHit {
  if (f.phase !== 'ready' || damage <= 0) return { fighter: f, result: 'hit' };
  const max = f.max ?? DUEL_HP, hp = f.hp - damage;
  if (goal === 'submit') return hp <= max * SUBMIT_AT ? { fighter: { ...f, hp: Math.max(1, hp) }, result: 'submitted' } : { fighter: { ...f, hp }, result: 'hit' };
  return hp <= 0 ? { fighter: { ...f, hp: 1, phase: 'downed', downUntil: now + KNOCKDOWN_MS }, result: 'downed' } : { fighter: { ...f, hp }, result: 'hit' };
}
/** "Until submission": the player gives up once badly hurt. "Until death" only ends with his death. */
export const playerYields = (health: number, goal: DuelGoal) => goal === 'submit' && health <= PLAYER_SUBMIT_AT;
export const leftRing = (center: Pt, p: Pt) => Math.hypot(p.x - center.x, p.y - center.y) > RING_ESCAPE;

/** Fixed spectator places around the ring. */
export function ringSlot(i: number, n: number, center: Pt, radius = RING_RADIUS + 10): Pt {
  const a = (i / Math.max(1, n)) * Math.PI * 2 + 0.4;
  return { x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius * 0.8 };
}

/** Tribute the village takes after a lost duel: half of all food, a third of all materials (rounded up). */
export type TributeGoods = { berries: number; meat: number; cooked: number; jerky: number; wood: number; stone: number; flint: number; fiber: number };
export const FOOD_KEYS = ['berries', 'meat', 'cooked', 'jerky'] as const;
export const MATERIAL_KEYS = ['wood', 'stone', 'flint', 'fiber'] as const;
export function duelTribute(g: TributeGoods): { left: TributeGoods; taken: TributeGoods } {
  const left = { ...g }, taken: TributeGoods = { berries: 0, meat: 0, cooked: 0, jerky: 0, wood: 0, stone: 0, flint: 0, fiber: 0 };
  for (const k of FOOD_KEYS) { taken[k] = Math.ceil(Math.max(0, g[k]) / 2); left[k] = Math.max(0, g[k]) - taken[k]; }
  for (const k of MATERIAL_KEYS) { taken[k] = Math.ceil(Math.max(0, g[k]) / 3); left[k] = Math.max(0, g[k]) - taken[k]; }
  return { left, taken };
}

/** Saved duel consequences: mockery per village (until game minute) and challenge cooldowns per man. */
export type DuelBook = { shame: Record<string, number>; cooldown: Record<string, number> };
export const EMPTY_DUELS: DuelBook = { shame: {}, cooldown: {} };
export const startShame = (b: DuelBook, village: string, clock: number): DuelBook => ({ ...b, shame: { ...b.shame, [village]: clock + SHAME_MINUTES } });
export const clearShame = (b: DuelBook, village: string): DuelBook => { const shame = { ...b.shame }; delete shame[village]; return { ...b, shame }; };
export const isShamed = (b: DuelBook, village: string, clock: number) => (b.shame[village] ?? 0) > clock;
export const setCooldown = (b: DuelBook, id: string, clock: number): DuelBook => ({ ...b, cooldown: { ...b.cooldown, [id]: clock + CHALLENGE_COOLDOWN_MINUTES } });
export const onCooldown = (b: DuelBook, id: string, clock: number) => (b.cooldown[id] ?? 0) > clock;
/** Applies an outcome's shame rule: losing or fleeing starts mockery, winning restores honour. */
export function recordOutcome(b: DuelBook, outcome: DuelOutcome, village: string, challenger: string, clock: number): DuelBook {
  const next = setCooldown(b, challenger, clock);
  return DUEL_EFFECTS[outcome].shame ? startShame(next, village, clock) : clearShame(next, village);
}
/** Pause between two villagers running up to shove a shamed player. */
export const nextMockDelay = (rng: () => number) => 12000 + Math.floor(rng() * 10000);

export const MOCK_LINES = ['Feigling!', 'Da läuft der Hasenfuß!', 'Hast du dich wieder eingenässt?', 'Geh heim zu deiner Mutter!', 'Ein Wenja ohne Ehre!', 'Schwach wie ein Lamm!'];
export const CHEER_LINES = ['Schlag zu!', 'Blut! Blut!', 'Mach ihn fertig!', 'Zeig es ihm!', 'Steh auf, steh auf!'];
export function challengeLine(cause: DuelCause, woman: string | undefined): string {
  return cause === 'jealousy' ? `Du hast dich an ${woman ?? 'meiner Frau'} vergangen! Stell dich mir vor allen – oder lauf wie ein Hund!` : 'Du forderst mich heraus? Dann vor allen Augen!';
}

// ---- Duelist rhythm: circle, feint, lunge, strike, jump back. ----
export type DuelAiState = 'circle' | 'feint' | 'lunge' | 'strike' | 'backstep' | 'stagger';
export type DuelAi = { state: DuelAiState; since: number; until: number; dir: 1 | -1; hit: boolean };
export type DuelMove = { mode: 'orbit' | 'close' | 'retreat' | 'hold'; speed: number };
export const ORBIT_DISTANCE = 54;
/** Chance to jump away when the player swings at close range. */
export const DODGE_CHANCE = 0.5;
/** Only the first moment of a jump back evades a blow; chasing him afterwards lands. */
export const DODGE_MS = 220;
export const STRIKE_WINDUP_MS = 220;
export const newDuelAi = (now: number): DuelAi => ({ state: 'circle', since: now, until: now + 1200, dir: 1, hit: false });
const to = (state: DuelAiState, now: number, ms: number, dir: 1 | -1): DuelAi => ({ state, since: now, until: now + ms, dir, hit: false });

export type DuelThought = { ai: DuelAi; move: DuelMove; strikeStarted: boolean; landHit: boolean };
/** One decision step of the duelist. Pure: depends only on the passed state, time, distance and random source. */
export function duelThink(ai: DuelAi, s: { now: number; dist: number; playerSwing: boolean; rng: () => number }): DuelThought {
  const { now, dist, rng } = s;
  let a = ai, strikeStarted = false, landHit = false;
  if (s.playerSwing && dist < 46 && (a.state === 'circle' || a.state === 'feint') && rng() < DODGE_CHANCE) a = to('backstep', now, 400, a.dir);
  if (now >= a.until || (a.state === 'lunge' && dist <= STRIKE_REACH)) {
    switch (a.state) {
      case 'circle': { const r = rng(); a = r < 0.3 ? to('feint', now, 260, a.dir) : r < 0.8 ? to('lunge', now, 1000, a.dir) : to('circle', now, 700 + rng() * 900, rng() < 0.5 ? -a.dir as 1 | -1 : a.dir); break; }
      case 'feint': a = to('backstep', now, 380, a.dir); break;
      case 'lunge': if (dist <= STRIKE_REACH) { a = to('strike', now, 440, a.dir); strikeStarted = true; } else a = to('backstep', now, 380, a.dir); break;
      case 'strike': a = to('backstep', now, 420, a.dir); break;
      case 'backstep': a = to('circle', now, 800 + rng() * 900, rng() < 0.5 ? -a.dir as 1 | -1 : a.dir); break;
      case 'stagger': a = rng() < 0.6 ? to('backstep', now, 400, a.dir) : to('circle', now, 600, a.dir); break;
    }
  }
  if (a.state === 'strike' && !a.hit && now >= a.since + STRIKE_WINDUP_MS) { a = { ...a, hit: true }; landHit = dist <= STRIKE_REACH + 6; }
  const move: DuelMove = a.state === 'circle' ? { mode: 'orbit', speed: 46 } : a.state === 'feint' ? { mode: 'close', speed: 150 } : a.state === 'lunge' ? { mode: 'close', speed: 135 }
    : a.state === 'backstep' ? { mode: 'retreat', speed: 150 } : { mode: 'hold', speed: 0 };
  return { ai: a, move, strikeStarted, landHit };
}
/** A landed blow interrupts whatever he was doing, including a wind-up. */
export const staggerAi = (ai: DuelAi, now: number): DuelAi => to('stagger', now, 320, ai.dir);
export const isDodging = (ai: DuelAi, now: number) => ai.state === 'backstep' && now - ai.since < DODGE_MS;

/** Velocity for a move: orbit keeps ORBIT_DISTANCE sideways, close rushes in, retreat jumps away; everything stays inside the ring. */
export function duelVelocity(move: DuelMove, self: Pt, player: Pt, center: Pt, dir: 1 | -1): Pt {
  if (move.mode === 'hold' || move.speed <= 0) return { x: 0, y: 0 };
  const dx = player.x - self.x, dy = player.y - self.y, d = Math.max(1, Math.hypot(dx, dy)), ux = dx / d, uy = dy / d;
  let vx = 0, vy = 0;
  if (move.mode === 'close') { vx = ux; vy = uy; }
  else if (move.mode === 'retreat') { vx = -ux + -uy * dir * 0.35; vy = -uy + ux * dir * 0.35; }
  else { const radial = Math.max(-1, Math.min(1, (d - ORBIT_DISTANCE) / ORBIT_DISTANCE)); vx = -uy * dir + ux * radial * 1.5; vy = ux * dir + uy * radial * 1.5; }
  const cx = center.x - self.x, cy = center.y - self.y, cd = Math.hypot(cx, cy);
  if (cd > RING_RADIUS - 12) { const k = (cd - (RING_RADIUS - 12)) / 12; vx += cx / cd * k; vy += cy / cd * k; }
  const l = Math.max(0.001, Math.hypot(vx, vy));
  return { x: vx / l * move.speed, y: vy / l * move.speed };
}
