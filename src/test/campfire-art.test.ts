import { describe, expect, it } from 'vitest';
import { FURNITURE_FRAMES } from '@/game/interiors';
import { HEARTH_ROWS, HEARTH_SHEET, CAMPFIRE_SHEET, FIRE_FPS, fireStartFrame } from '@/game/campfire-art';

describe('animated fires', () => {
  it('gives every hut hearth its own animation row', () => {
    const hearths = FURNITURE_FRAMES.filter(f => f.kind === 'hearth').map(f => f.id);
    expect(hearths).toHaveLength(5);
    for (const id of hearths) expect(HEARTH_ROWS[id]).toBeDefined();
    expect(new Set(Object.values(HEARTH_ROWS).map(r => r.row)).size).toBe(5);
    for (const r of Object.values(HEARTH_ROWS)) expect(r.frames).toBeLessThanOrEqual(HEARTH_SHEET.cols);
  });
  it('keeps the uploaded frame counts and 150 ms timing', () => {
    expect(CAMPFIRE_SHEET.frames).toBe(13);
    expect(HEARTH_ROWS['hearth-1']?.frames).toBe(9);
    expect(1000 / FIRE_FPS).toBeCloseTo(150);
  });
  it('starts fires on a valid frame, also at negative coordinates', () => {
    for (const [x, y] of [[1000, 720], [2330, -718], [-560, -1050]] as const) {
      const f = fireStartFrame(x, y, 13);
      expect(f).toBeGreaterThanOrEqual(0); expect(f).toBeLessThan(13);
    }
  });
});
