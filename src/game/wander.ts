/**
 * Engine-free idle wandering for camp and village inhabitants.
 * Inside their home area they pick a random free spot; anyone who ended up outside
 * (e.g. stepping out of a hut at dawn) walks back towards the home centre instead of freezing.
 */
export type WanderHome = {
  /** Whether a point is a valid wander destination (bounds + keep-out spots). */
  allowed: (x: number, y: number) => boolean;
  /** Whether the actor still counts as standing inside its home area. */
  within: (x: number, y: number) => boolean;
  cx: number; cy: number;
};

export const WANDER_TRIES = 16;
/** Longest step taken back towards home in one decision. */
export const RETURN_STEP = 70;

export function pickWander(
  x: number, y: number, home: WanderHome, clear: (x: number, y: number) => boolean,
  rnd: () => number, spanX: number, spanY: number,
): { x: number; y: number } {
  if (home.within(x, y)) {
    for (let a = 0; a < WANDER_TRIES; a++) {
      const tx = x + (rnd() - 0.5) * spanX, ty = y + (rnd() - 0.5) * spanY;
      if ([0.25, 0.5, 0.75, 1].every(k => {
        const px = x + (tx - x) * k, py = y + (ty - y) * k;
        return home.allowed(px, py) && clear(px, py);
      })) return { x: tx, y: ty };
    }
  }
  // Outside home, or boxed in at its edge: head back towards the centre.
  {
    const base = Math.atan2(home.cy - y, home.cx - x), dist = Math.hypot(home.cx - x, home.cy - y);
    const step = Math.min(dist, RETURN_STEP);
    // Jitter the heading so actors slide around a hut wall instead of pushing into it forever.
    for (let a = 0; a < WANDER_TRIES; a++) {
      const turn = a === 0 ? 0 : (rnd() - 0.5) * Math.PI * Math.min(1, a / 6);
      const tx = x + Math.cos(base + turn) * step, ty = y + Math.sin(base + turn) * step;
      if (clear(tx, ty)) return { x: tx, y: ty };
    }
    if (step < 4) return { x, y };
    return { x: x + Math.cos(base) * step, y: y + Math.sin(base) * step };
  }
}
