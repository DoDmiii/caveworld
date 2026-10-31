/** Keep at least 480 world pixels on the narrow axis, regardless of orientation. */
export function cameraZoom(width: number, height: number) {
  return Math.min(2.6, Math.max(1, Math.min(width, height)) / 480);
}
