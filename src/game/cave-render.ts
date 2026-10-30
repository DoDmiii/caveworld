import * as Phaser from 'phaser';
import { CAVE_SIZE, TILE, CAVE_EXIT, PAINT_WALL, caveFloor, caveDeposits, type CaveState, type CaveId } from './caves';

/** Pixel cave renderer: no outdoor assets, actors or physics are recreated on entry. */
export function renderCave(scene: Phaser.Scene, id: CaveId, state: CaveState) {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const walls = scene.physics.add.staticGroup();
  const g = scene.add.graphics().setDepth(50000); objects.push(g);
  const stone = id === 'ice' ? [0x35444b, 0x52646b, 0x6d8287] : [0x302e2d, 0x49443d, 0x60594b];
  g.fillStyle(0x111211).fillRect(0, 0, CAVE_SIZE, CAVE_SIZE);
  for (let y = 0; y < CAVE_SIZE; y += TILE) for (let x = 0; x < CAVE_SIZE; x += TILE) {
    const floor = caveFloor(x + 8, y + 8), n = (x * 7 + y * 13) % 5;
    g.fillStyle(floor ? (id === 'ice' ? 0x66787a : 0x625849) : stone[n % 3] ?? 0x302e2d).fillRect(x, y, TILE, TILE);
    g.fillStyle(floor ? 0x49463e : 0x222323, floor ? 0.4 : 0.65).fillRect(x + n + 2, y + 5, 5, 2);
    if (!floor) {
      const z = scene.add.zone(x + 8, y + 8, TILE, TILE); scene.physics.add.existing(z, true); walls.add(z); objects.push(z);
      if (caveFloor(x + 8, y + 24)) { g.fillStyle(stone[2] ?? 0x60594b).fillRect(x, y, TILE, 3); g.fillStyle(0x151817).fillRect(x, y + 12, TILE, 4); }
    } else if (n === 1) g.fillStyle(id === 'ice' ? 0xa2bbbe : 0x82745c, 0.4).fillRect(x + 5, y + 9, 2, 2);
  }
  const ore = new Map<string, Phaser.GameObjects.Graphics>();
  for (const d of caveDeposits(id)) {
    if (state.mined.includes(d.id)) continue;
    const o = scene.add.graphics().setDepth(50010); objects.push(o); ore.set(d.id, o);
    o.fillStyle(0x262626).fillRect(d.x - 12, d.y - 8, 24, 17);
    for (let i = 0; i < 5; i++) { const x = d.x - 10 + i * 4, y = d.y - 9 + i % 2 * 5; o.fillStyle(d.kind === 'obsidian' ? 0x171d25 : 0xa55e36).fillRect(x, y, 5, 10); o.fillStyle(d.kind === 'obsidian' ? 0x7ca6b8 : 0xe4a453).fillRect(x, y, 2, 5); }
  }
  g.fillStyle(0x0a0b0a).fillRect(288, 112, 64, 12);
  g.lineStyle(2, 0xbc9366).strokeRect(PAINT_WALL.x - 34, PAINT_WALL.y - 10, 68, 12);
  const murals = scene.add.graphics().setDepth(50012); objects.push(murals);
  const drawPaintings = () => {
    murals.clear();
    state.paintings.forEach((id, i) => {
      const x = 296 + i * 23, y = 120;
      murals.lineStyle(2, id === 'mammoth' ? 0xbc5b39 : id === 'gazelle' ? 0xdda954 : 0xbba382);
      murals.strokeEllipse(x, y, 16, 7); murals.lineBetween(x - 5, y + 2, x - 7, y + 7); murals.lineBetween(x + 5, y + 2, x + 7, y + 7);
      murals.lineBetween(x + 7, y, x + 10, y - 5);
      if (id === 'mammoth') murals.lineBetween(x + 10, y - 5, x + 12, y + 6);
      if (id === 'gazelle') { murals.lineBetween(x + 10, y - 5, x + 7, y - 10); murals.strokeCircle(x - 8, y - 6, 3); }
      if (id === 'lion') murals.strokeCircle(x + 8, y - 2, 5);
    });
  };
  drawPaintings();
  const exit = scene.add.text(CAVE_EXIT.x, CAVE_EXIT.y, '▼', { fontSize: '14px', color: '#dcc7a0' }).setOrigin(0.5).setDepth(50020); objects.push(exit);
  const buildObjects: Phaser.GameObjects.GameObject[] = [];
  const drawBuilds = () => {
    buildObjects.forEach(o => o.destroy()); buildObjects.length = 0;
    for (const b of state.builds[id] ?? []) {
      const o = scene.add.image(b.x, b.y, b.kind === 'fire' ? 'fire' : 'shelter-2').setDepth(60000 + b.y); buildObjects.push(o);
    }
  };
  drawBuilds();
  return { walls, ore, refresh(next: CaveState) { state = next; drawPaintings(); drawBuilds(); }, destroy() { buildObjects.forEach(o => o.destroy()); objects.forEach(o => o.destroy()); walls.destroy(true); } };
}