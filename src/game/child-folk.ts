import type * as Phaser from 'phaser';
import nordicBoy from '@/assets/children/child-nordic-boy.png.asset.json';
import nordicGirl from '@/assets/children/child-nordic-girl.png.asset.json';
import wenjaBoy from '@/assets/children/child-wenja-boy.png.asset.json';
import wenjaGirl from '@/assets/children/child-wenja-girl.png.asset.json';
import dragonBoy from '@/assets/children/child-dragon-boy.png.asset.json';
import dragonGirl from '@/assets/children/child-dragon-girl.png.asset.json';
import { CHILD_SPEED, CHILD_WALKS, CHILD_WALK_FRAMES, NAME_RADIUS, childAnchor, childLook, type ChildLook } from './children';
import { FOLK_HOMES, type Folk } from './nordic-folk';
import type { Child } from './reproduction';

// Atlas per look (16×16 frames, 8 columns): row 0 idle E,SE,S,SW,W,NW,N,NE; rows 1–8 walk per direction.
const URLS: Record<ChildLook, string> = {
  'nordic-boy': nordicBoy.url, 'nordic-girl': nordicGirl.url, 'wenja-boy': wenjaBoy.url,
  'wenja-girl': wenjaGirl.url, 'dragon-boy': dragonBoy.url, 'dragon-girl': dragonGirl.url,
};
/** Child feet sit 7 px below the sprite centre; adults' 14 px – shift so both stand on the same line. */
const FEET = 7;

export type Kid = { c: Child; look: ChildLook; sprite: Phaser.GameObjects.Sprite; label: Phaser.GameObjects.Text; facing: number; tx: number; ty: number; next: number; until: number; seed: number };

export function preloadChildren(scene: Phaser.Scene) {
  for (const [k, url] of Object.entries(URLS)) scene.load.spritesheet(`child-${k}`, url, { frameWidth: 16, frameHeight: 16 });
}

function makeKid(scene: Phaser.Scene, c: Child, x: number, y: number, i: number): Kid {
  const look = childLook(c), tex = `child-${look}`;
  if (CHILD_WALKS[look] && !scene.anims.exists(`${tex}-walk-0`)) for (let d = 0; d < 8; d++) {
    const s = 8 + d * CHILD_WALK_FRAMES;
    scene.anims.create({ key: `${tex}-walk-${d}`, frames: scene.anims.generateFrameNumbers(tex, { start: s, end: s + CHILD_WALK_FRAMES - 1 }), frameRate: 10, repeat: -1 });
  }
  const sprite = scene.add.sprite(x, y + FEET, tex, 2).setDepth(y);
  const label = scene.add.text(x, y - 10, c.name, { fontFamily: 'monospace', fontSize: '8px', color: '#fff3c4', stroke: '#1c1712', strokeThickness: 3 }).setOrigin(0.5, 1).setResolution(3).setVisible(false);
  return { c, look, sprite, label, facing: 2, tx: x, ty: y, next: scene.time.now + 500 + i * 250, until: 0, seed: 4111 + i * 97 };
}

function motherOf(folk: Folk[], id: string) {
  const f = folk.find(o => o.c.id === id);
  if (!f) return undefined;
  const st = f.c.state === 'free' ? 'free' as const : f.c.state === 'camp' ? 'camp' as const : 'other' as const;
  return { f, spot: { x: f.sprite.x, y: f.sprite.y, state: st, alive: f.combat.phase !== 'dead' } };
}

/** Adds sprites for newly born children and removes ones no longer in the state. */
export function syncChildren(scene: Phaser.Scene, kids: Kid[], children: readonly Child[], folk: Folk[]): Kid[] {
  const keep = kids.filter(k => { const ok = children.some(c => c.id === k.c.id); if (!ok) { k.sprite.destroy(); k.label.destroy(); } return ok; });
  children.forEach((c, i) => {
    if (keep.some(k => k.c.id === c.id)) return;
    const m = motherOf(folk, c.mother), home = FOLK_HOMES[m?.f.t.village ?? 0];
    const a = childAnchor(m?.spot, home);
    keep.push(makeKid(scene, c, a.x + ((i * 13) % 20) - 10, a.y + 12, i));
  });
  return keep;
}

export function tickChildren(kids: Kid[], folk: Folk[], obstacles: Phaser.Physics.Arcade.StaticGroup | undefined, time: number, dt: number, stopped: boolean, player: { x: number; y: number }) {
  // Only the nearest child within reach shows its name, so names never stack.
  let nearest: Kid | undefined, best = NAME_RADIUS;
  for (const k of kids) { const d = Math.hypot(player.x - k.sprite.x, player.y - (k.sprite.y - FEET)); if (d < best) { best = d; nearest = k; } }
  for (const k of kids) {
    const s = k.sprite, x = s.x, y = s.y - FEET;
    k.label.setVisible(k === nearest).setPosition(x, y - 1).setDepth(y + 3000);
    if (stopped) { s.anims.stop(); s.setFrame(k.facing); continue; }
    const m = motherOf(folk, k.c.mother), home = FOLK_HOMES[m?.f.t.village ?? 0];
    const a = childAnchor(m?.spot, home);
    // Far away (mother carried off to camp, reload): appear beside her instead of crossing the map.
    if (Math.hypot(a.x - x, a.y - y) > 320) { s.setPosition(a.x + 10, a.y + 10 + FEET); k.tx = a.x + 10; k.ty = a.y + 10; continue; }
    const rnd = () => { k.seed = k.seed * 16807 % 2147483647; return k.seed / 2147483647; };
    const clear = (px: number, py: number) => !obstacles?.getChildren().some(o => {
      const b = (o as Phaser.Physics.Arcade.Sprite).body;
      return b && px + 4 > b.x && px - 4 < b.x + b.width && py + 2 > b.y && py - 2 < b.y + b.height;
    });
    const outside = Math.hypot(a.x - x, a.y - y) > a.r;
    if (time > k.next || (outside && time > k.until)) {
      k.tx = x; k.ty = y;
      for (let t = 0; t < 12; t++) {
        const ang = rnd() * Math.PI * 2, r = rnd() * a.r * 0.8;
        const nx = a.x + Math.cos(ang) * r, ny = a.y + 10 + Math.sin(ang) * r * 0.7;
        if ([0.33, 0.66, 1].every(f => clear(x + (nx - x) * f, y + (ny - y) * f))) { k.tx = nx; k.ty = ny; break; }
      }
      k.until = time + 2600; k.next = time + 2500 + rnd() * 3500;
    }
    const dx = k.tx - x, dy = k.ty - y, d = Math.hypot(dx, dy);
    if (time < k.until && d > 2) {
      const step = Math.min(d, CHILD_SPEED * (outside ? 2.2 : 1) * dt / 1000);
      const nx = x + dx / d * step, ny = y + dy / d * step;
      if (!clear(nx, ny) && !outside) { k.until = 0; s.anims.stop(); s.setFrame(k.facing); continue; }
      s.setPosition(nx, ny + FEET);
      k.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      if (CHILD_WALKS[k.look]) s.play(`child-${k.look}-walk-${k.facing}`, true);
      else s.setFrame(k.facing).setY(ny + FEET - (Math.floor(time / 120) % 2)); // idle-only look: a small toddling hop
    } else { s.anims.stop(); s.setFrame(k.facing); }
    s.setDepth(s.y - FEET);
  }
}
