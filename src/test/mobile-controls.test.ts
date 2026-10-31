import { describe, expect, it } from 'vitest';
import { cameraZoom } from '../game/mobile-controls';

describe('mobile camera visibility', () => {
  it('shows at least 480 world pixels across a portrait phone', () => {
    expect(411 / cameraZoom(411, 749)).toBeGreaterThanOrEqual(480);
  });
  it('retains that visibility when rotating to landscape', () => {
    expect(cameraZoom(749, 411)).toBe(cameraZoom(411, 749));
    expect(411 / cameraZoom(749, 411)).toBeGreaterThanOrEqual(480);
  });
  it('preserves desktop pixel zoom', () => {
    expect(cameraZoom(1280, 1800)).toBe(2.6);
  });
});

describe('manual zoom', () => {
  it('clamps between 0.6x and 1.8x', async () => {
    const { clampZoomScale } = await import('../game/mobile-controls');
    expect(clampZoomScale(5)).toBe(1.8);
    expect(clampZoomScale(0.1)).toBe(0.6);
  });
  it('pinching fingers twice as far apart doubles the zoom', async () => {
    const { pinchZoom } = await import('../game/mobile-controls');
    expect(pinchZoom(0.8, 100, 200)).toBe(1.6);
  });
  it('applies the manual multiplier to the camera', () => {
    expect(cameraZoom(1280, 1800, 0.5 / 0.5 * 0.6)).toBeCloseTo(2.6 * 0.6);
  });
});
