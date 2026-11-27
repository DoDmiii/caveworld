/** Persistent evidence, not knowledge of the killer. Rooms isolate witnesses from the outside world. */
export type HiddenBody = { id: string; hut: string; x: number; y: number; found: boolean };
export type BodyObserver = { id: string; hut: string | null; x: number; y: number; alive: boolean; awake: boolean; free: boolean };
export function discoverBodies(bodies: readonly HiddenBody[], observers: readonly BodyObserver[]) {
  const found: HiddenBody[] = [];
  const state = bodies.map(body => {
    if (body.found || !observers.some(o => o.id !== body.id && o.hut === body.hut && o.alive && o.awake && o.free && Math.hypot(o.x - body.x, o.y - body.y) <= 110)) return body;
    const next = { ...body, found: true }; found.push(next); return next;
  });
  return { state, found };
}