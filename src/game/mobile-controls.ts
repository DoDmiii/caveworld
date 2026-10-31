/** Keep at least 480 world pixels on the narrow axis, regardless of orientation. */
export function cameraZoom(width: number, height: number, scale = 1) {
  return Math.min(2.6, Math.max(1, Math.min(width, height)) / 480) * clampZoomScale(scale);
}

/** Manual zoom multiplier on top of the automatic camera zoom. */
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 1.8;
export const ZOOM_STEP = 1.15;
export const ZOOM_KEY = 'caveworld:zoom';

export function clampZoomScale(scale: number) {
  if (!Number.isFinite(scale)) return 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale));
}

/** Pinch: scale by the ratio of finger distances. */
export function pinchZoom(scale: number, startDistance: number, distance: number) {
  if (startDistance <= 0) return clampZoomScale(scale);
  return clampZoomScale(scale * (distance / startDistance));
}
