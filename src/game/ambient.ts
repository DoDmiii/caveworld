/** Engine-free ambient wildlife: mountain birds that flush and stream trout that dart away. */
import { STREAMS, DRAGON_VILLAGE } from './biomes';

export type Bird = { x: number; y: number; hx: number; hy: number; state: 'rest' | 'flee'; vx: number; vy: number; until: number };
export type Flock = { id: number; x: number; y: number; birds: Bird[]; returnAt: number };
export type Fish = { x: number; y: number; hx: number; hy: number; dx: number; dy: number; fleeUntil: number; phase: number };
export type Movement = { running: boolean; crouching: boolean; moving: boolean };

export const FLUSH_RADIUS = { run: 110, walk: 70, crouch: 26 } as const;
export const FISH_SCARE = 34;
export const FLOCK_RETURN_MS = 25000;
export const GUARD_NOTICE = 220;

const rand = (seed: number) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** Flush radius for the player's current gait. Standing still never scares. */
export function flushRadius(m: Movement) {
  if (!m.moving) return 0;
  return m.running ? FLUSH_RADIUS.run : m.crouching ? FLUSH_RADIUS.crouch : FLUSH_RADIUS.walk;
}

export function createFlocks(seed = 7): Flock[] {
  const r = rand(seed), out: Flock[] = [];
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2, d = 230 + r() * 380;
    const x = DRAGON_VILLAGE.x + Math.cos(a) * d, y = DRAGON_VILLAGE.y + Math.sin(a) * d;
    const n = 3 + Math.floor(r() * 4), birds: Bird[] = [];
    for (let b = 0; b < n; b++) { const hx = x + (r() - 0.5) * 30, hy = y + (r() - 0.5) * 22; birds.push({ x: hx, y: hy, hx, hy, state: 'rest', vx: 0, vy: 0, until: 0 }); }
    out.push({ id: i, x, y, birds, returnAt: 0 });
  }
  return out;
}

export function createFish(seed = 11): Fish[] {
  const r = rand(seed), out: Fish[] = [];
  for (const s of STREAMS) for (let i = 1; i < s.length; i++) {
    const [ax, ay] = s[i - 1]!, [bx, by] = s[i]!, len = Math.hypot(bx - ax, by - ay);
    const dx = (ax - bx) / (len || 1), dy = (ay - by) / (len || 1); // upstream direction
    for (let k = 0; k < Math.floor(len / 120); k++) {
      const t = r(), hx = ax + (bx - ax) * t + (r() - 0.5) * 8, hy = ay + (by - ay) * t + (r() - 0.5) * 8;
      out.push({ x: hx, y: hy, hx, hy, dx, dy, fleeUntil: 0, phase: r() * 6 });
    }
  }
  return out;
}

/** Advances flocks; returns flocks that flushed this tick. */
export function tickFlocks(flocks: Flock[], px: number, py: number, m: Movement, now: number, dt: number): Flock[] {
  const flushed: Flock[] = [], radius = flushRadius(m), s = dt / 1000;
  for (const f of flocks) {
    const resting = f.birds.every(b => b.state === 'rest');
    if (resting && radius > 0 && Math.hypot(px - f.x, py - f.y) < radius) {
      const away = Math.atan2(f.y - py, f.x - px);
      f.birds.forEach((b, i) => { const a = away + (i - f.birds.length / 2) * 0.25; b.state = 'flee'; b.vx = Math.cos(a) * 140; b.vy = Math.sin(a) * 140 - 60; b.until = now + 4000; });
      f.returnAt = now + FLOCK_RETURN_MS; flushed.push(f);
    }
    for (const b of f.birds) {
      if (b.state === 'flee') { b.x += b.vx * s; b.y += b.vy * s; if (now > b.until) { b.x = b.hx; b.y = b.hy; } }
    }
    if (!resting && now > f.returnAt && Math.hypot(px - f.x, py - f.y) > FLUSH_RADIUS.run * 1.5) for (const b of f.birds) { b.state = 'rest'; b.x = b.hx; b.y = b.hy; }
  }
  return flushed;
}

/** Fish idle against the current and dart upstream when the player wades close. Returns true if any fish fled. */
export function tickFish(fish: Fish[], px: number, py: number, m: Movement, now: number, dt: number): boolean {
  let any = false; const s = dt / 1000;
  for (const f of fish) {
    if (m.moving && !m.crouching && f.fleeUntil <= now && Math.hypot(px - f.x, py - f.y) < FISH_SCARE) { f.fleeUntil = now + 1400; any = true; }
    if (f.fleeUntil > now) { f.x += f.dx * 120 * s; f.y += f.dy * 120 * s; }
    else { f.x += (f.hx - f.x) * Math.min(1, s * 0.6); f.y += (f.hy - f.y) * Math.min(1, s * 0.6); f.phase += s * 2; }
  }
  return any;
}

/** Guards notice flushing birds near the dragon terrace. */
export const guardsNotice = (f: Flock) => Math.hypot(f.x - DRAGON_VILLAGE.x, f.y - DRAGON_VILLAGE.y) < DRAGON_VILLAGE.r + GUARD_NOTICE;
