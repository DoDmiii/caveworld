import { describe, it, expect } from 'vitest';
import { furnishHut, hutOptions, roomFloor, roomWalkable, hutSpawn, hutExit, leavesHut, hutDoorAt, doorLane, footprint, styleOf, ROOM_CENTER, ROOMS, type HutStyle } from '@/game/interiors';
import { FLAMMABLE_HOUSES } from '@/game/fire-art';

const STYLES: HutStyle[] = ['wenja', 'nordic', 'dragon'];
const roomOf = (id: string) => { const h = FLAMMABLE_HOUSES.find(h => h.id === id)!; const st = styleOf(h.owner); return { h, st, items: furnishHut(h.id, st, hutOptions(h.id, h.owner, h.owner === 'nordic')) }; };

describe('hut rooms', () => {
  it('every style has a closed room with a south door', () => {
    for (const s of STYLES) {
      expect(roomFloor(s, ROOM_CENTER.x, ROOM_CENTER.y)).toBe(true);
      expect(roomFloor(s, ROOM_CENTER.x, ROOM_CENTER.y - ROOMS[s].ry - 4)).toBe(false);
      expect(roomFloor(s, ROOM_CENTER.x - ROOMS[s].rx - 4, ROOM_CENTER.y)).toBe(false);
      expect(roomFloor(s, ROOM_CENTER.x, ROOM_CENTER.y + ROOMS[s].ry + 10)).toBe(true);
      expect(roomFloor(s, ROOM_CENTER.x + 40, ROOM_CENTER.y + ROOMS[s].ry + 10)).toBe(false);
      expect(roomWalkable(s, hutSpawn(s).x, hutSpawn(s).y)).toBe(true);
      expect(leavesHut(s, hutSpawn(s).x, hutSpawn(s).y)).toBe(false);
      expect(leavesHut(s, hutExit(s).x, hutExit(s).y)).toBe(true);
    }
  });
  it('finds the hut whose door the player stands at', () => {
    const huts = [{ id: 'a', x: 100, y: 100 }, { id: 'b', x: 300, y: 100 }];
    expect(hutDoorAt(huts, 100, 128)?.id).toBe('a');
    expect(hutDoorAt(huts, 300, 130)?.id).toBe('b');
    expect(hutDoorAt(huts, 200, 128)).toBeUndefined();
  });
});

describe('furnishing', () => {
  it('every hut gets one hearth, its beds, and never blocks the door lane', () => {
    for (const h of FLAMMABLE_HOUSES) {
      const { st, items } = roomOf(h.id);
      const opts = hutOptions(h.id, h.owner, h.owner === 'nordic');
      expect(items.filter(i => i.kind === 'hearth')).toHaveLength(1);
      expect(items.filter(i => i.kind === 'bed').length).toBe(opts.beds);
      const lane = doorLane(st);
      for (const i of items) {
        const l = i.x - i.w / 2, r = i.x + i.w / 2, t = i.y - i.h;
        expect(l < lane.r && lane.l < r && t < lane.b && lane.t < i.y).toBe(false);
        expect(roomFloor(st, i.x, i.y - 1)).toBe(true);
      }
    }
  });
  it('pieces never overlap each other', () => {
    for (const h of FLAMMABLE_HOUSES) {
      const { items } = roomOf(h.id);
      for (const a of items) for (const b of items) if (a !== b) {
        const hit = a.x - a.w / 2 < b.x + b.w / 2 && b.x - b.w / 2 < a.x + a.w / 2 && a.y - a.h < b.y && b.y - b.h < a.y;
        expect(hit).toBe(false);
      }
    }
  });
  it('Nordic huts always hold exactly one lootable supply basket; others none', () => {
    for (const h of FLAMMABLE_HOUSES) {
      const { items } = roomOf(h.id);
      expect(items.filter(i => i.stash).length).toBe(h.owner === 'nordic' ? 1 : 0);
    }
  });
  it('same hut, same room; different huts differ', () => {
    const [a, b] = FLAMMABLE_HOUSES.filter(h => h.owner === 'nordic');
    expect(roomOf(a!.id).items).toEqual(roomOf(a!.id).items);
    expect(JSON.stringify(roomOf(a!.id).items.map(i => [i.frame, i.x, i.y]))).not.toBe(JSON.stringify(roomOf(b!.id).items.map(i => [i.frame, i.x, i.y])));
  });
  it('the player can walk from the door to the hearth', () => {
    for (const h of FLAMMABLE_HOUSES) {
      const { st, items } = roomOf(h.id);
      const hearth = items.find(i => i.kind === 'hearth')!, blocks = items.map(footprint);
      const free = (x: number, y: number) => roomWalkable(st, x, y) && !blocks.some(b => Math.abs(x - b.x) < b.w / 2 + 5 && y + 14 > b.y - b.h / 2 && y + 7 < b.y + b.h / 2);
      const s = hutSpawn(st);
      for (let y = s.y; y > hearth.y + 4; y -= 2) expect(free(s.x, y)).toBe(true);
    }
  });
});
