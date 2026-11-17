import { describe, it, expect } from 'vitest';
import { OSHKORA_HOUSES, OSHKORA_FENCES, OSHKORA_BOUNDS, OSHKORA_TEXTURES, OSHKORA_FIELDS, pieceBody, oshkoraAt, oshkoraGround } from './oshkora';
import { OSHKORA } from './biomes';
import { FLAMMABLE_HOUSES, RUIN_TEXTURES, ruinKey } from './fire-art';
import { thornbushes } from './desert-flora';
import { WATERHOLES } from './desert';

const PLAYER_HALF_W = 5, PLAYER_HALF_H = 4, CELL = 2;
/** Flood-fills walkable space from the village centre; `extra` adds blocking rectangles (absolute). */
function escapes(extra: { l: number; r: number; t: number; b: number }[]) {
  const bodies = [...[...OSHKORA_HOUSES, ...OSHKORA_FENCES].map(pieceBody), ...extra];
  const { half, top, bottom } = OSHKORA_BOUNDS;
  const x0 = OSHKORA.x - half - 60, x1 = OSHKORA.x + half + 60, y0 = OSHKORA.y + top - 80, y1 = OSHKORA.y + bottom + 60;
  const w = Math.ceil((x1 - x0) / CELL), h = Math.ceil((y1 - y0) / CELL);
  const blocked = (i: number, j: number) => { const x = x0 + i * CELL, y = y0 + j * CELL; return bodies.some(b => x > b.l - PLAYER_HALF_W && x < b.r + PLAYER_HALF_W && y > b.t - PLAYER_HALF_H && y < b.b + PLAYER_HALF_H); };
  const seen = new Uint8Array(w * h), stack = [[Math.floor((OSHKORA.x + 100 - x0) / CELL), Math.floor((OSHKORA.y - y0) / CELL)]];
  while (stack.length) {
    const [i, j] = stack.pop()!;
    if (i! < 0 || j! < 0 || i! >= w || j! >= h) return true;
    const k = j! * w + i!; if (seen[k] || blocked(i!, j!)) continue; seen[k] = 1;
    stack.push([i! + 1, j!], [i! - 1, j!], [i!, j! + 1], [i!, j! - 1]);
  }
  return false;
}

describe('Oshkora kraal', () => {
  it('has eight huts with stable IDs that burn into their own ruins', () => {
    expect(OSHKORA_HOUSES).toHaveLength(8);
    expect(new Set(OSHKORA_HOUSES.map(h => h.id)).size).toBe(8);
    const burnable = FLAMMABLE_HOUSES.filter(h => h.owner === 'desert');
    expect(burnable.map(h => h.id)).toEqual(OSHKORA_HOUSES.map(h => h.id));
    for (const h of burnable) { expect(OSHKORA_TEXTURES[h.key]).toBeTruthy(); expect(RUIN_TEXTURES[ruinKey(h.key)]).toBeTruthy(); }
  });
  it('is open through the north and south gates', () => {
    expect(escapes([])).toBe(true);
  });
  it('huts, fences and thorn hedges leave no other way out', () => {
    const { top, bottom } = OSHKORA_BOUNDS, g = 40;
    const gates = [
      { l: OSHKORA.x - g, r: OSHKORA.x + g, t: OSHKORA.y + top - 30, b: OSHKORA.y + top + 30 },
      { l: OSHKORA.x - g, r: OSHKORA.x + g, t: OSHKORA.y + bottom - 20, b: OSHKORA.y + bottom + 40 },
    ];
    expect(escapes(gates)).toBe(false);
  });
  it('the Ockerquelle lies inside the kraal and no piece stands in the water', () => {
    const w = WATERHOLES.find(w => w.name === 'Ockerquelle')!;
    expect(oshkoraAt(w.x, w.y)).toBe(true);
    for (const pc of [...OSHKORA_HOUSES, ...OSHKORA_FENCES]) expect(Math.hypot(pc.x - w.x, pc.y - w.y)).toBeGreaterThan(w.r + 60);
  });
  it('wild thornbushes never grow inside the village or on its fields', () => {
    expect(thornbushes().some(b => oshkoraAt(b.x, b.y))).toBe(false);
  });
  it('fields are painted as furrows', () => {
    for (const f of OSHKORA_FIELDS) expect(oshkoraGround(f.x + f.w / 2, f.y + f.h / 2)).not.toBeNull();
    expect(oshkoraGround(OSHKORA.x + 1000, OSHKORA.y)).toBeNull();
  });
});
