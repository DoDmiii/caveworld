import PF from 'pathfinding';
import type * as Phaser from 'phaser';
import { separation, type Pt } from './combat';
import { companionSpeed, formationSlot, type CompanionOrder } from './companions';
import { MAP } from './biomes';

export type Block = Pt & { width: number; height: number };
export type CompanionActor = { id: string; sprite: Phaser.Physics.Arcade.Sprite; texture: string; home: Pt; facing: number; face: (direction: number) => void };
type Route = { points: Pt[]; next: number; goal: Pt };
const CELL = 8;
const finder = new PF.AStarFinder({ allowDiagonal: true, dontCrossCorners: true });

/** Feet-anchored actor footprint, matching the Arcade collision body. */
export function clearCompanionPoint(p: Pt, blocks: Block[]) {
  return p.x >= MAP.x + 8 && p.x <= MAP.x + MAP.w - 8 && p.y >= MAP.y + 8 && p.y <= MAP.y + MAP.h - 16
    && !blocks.some(b => p.x + 7 > b.x && p.x - 7 < b.x + b.width && p.y + 15 > b.y && p.y + 5 < b.y + b.height);
}
export function findCompanionPath(start: Pt, goal: Pt, blocks: Block[]): Pt[] {
  const length = Math.hypot(goal.x - start.x, goal.y - start.y);
  const straight = Array.from({ length: Math.max(1, Math.ceil(length / 4)) }, (_, i) => {
    const t = (i + 1) / Math.max(1, Math.ceil(length / 4));
    return { x: start.x + (goal.x - start.x) * t, y: start.y + (goal.y - start.y) * t };
  });
  if (straight.every(p => clearCompanionPoint(p, blocks))) return [goal];
  // Local grid limits per-frame work, while leaving room to walk around buildings.
  const x0 = Math.floor((Math.min(start.x, goal.x) - 128) / CELL) * CELL;
  const y0 = Math.floor((Math.min(start.y, goal.y) - 128) / CELL) * CELL;
  const w = Math.min(180, Math.ceil((Math.abs(start.x - goal.x) + 256) / CELL));
  const h = Math.min(180, Math.ceil((Math.abs(start.y - goal.y) + 256) / CELL));
  const grid = new PF.Grid(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = { x: x0 + x * CELL, y: y0 + y * CELL };
    if (p.x < MAP.x + 8 || p.x > MAP.x + MAP.w - 8 || p.y < MAP.y + 8 || p.y > MAP.y + MAP.h - 16) grid.setWalkableAt(x, y, false);
  }
  for (const b of blocks) {
    const left = Math.max(0, Math.floor((b.x - 7 - x0) / CELL));
    const right = Math.min(w - 1, Math.ceil((b.x + b.width + 7 - x0) / CELL));
    const top = Math.max(0, Math.floor((b.y - 15 - y0) / CELL));
    const bottom = Math.min(h - 1, Math.ceil((b.y + b.height - 5 - y0) / CELL));
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) grid.setWalkableAt(x, y, false);
  }
  const sx = Math.round((start.x - x0) / CELL), sy = Math.round((start.y - y0) / CELL);
  const gx = Math.round((goal.x - x0) / CELL), gy = Math.round((goal.y - y0) / CELL);
  if (!grid.isInside(sx, sy) || !grid.isInside(gx, gy)) return [];
  grid.setWalkableAt(sx, sy, true);
  // Formation slots may land inside a tree; choose the nearest accessible cell.
  let end: [number, number] | undefined;
  for (let r = 0; r <= 8 && !end; r++) for (let y = gy - r; y <= gy + r && !end; y++) for (let x = gx - r; x <= gx + r; x++) {
    if (grid.isWalkableAt(x, y)) { end = [x, y]; break; }
  }
  if (!end) return [];
  return finder.findPath(sx, sy, end[0], end[1], grid).slice(1).flatMap(([x, y]) => x === undefined || y === undefined ? [] : [{ x: x0 + x * CELL, y: y0 + y * CELL }]);
}

export class CompanionMovement {
  private routes = new Map<string, Route>();
  reset(id: string) { this.routes.delete(id); }
  tick(actors: CompanionActor[], orders: Map<string, CompanionOrder>, player: Pt, facing: number, time: number,
    stopped: boolean, sprinting: boolean, crouching: boolean, blocks: Block[]) {
    const following = actors.filter(a => orders.get(a.id)?.mode === 'follow').sort((a, b) => a.id.localeCompare(b.id));
    for (const actor of actors) {
      const order = orders.get(actor.id); if (!order) continue;
      const s = actor.sprite;
      const idle = () => { s.setVelocity(0, 0); s.anims.stop(); s.setTexture(actor.texture, actor.facing); };
      if (stopped) { idle(); continue; }
      const goal = order.mode === 'follow' ? formationSlot(following.indexOf(actor), player, facing) : order.mode === 'return' ? actor.home : order;
      const distance = Math.hypot(goal.x - s.x, goal.y - s.y);
      if (distance < (order.mode === 'follow' ? 10 : 5)) {
        idle(); if (order.mode === 'return') { orders.delete(actor.id); this.reset(actor.id); }
        continue;
      }
      let route = this.routes.get(actor.id);
      if (!route || time >= route.next || Math.hypot(route.goal.x - goal.x, route.goal.y - goal.y) > 32) {
        route = { points: findCompanionPath(s, goal, blocks), next: time + 700, goal: { ...goal } }; this.routes.set(actor.id, route);
      }
      while (route.points[0] && Math.hypot(route.points[0].x - s.x, route.points[0].y - s.y) < 5) route.points.shift();
      const next = route.points[0]; if (!next) { idle(); continue; }
      const sep = separation(s, actors.filter(a => a !== actor).map(a => a.sprite), 26);
      let dx = next.x - s.x + sep.x * 12, dy = next.y - s.y + sep.y * 12;
      const len = Math.hypot(dx, dy); if (len < 1) { idle(); continue; }
      dx /= len; dy /= len;
      const speed = order.mode === 'follow' ? companionSpeed(sprinting, crouching, distance) : 65;
      s.setVelocity(dx * speed, dy * speed);
      const direction = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      actor.face(direction); s.play(`${actor.texture}-walk-${direction}`, true); s.anims.timeScale = crouching ? 0.6 : sprinting ? 1.4 : 1;
      s.setDepth(s.y);
    }
  }
}