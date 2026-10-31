import { describe, expect, it } from 'vitest';
import { cameraZoom } from '../game/mobile-controls';

describe('mobile camera visibility', () => {
  it('shows at least 360 world pixels across a portrait phone', () => {
    expect(411 / cameraZoom(411, 749)).toBeGreaterThanOrEqual(360);
  });
  it('retains that visibility when rotating to landscape', () => {
    expect(cameraZoom(749, 411)).toBe(cameraZoom(411, 749));
    expect(411 / cameraZoom(749, 411)).toBeGreaterThanOrEqual(360);
  });
  it('preserves desktop pixel zoom', () => {
    expect(cameraZoom(1280, 1800)).toBe(2.6);
  });
});
