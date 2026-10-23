// Engine-free combat helpers: encircling slots and crowd separation for chasers.

export type Pt = { x: number; y: number };

export type Fighter = { hp: number; phase: 'ready' | 'downed' | 'dead'; downUntil: number };
export const KNOCKDOWN_MS = 7000;
export const FINISHER_REACH = 30;
export const FIGHTER_HP = 60;
export const newFighter = (): Fighter => ({ hp: FIGHTER_HP, phase: 'ready', downUntil: 0 });
export function hitFighter(f: Fighter, damage: number, now: number): Fighter {
  if (f.phase !== 'ready' || damage <= 0) return f;
  const hp = Math.max(1, f.hp - damage);
  return hp <= 15 ? { hp, phase: 'downed', downUntil: now + KNOCKDOWN_MS } : { ...f, hp };
}
export function recoverFighter(f: Fighter, now: number): Fighter {
  return f.phase === 'downed' && now >= f.downUntil ? { hp: 30, phase: 'ready', downUntil: 0 } : f;
}
export function canFinish(f: Fighter, distance: number, wedge: boolean, allied: boolean): boolean {
  return !allied && wedge && f.phase === 'downed' && distance <= FINISHER_REACH;
}
export function finishFighter(f: Fighter): Fighter {
  return f.phase === 'downed' ? { hp: 0, phase: 'dead', downUntil: 0 } : f;
}

/** Ring position for attacker `i` of `n` around the player; slots slowly rotate so enemies circle. */
export function flankSlot(i: number, n: number, center: Pt, radius: number, time: number, seed = 0): Pt {
  const base = (i / Math.max(1, n)) * Math.PI * 2;
  const drift = Math.sin(time / 1800 + seed) * 0.6 + time / 4000;
  const a = base + drift;
  return { x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius };
}

/** Push-away vector from neighbours closer than `min`; magnitude grows as they overlap. */
export function separation(self: Pt, others: Pt[], min: number): Pt {
  let x = 0, y = 0;
  for (const o of others) {
    const dx = self.x - o.x, dy = self.y - o.y, d = Math.hypot(dx, dy);
    if (d === 0 || d >= min) continue;
    const k = (min - d) / min;
    x += (dx / d) * k; y += (dy / d) * k;
  }
  return { x, y };
}

/** Which attacker may strike right now: only the one with the active "lunge" turn. */
export function lungeIndex(n: number, time: number, period = 1400): number {
  return n <= 0 ? -1 : Math.floor(time / period) % n;
}
