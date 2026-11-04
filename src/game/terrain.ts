// Engine-free mountain terraces around the dragon village: cliff rings, passes and height levels.
import { DRAGON_VILLAGE, riverX, streamDist } from './biomes';

export type Terrace = { cx: number; cy: number; rx: number; ry: number; passes: readonly number[] };
/** Passes are angles (radians, 0 = east, PI/2 = south) where the cliff opens into a ramp. */
export const PASS_HALF = 0.2;
export const TERRACES: readonly Terrace[] = [
  { cx: 2420, cy: -770, rx: 500, ry: 420, passes: [Math.PI * 0.62, Math.PI * 1.55, Math.PI * 0.05] },
  { cx: DRAGON_VILLAGE.x, cy: DRAGON_VILLAGE.y - 10, rx: 300, ry: 255, passes: [Math.PI / 2, Math.PI * 1.1] },
];
/** Cliff face height in px per terrace step (drawn on south-facing edges). */
export const CLIFF_H = 26;

const angDiff = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
export const inPass = (t: Terrace, ang: number) => t.passes.some(p => angDiff(ang, p) < PASS_HALF);
/** Streams and the main river carve gorges, so cliffs never block water. */
export const waterGap = (x: number, y: number) => streamDist(x, y) < 34 || Math.abs(x - riverX(y)) < 130;

export type CliffPoint = { x: number; y: number; ang: number; ny: number; open: boolean };
/** Sample points along each cliff ring; `open` marks passes and water gorges. */
export function cliffPoints(t: Terrace, step = 14): CliffPoint[] {
  const n = Math.ceil((2 * Math.PI * Math.sqrt((t.rx ** 2 + t.ry ** 2) / 2)) / step), out: CliffPoint[] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2, x = t.cx + Math.cos(ang) * t.rx, y = t.cy + Math.sin(ang) * t.ry;
    out.push({ x, y, ang, ny: Math.sin(ang), open: inPass(t, ang) || waterGap(x, y) });
  }
  return out;
}
const inside = (t: Terrace, x: number, y: number) => ((x - t.cx) / t.rx) ** 2 + ((y - t.cy) / t.ry) ** 2 < 1;
/** Terrace height level at a point: 0 valley, 1 middle terrace, 2 village plateau. */
export const heightAt = (x: number, y: number) => TERRACES.reduce((h, t) => h + (inside(t, x, y) ? 1 : 0), 0);
/** Distance-ish to the nearest cliff line, used to keep flora off the edges. */
export function nearCliff(x: number, y: number, margin = 22) {
  return TERRACES.some(t => {
    const k = Math.hypot((x - t.cx) / t.rx, (y - t.cy) / t.ry);
    return Math.abs(k - 1) * Math.min(t.rx, t.ry) < margin;
  });
}
