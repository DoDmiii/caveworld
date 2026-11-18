// Canvas art for the Drachenterrasse grounds: slate plaza, terraced rice paddies, canals,
// stepping stones, the fishing pier and fish traps, plus small upright props. No Phaser imports.
import {
  DRAGON_PLAZA, DRAGON_GROUND_BOX, DRAGON_STEPPING_STONES, DRAGON_PIER, DRAGON_FISH_TRAPS, CANAL_HALF,
  dragonPaddyAt, canalDist, pathDist, type DragonProp,
} from './dragon';

const hash = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) % 100; };
const rgb = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] as const;

const SLATE = ['#5d666b', '#535b60', '#646d71', '#4c5458'].map(rgb);
const SEAM = rgb('#2a2f32'), LICHEN = rgb('#7d8a5a');
const WATER = [rgb('#4d6f68'), rgb('#557870')], SHEEN = rgb('#8fb4ac');
const DIKE_TOP = rgb('#8a7a58'), DIKE = rgb('#6e5e44'), FACE = rgb('#43392b'), FACE_LO = rgb('#382f24');
const STEM = rgb('#5f8f3a'), TIP = rgb('#a6c862'), BASE = rgb('#4a7232'), RIPE = rgb('#d2bb5c'), RIPE_STEM = rgb('#a89a48');
const CANAL = rgb('#4f8a92'), CANAL_DEEP = rgb('#3f6f78'), BANK = rgb('#5a4a36'), PLANK = [rgb('#8a6a44'), rgb('#7a5c3a')], PLANK_SEAM = rgb('#4a3424');

/** Paints all flat village ground into a canvas whose top-left is DRAGON_GROUND_BOX. */
export function paintDragonGround(c: CanvasRenderingContext2D) {
  const { x: ox, y: oy, w, h } = DRAGON_GROUND_BOX;
  const img = c.createImageData(w, h), d = img.data;
  const ids = new Int32Array(w * h).fill(-1), band = new Int16Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const p = dragonPaddyAt(ox + i, oy + j);
    if (p) { ids[j * w + i] = p.id; band[j * w + i] = p.band; }
  }
  const idAt = (i: number, j: number) => (i < 0 || j < 0 || i >= w || j >= h ? -1 : ids[j * w + i]!);
  const put = (i: number, j: number, col: readonly number[], a = 255) => { const o = (j * w + i) * 4; d[o] = col[0]!; d[o + 1] = col[1]!; d[o + 2] = col[2]!; d[o + 3] = a; };

  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = ox + i, y = oy + j;
    // Slate plaza: staggered flagstones with dark seams and a ragged edge.
    const k = ((x - DRAGON_PLAZA.x) / DRAGON_PLAZA.rx) ** 2 + ((y - DRAGON_PLAZA.y) / DRAGON_PLAZA.ry) ** 2;
    if (k < 1) {
      const row = Math.floor((y + 400) / 8), off = (row * 5) % 11, sx = Math.floor((x + off) / 11);
      if (k > 0.78 && hash(sx, row) < 35) { /* missing edge stone */ }
      else if ((y + 400) % 8 === 0 || (x + off) % 11 === 0) put(i, j, SEAM);
      else put(i, j, hash(x, y) < 3 ? LICHEN : SLATE[hash(sx, row) % SLATE.length]!);
      continue;
    }
    // Canals with plank crossings where a path meets them.
    const cd = canalDist(x, y);
    if (cd < CANAL_HALF + 1.5) {
      if (pathDist(x, y) < 12) put(i, j, (y % 3 === 0) ? PLANK_SEAM : PLANK[Math.floor(x / 4) % 2]!);
      else if (cd < CANAL_HALF - 1) put(i, j, hash(x >> 1, y) < 6 ? SHEEN : CANAL);
      else if (cd < CANAL_HALF) put(i, j, CANAL_DEEP);
      else put(i, j, BANK);
      continue;
    }
    const id = ids[j * w + i]!;
    if (id < 0) continue;
    // Paddy beds: dikes around each bed, a shaded step face below upper bands, water and rice rows.
    const up = idAt(i, j - 2) !== id, down = idAt(i, j + 2) !== id, side = idAt(i - 2, j) !== id || idAt(i + 2, j) !== id;
    if (up || down || side) { put(i, j, up ? DIKE_TOP : DIKE); continue; }
    if (band[j * w + i]! > 0 && (idAt(i, j - 5) !== id)) { put(i, j, idAt(i, j - 4) !== id ? FACE : FACE_LO); continue; }
    const stage = (id * 7) % 3, sp = stage === 0 ? 8 : stage === 1 ? 6 : 5, ripe = stage === 2;
    const ry = j % 5, row = Math.floor(j / 5), rx = (i + (row % 2) * 3) % sp;
    const tuft = (rx === 0 && ry >= 1 && ry <= 3) || ((rx === 1 || rx === sp - 1) && ry === 1);
    if (tuft) put(i, j, ry === 1 ? (ripe ? RIPE : TIP) : ry === 3 ? BASE : ripe ? RIPE_STEM : STEM);
    else put(i, j, hash(x >> 1, y) < 4 || (x + y * 3) % 29 === 0 ? SHEEN : WATER[hash(x >> 2, y >> 1) % 2]!);
  }
  c.putImageData(img, 0, 0);

  const rect = (col: string, x: number, y: number, rw: number, rh: number) => { c.fillStyle = col; c.fillRect(Math.round(x - ox), Math.round(y - oy), rw, rh); };
  // Stepping stones across the stream.
  for (const [x, y] of DRAGON_STEPPING_STONES) { rect('#3e4a42', x - 5, y - 3, 11, 8); rect('#9a9c90', x - 4, y - 4, 9, 6); rect('#b8b9ad', x - 2, y - 4, 4, 2); }
  // Plank pier: posts, planks and a shadow on the water.
  const pr = DRAGON_PIER;
  rect('rgba(0,0,0,0.25)', pr.x - pr.w / 2 + 2, pr.y + 2, pr.w, pr.h);
  for (let k = 0; k < pr.h; k += 3) { rect(k % 6 ? '#7a5c3a' : '#8a6a44', pr.x - pr.w / 2, pr.y + k, pr.w, 2); rect('#4a3424', pr.x - pr.w / 2, pr.y + k + 2, pr.w, 1); }
  for (const [px, py] of [[-pr.w / 2 - 1, 4], [pr.w / 2 - 1, 4], [-pr.w / 2 - 1, pr.h - 3], [pr.w / 2 - 1, pr.h - 3]] as const) rect('#3b2a1b', pr.x + px, pr.y + py, 2, 4);
  // Woven fish traps lying in the water.
  for (const [x, y] of DRAGON_FISH_TRAPS) {
    rect('rgba(0,0,0,0.25)', x - 5, y - 1, 12, 5);
    for (let k = 0; k < 11; k++) { const hh = Math.max(1, 5 - Math.abs(k - 4)); rect(k % 2 ? '#a88a52' : '#8c6e3e', x - 6 + k, y - 2 - Math.floor(hh / 2), 1, hh); }
    rect('#2e2416', x - 6, y - 2, 1, 3); rect('#c8a868', x - 3, y - 3, 1, 1); rect('#c8a868', x + 1, y - 4, 1, 1);
  }
}

type Art = { w: number; h: number; draw: (c: CanvasRenderingContext2D) => void };
const px = (c: CanvasRenderingContext2D, col: string, x: number, y: number, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const sheaf = (c: CanvasRenderingContext2D, x: number, y: number, hh: number) => {
  px(c, '#b0923e', x, y - hh + 3, 4, hh - 3); px(c, '#d0b45a', x + 1, y - hh + 3, 2, hh - 3);
  px(c, '#e2cc70', x - 1, y - hh, 6, 3); px(c, '#c8ae52', x, y - hh - 1, 1, 1); px(c, '#c8ae52', x + 3, y - hh - 1, 1, 1);
  px(c, '#6e4e2a', x, y - Math.floor(hh / 2), 4, 1);
};

/** Small upright props, drawn once into canvas textures (origin bottom-centre). */
export const DRAGON_PROP_ART: Record<DragonProp['key'], Art> = {
  'dragon-scarecrow': { w: 16, h: 26, draw: c => {
    px(c, 'rgba(0,0,0,0.25)', 4, 24, 8, 2);
    px(c, '#6e5a3c', 7, 6, 2, 19); px(c, '#7a6442', 1, 10, 14, 2);
    px(c, '#a8402e', 1, 12, 1, 3); px(c, '#a8402e', 14, 12, 1, 3);
    for (let y = 12; y < 19; y++) { px(c, '#c8a85a', 4, y, 8, 1); if (y % 2) px(c, '#a88a42', 5 + (y % 3), y, 1, 1); }
    px(c, '#a88a42', 4, 19, 2, 2); px(c, '#a88a42', 10, 19, 2, 2);
    px(c, '#d8bc68', 6, 3, 4, 2); px(c, '#e4ca78', 7, 2, 2, 1); px(c, '#b0924a', 3, 5, 10, 2); px(c, '#8c7238', 3, 6, 10, 1);
  } },
  'dragon-sheaves': { w: 22, h: 16, draw: c => {
    px(c, 'rgba(0,0,0,0.25)', 2, 14, 18, 2);
    sheaf(c, 2, 15, 12); sheaf(c, 9, 15, 14); sheaf(c, 16, 15, 11);
  } },
  'dragon-rice-rack': { w: 30, h: 24, draw: c => {
    px(c, 'rgba(0,0,0,0.25)', 2, 22, 26, 2);
    px(c, '#5a4630', 2, 3, 2, 20); px(c, '#5a4630', 26, 3, 2, 20); px(c, '#6e5a3c', 1, 4, 28, 2); px(c, '#8a7450', 1, 4, 28, 1);
    for (let x = 6; x < 25; x += 5) { px(c, '#6e4e2a', x + 1, 6, 1, 2); px(c, '#c8ae52', x, 8, 3, 8); px(c, '#e2cc70', x, 8, 3, 2); px(c, '#a89040', x + 1, 12, 1, 4); px(c, '#d8c060', x - 1, 15, 5, 2); }
  } },
  'dragon-fish-rack': { w: 26, h: 22, draw: c => {
    px(c, 'rgba(0,0,0,0.25)', 2, 20, 22, 2);
    px(c, '#5a4630', 2, 3, 2, 18); px(c, '#5a4630', 22, 3, 2, 18); px(c, '#6e5a3c', 1, 4, 24, 2);
    for (let x = 6; x < 21; x += 5) { px(c, '#4a3a28', x + 1, 6, 1, 2); px(c, '#8a9aa0', x, 8, 3, 7); px(c, '#b4c2c6', x + 1, 9, 1, 4); px(c, '#5c6a70', x - 1, 15, 5, 2); }
  } },
};
