import type * as Phaser from 'phaser';
import w0 from '@/assets/nordic-people/nordic-w0.png.asset.json';
import w1 from '@/assets/nordic-people/nordic-w1.png.asset.json';
import w3 from '@/assets/nordic-people/nordic-w3.png.asset.json';
import m0 from '@/assets/nordic-people/nordic-m0.png.asset.json';
import m2 from '@/assets/nordic-people/nordic-m2.png.asset.json';
import { VILLAGES } from './biomes';
import { isCampDestination } from './tribe';
import type { Captive } from './captives';

// Atlas: 0–7 idle, then `walk` frames per direction; captives add 8 surrender + 8 bound frames.
// Only blond Nordic atlases (w0, w1, w3, m0, m2) may spawn in Nordic villages.
const T = [
  { id: 'nordic-w0', url: w0.url, walk: 6, captive: true, village: 0, dx: -40, dy: 10 },
  { id: 'nordic-m0', url: m0.url, walk: 6, captive: true, village: 0, dx: 50, dy: -20 },
  { id: 'nordic-w1', url: w1.url, walk: 6, captive: true, village: 0, dx: 10, dy: 50 },
  { id: 'nordic-m2-f', tex: 'nordic-m2', url: m2.url, walk: 6, captive: false, village: 0, dx: 0, dy: -90 },
  { id: 'nordic-w3', url: w3.url, walk: 6, captive: true, village: 2, dx: -20, dy: 20 },
  { id: 'nordic-m2', url: m2.url, walk: 6, captive: true, village: 2, dx: 30, dy: -10 },
  { id: 'nordic-w0-g', tex: 'nordic-w0', url: w0.url, walk: 6, captive: true, village: 1, dx: -60, dy: 30 },
  { id: 'nordic-m0-g', tex: 'nordic-m0', url: m0.url, walk: 6, captive: true, village: 1, dx: 50, dy: 40 },
  { id: 'nordic-w1-g', tex: 'nordic-w1', url: w1.url, walk: 6, captive: true, village: 1, dx: 0, dy: -10 },
  { id: 'nordic-w3-g', tex: 'nordic-w3', url: w3.url, walk: 6, captive: true, village: 1, dx: 20, dy: 10 },
  { id: 'nordic-m2-g', tex: 'nordic-m2', url: m2.url, walk: 6, captive: false, village: 1, dx: 0, dy: 80 },
  { id: 'nordic-m0-gw', tex: 'nordic-m0', url: m0.url, walk: 6, captive: false, village: 1, dx: -30, dy: -50 },
  { id: 'nordic-w1-e', tex: 'nordic-w1', url: w1.url, walk: 6, captive: true, village: 2, dx: 0, dy: 50 },
  { id: 'nordic-m0-e', tex: 'nordic-m0', url: m0.url, walk: 6, captive: true, village: 2, dx: -60, dy: -30 },
  { id: 'nordic-w0-e', tex: 'nordic-w0', url: w0.url, walk: 6, captive: true, village: 2, dx: 50, dy: 40 },
  { id: 'nordic-m2-e', tex: 'nordic-m2', url: m2.url, walk: 6, captive: false, village: 2, dx: 0, dy: -80 },
] as const;
export const NORDIC_FOLK = T.map(t => ({ ...t, tex: 'tex' in t ? t.tex : t.id, x: VILLAGES[t.village].x + t.dx, y: VILLAGES[t.village].y + t.dy }));
export type FolkTemplate = typeof NORDIC_FOLK[number];
const surrenderFrame = (t: FolkTemplate, f: number) => 8 + 8 * t.walk + f;
export const boundFrame = (t: FolkTemplate, f: number) => 16 + 8 * t.walk + f;

export type Folk = {
  sprite: Phaser.Physics.Arcade.Sprite; t: FolkTemplate; c: Captive;
  facing: number; next: number; until: number; tx: number; ty: number; seed: number;
};

export function preloadFolk(scene: Phaser.Scene) {
  for (const t of NORDIC_FOLK) if (t.tex === t.id) scene.load.spritesheet(t.tex, t.url, { frameWidth: 32, frameHeight: 32 });
}

export function createFolk(scene: Phaser.Scene, obstacles: Phaser.Physics.Arcade.StaticGroup): Folk[] {
  return NORDIC_FOLK.map((t, i) => {
    if (!scene.anims.exists(`${t.tex}-walk-0`)) for (let d = 0; d < 8; d++) {
      const s = 8 + d * t.walk;
      scene.anims.create({ key: `${t.tex}-walk-${d}`, frames: scene.anims.generateFrameNumbers(t.tex, { start: s, end: s + t.walk - 1 }), frameRate: 8, repeat: -1 });
    }
    const sprite = scene.physics.add.sprite(t.x, t.y, t.tex, 2).setSize(10, 7).setOffset(11, 23).setDepth(t.y).setPushable(false);
    scene.physics.add.collider(sprite, obstacles);
    return { sprite, t, c: { id: t.id, state: 'free', x: t.x, y: t.y }, facing: 2, next: scene.time.now + 800 + i * 300, until: 0, tx: t.x, ty: t.y, seed: 977 + i * 151 };
  });
}

/** Re-applies the visible pose after a state change. */
export function poseFolk(f: Folk) {
  const s = f.sprite; s.anims.stop(); s.setVelocity(0, 0);
  const body = s.body as Phaser.Physics.Arcade.Body;
  body.enable = f.c.state !== 'carried';
  s.setVisible(f.c.state !== 'carried');
  if (f.c.state === 'surrender') s.setFrame(surrenderFrame(f.t, f.facing));
  else if (f.c.state === 'bound') s.setFrame(boundFrame(f.t, 0));
  else s.setFrame(f.facing);
  if (f.c.state === 'bound' || f.c.state === 'camp') s.setPosition(f.c.x, f.c.y);
  s.setDepth(s.y);
}

export function tickFolk(folk: Folk[], obstacles: Phaser.Physics.Arcade.StaticGroup | undefined, time: number, stopped: boolean) {
  for (const f of folk) {
    if (f.c.state !== 'free' && f.c.state !== 'camp') continue;
    const s = f.sprite, v = VILLAGES[f.t.village];
    const home = f.c.state === 'camp'
      ? (x: number, y: number) => isCampDestination(x, y)
      : (x: number, y: number) => Math.hypot(x - v.x, y - v.y) < v.r * 0.6;
    const clear = (x: number, y: number) => home(x, y) && !obstacles?.getChildren().some(o => {
      const b = (o as Phaser.Physics.Arcade.Sprite).body;
      return b && x + 6 > b.x && x - 6 < b.x + b.width && y + 15 > b.y && y + 5 < b.y + b.height;
    });
    const rnd = () => { f.seed = f.seed * 16807 % 2147483647; return f.seed / 2147483647; };
    if (stopped) { s.setVelocity(0, 0); s.anims.stop(); s.setFrame(f.facing); f.next = time + 600; continue; }
    if (time > f.next) {
      f.tx = s.x; f.ty = s.y;
      for (let a = 0; a < 16; a++) {
        const x = s.x + (rnd() - 0.5) * 110, y = s.y + (rnd() - 0.5) * 90;
        if ([0.25, 0.5, 0.75, 1].every(k => clear(s.x + (x - s.x) * k, s.y + (y - s.y) * k))) { f.tx = x; f.ty = y; break; }
      }
      f.until = time + 3200; f.next = time + 4500 + rnd() * 2500;
    }
    const dx = f.tx - s.x, dy = f.ty - s.y, d = Math.hypot(dx, dy);
    const b = s.body as Phaser.Physics.Arcade.Body;
    if (time < f.until && d > 4 && !b.blocked.none) f.until = 0;
    if (time < f.until && d > 4) {
      s.setVelocity(dx / d * 18, dy / d * 18);
      f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      s.play(`${f.t.tex}-walk-${f.facing}`, true);
    } else { s.setVelocity(0, 0); s.anims.stop(); s.setFrame(f.facing); }
    s.setDepth(s.y);
  }
}
