import * as Phaser from 'phaser';
import atlas from '@/assets/interior/hut-furniture-atlas.png.asset.json';
import { POCKET, ROOM_CENTER, ROOMS, DOOR_HALF, FURNITURE_FRAMES, inRoomShape, roomFloor, hutExit, footprint, type HutStyle, type Furnishing } from './interiors';

/** Packed furniture sprites uploaded by the player (hearths, beds, cradles, baskets, pots). */
export const FURNITURE_ATLAS = { key: 'hut-furniture', url: atlas.url };

type Pal = { floor: number[]; fleck: number; seam: number; face: number[]; faceDark: number; rim: number; trim: number };
const PALETTE: Record<HutStyle, Pal> = {
  // Wenja: trampled clay with straw, hide walls on mammoth-bone arches.
  wenja: { floor: [0x6e5139, 0x664a33, 0x765840, 0x5f452f], fleck: 0xa98a52, seam: 0x4a3524, face: [0x7c5a3a, 0x86633f, 0x6f5034], faceDark: 0x3b2a1b, rim: 0x4b3423, trim: 0xd8ccb0 },
  // Nordic: spruce planks, horizontal log walls.
  nordic: { floor: [0x7b5a38, 0x70512f, 0x84613d, 0x6a4b2c], fleck: 0x94704a, seam: 0x3c2817, face: [0x5e4024, 0x6b4a2b, 0x53381f], faceDark: 0x2a1a0e, rim: 0x3a2716, trim: 0x9c7a52 },
  // Dragon people: slate flagstones, reed mat, stacked slate walls.
  dragon: { floor: [0x535a5e, 0x4b5256, 0x5c6367, 0x474d51], fleck: 0x9a8a58, seam: 0x2c3134, face: [0x434a4e, 0x4d5458, 0x3c4246], faceDark: 0x1c2022, rim: 0x2e3336, trim: 0x8a9499 },
};
const n2 = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) % 1000; };

function floorColor(style: HutStyle, p: Pal, x: number, y: number) {
  const dx = x - ROOM_CENTER.x, dy = y - ROOM_CENTER.y;
  if (style === 'nordic') {
    const row = Math.floor(y / 9), off = (x + row * 37) % 52;
    if (y % 9 === 0 || off < 1) return p.seam;
    const c = p.floor[(row + Math.floor((x + row * 37) / 52)) % p.floor.length]!;
    return n2(x, y) < 25 ? p.fleck : c;
  }
  if (style === 'dragon') {
    if (Math.abs(dx) < 54 && Math.abs(dy + 4) < 32) {
      if (Math.abs(dx) > 51 || Math.abs(dy + 4) > 29) return 0x5d4e2c;
      return y % 4 === 0 ? 0x7f6f42 : (x + (y >> 2)) % 6 < 3 ? 0x9b8a55 : 0x8e7d4b;
    }
    const tx = Math.floor((x + (Math.floor(y / 14) % 2) * 8) / 16), ty = Math.floor(y / 14);
    if ((x + (ty % 2) * 8) % 16 === 0 || y % 14 === 0) return p.seam;
    return p.floor[n2(tx, ty) % p.floor.length]!;
  }
  const v = n2(x >> 2, y >> 2) % p.floor.length;
  const s = n2(x, y);
  return s < 18 ? p.fleck : s < 40 ? p.seam : p.floor[v]!;
}
function faceColor(style: HutStyle, p: Pal, x: number, y: number, depth: number) {
  // depth: 0 at the floor line, grows upwards along the north wall face.
  if (style === 'nordic') { const band = Math.floor(depth / 6); if (depth % 6 === 0) return p.faceDark; return p.face[band % p.face.length]!; }
  if (style === 'dragon') { const row = Math.floor(depth / 7), bx = (x + (row % 2) * 6) % 12; if (depth % 7 === 0 || bx === 0) return p.faceDark; return p.face[n2(Math.floor((x + (row % 2) * 6) / 12), row) % p.face.length]!; }
  // Wenja: hide panels with seams and pale bone ribs.
  if (x % 26 < 2 && depth > 2) return p.trim;
  if (x % 26 === 13) return p.faceDark;
  return p.face[(Math.floor(x / 26) + (depth > 10 ? 1 : 0)) % p.face.length]!;
}

/** Draws one hut interior into the pocket space: black void, floor, walls, door and furniture. */
export function renderHut(scene: Phaser.Scene, key: string, style: HutStyle, items: Furnishing[], looted: boolean) {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const walls = scene.physics.add.staticGroup();
  const pal = PALETTE[style], { ry } = ROOMS[style];
  const void_ = scene.add.graphics().setDepth(49990); void_.fillStyle(0x000000).fillRect(-2000, -2000, POCKET.w + 4000, POCKET.h + 4000); objects.push(void_);
  const texKey = `hut-room-${key}`;
  if (scene.textures.exists(texKey)) scene.textures.remove(texKey);
  const canvas = scene.textures.createCanvas(texKey, POCKET.w, POCKET.h)!;
  const ctx = canvas.context, img = ctx.createImageData(POCKET.w, POCKET.h), d = img.data;
  const put = (x: number, y: number, c: number, shade = 1) => { const i = (y * POCKET.w + x) * 4; d[i] = ((c >> 16) & 255) * shade; d[i + 1] = ((c >> 8) & 255) * shade; d[i + 2] = (c & 255) * shade; d[i + 3] = 255; };
  const doorBottom = ROOM_CENTER.y + ry + 22;
  for (let y = 0; y < POCKET.h; y++) for (let x = 0; x < POCKET.w; x++) {
    if (roomFloor(style, x, y)) {
      let shade = 1;
      if (!inRoomShape(style, x, y - 10)) shade = 0.62; else if (!inRoomShape(style, x, y - 18)) shade = 0.8;  // shadow under the north wall
      else if (!inRoomShape(style, x, y, -3)) shade = 0.75;
      if (y > ROOM_CENTER.y + ry - 2) shade *= Math.max(0, 1 - (y - (ROOM_CENTER.y + ry - 2)) / 24);  // doorway fades into the night
      if (shade > 0.02) put(x, y, floorColor(style, pal, x, y), shade);
      continue;
    }
    // North wall face: the floor line seen from above, standing 22 px tall.
    if (y < ROOM_CENTER.y + 10) {
      let depth = -1;
      for (let k = 1; k <= 22; k++) if (inRoomShape(style, x, y + k)) { depth = k; break; }
      if (depth > 0) { put(x, y, faceColor(style, pal, x, y, 22 - depth), 0.55 + 0.45 * (1 - depth / 22)); continue; }
    }
    // Rim around sides and south (wall top seen from above).
    if (inRoomShape(style, x, y, 7) && !(Math.abs(x - ROOM_CENTER.x) <= DOOR_HALF && y > ROOM_CENTER.y && y <= doorBottom)) {
      const edge = inRoomShape(style, x, y, 3);
      put(x, y, edge ? pal.rim : pal.faceDark, n2(x, y) < 120 ? 0.85 : 1);
      continue;
    }
    if (y < ROOM_CENTER.y && inRoomShape(style, x, y + 24, 5)) put(x, y, pal.faceDark, 0.8);  // wall crown
  }
  // Door posts.
  for (const sx of [-1, 1]) for (let y = ROOM_CENTER.y + ry - 6; y < ROOM_CENTER.y + ry + 8; y++) for (let k = 0; k < 3; k++) {
    const x = ROOM_CENTER.x + sx * (DOOR_HALF + 1 + k); if (x >= 0 && x < POCKET.w && y >= 0 && y < POCKET.h) put(x, y, k === 1 ? pal.trim : pal.rim);
  }
  ctx.putImageData(img, 0, 0); canvas.refresh();
  const room = scene.add.image(0, 0, texKey).setOrigin(0, 0).setDepth(50000); objects.push(room);
  // Wall collision: 8 px cells that are not floor but touch the floor.
  const T = 8;
  for (let y = 0; y < POCKET.h; y += T) for (let x = 0; x < POCKET.w; x += T) {
    const cx = x + T / 2, cy = y + T / 2;
    if (roomFloor(style, cx, cy)) continue;
    let touch = false;
    for (const [ox, oy] of [[-T, 0], [T, 0], [0, -T], [0, T], [-T, -T], [T, T], [-T, T], [T, -T], [-2 * T, 0], [2 * T, 0], [0, -2 * T], [0, 2 * T]]) if (roomFloor(style, cx + ox!, cy + oy!)) { touch = true; break; }
    if (!touch || cy > doorBottom - 2) continue;
    const z = scene.add.zone(cx, cy, T, T); scene.physics.add.existing(z, true); walls.add(z); objects.push(z);
  }
  // Furniture.
  const tex = scene.textures.get(FURNITURE_ATLAS.key);
  for (const f of FURNITURE_FRAMES) if (!tex.has(f.id)) tex.add(f.id, 0, f.x, f.y, f.w, f.h);
  const sprites = new Map<string, Phaser.GameObjects.Image>();
  for (const it of items) {
    const o = scene.add.image(it.x, it.y, FURNITURE_ATLAS.key, it.frame).setOrigin(0.5, 1).setFlipX(it.flip).setDepth(60000 + it.y - (it.kind === 'bed' ? 10 : 0));
    if (it.stash && looted) o.setTint(0x8f8a84);
    sprites.set(it.id, o); objects.push(o);
    const fp = footprint(it); const z = scene.add.zone(fp.x, fp.y, fp.w, fp.h); scene.physics.add.existing(z, true); walls.add(z); objects.push(z);
    if (it.kind === 'hearth') {
      const glow = scene.add.image(it.x, it.y - 8, 'glow').setDepth(60000 + it.y + 1).setBlendMode(Phaser.BlendModes.ADD).setScale(0.55).setAlpha(0.7);
      scene.tweens.add({ targets: glow, alpha: { from: 0.55, to: 0.85 }, scale: { from: 0.5, to: 0.6 }, duration: 240, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      objects.push(glow);
    }
  }
  const ex = hutExit(style);
  const exit = scene.add.text(ex.x, ex.y + 4, '▼', { fontSize: '12px', color: '#dcc7a0' }).setOrigin(0.5).setDepth(50020).setAlpha(0.8); objects.push(exit);
  return {
    walls, sprites,
    markLooted(id: string) { sprites.get(id)?.setTint(0x8f8a84); },
    destroy() { objects.forEach(o => { scene.tweens.killTweensOf(o); o.destroy(); }); walls.destroy(true); if (scene.textures.exists(texKey)) scene.textures.remove(texKey); },
  };
}
