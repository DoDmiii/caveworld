import type * as Phaser from 'phaser';
import w0 from '@/assets/nordic-people/nordic-w0.png.asset.json';
import w1 from '@/assets/nordic-people/nordic-w1.png.asset.json';
import w3 from '@/assets/nordic-people/nordic-w3.png.asset.json';
import wr from '@/assets/nordic-people/nordic-warrior.png.asset.json';
import dw0 from '@/assets/dragon-people/dragon-w0.png.asset.json';
import dw1 from '@/assets/dragon-people/dragon-w1.png.asset.json';
import dw2 from '@/assets/dragon-people/dragon-w2.png.asset.json';
import dm0 from '@/assets/dragon-people/dragon-m0.png.asset.json';
import dm1 from '@/assets/dragon-people/dragon-m1.png.asset.json';
import dm2 from '@/assets/dragon-people/dragon-m2.png.asset.json';
import dm3 from '@/assets/dragon-people/dragon-m3.png.asset.json';
import { VILLAGES, DRAGON_VILLAGE } from './biomes';
import { isCampDestination } from './tribe';
import type { Captive } from './captives';
import { newFighter, type Fighter } from './combat';
import { CHAMPION_HP, CHAMPION_SCALE } from './raid';
import { corpseParts } from './corpse-art';

// Atlas: 0–7 idle, then `walk` frames per direction; captives add 8 surrender + 8 bound frames.
// Only blond Nordic atlases (w0, w1, w3, m0, m2) may spawn in Nordic villages.
const T = [
  { id: 'nordic-w0', url: w0.url, walk: 6, captive: true, village: 0, dx: -40, dy: 10 },
  { id: 'nordic-m0', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: true, village: 0, dx: 50, dy: -20 },
  { id: 'nordic-w1', url: w1.url, walk: 6, captive: true, village: 0, dx: 10, dy: 50 },
  { id: 'nordic-m2-f', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: true, village: 0, dx: 0, dy: -90 },
  { id: 'nordic-w3', url: w3.url, walk: 6, captive: true, village: 2, dx: -20, dy: 20 },
  { id: 'nordic-m2', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: true, village: 2, dx: 30, dy: -10 },
  { id: 'nordic-w0-g', tex: 'nordic-w0', url: w0.url, walk: 6, captive: true, village: 1, dx: -60, dy: 30 },
  { id: 'nordic-m0-g', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: true, village: 1, dx: 50, dy: 40 },
  { id: 'nordic-w1-g', tex: 'nordic-w1', url: w1.url, walk: 6, captive: true, village: 1, dx: 0, dy: -10 },
  { id: 'nordic-w3-g', tex: 'nordic-w3', url: w3.url, walk: 6, captive: true, village: 1, dx: 20, dy: 10 },
  { id: 'nordic-m2-g', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: false, village: 1, dx: 0, dy: 80 },
  { id: 'nordic-m0-gw', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: false, village: 1, dx: -30, dy: -50 },
  { id: 'nordic-w1-e', tex: 'nordic-w1', url: w1.url, walk: 6, captive: true, village: 2, dx: 0, dy: 50 },
  { id: 'nordic-m0-e', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: true, village: 2, dx: -60, dy: -30 },
  { id: 'nordic-w0-e', tex: 'nordic-w0', url: w0.url, walk: 6, captive: true, village: 2, dx: 50, dy: 40 },
  { id: 'nordic-m2-e', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: false, village: 2, dx: 0, dy: -80 },
  // Champions: extra blond warriors, one per village; only a finisher kills them.
  { id: 'champion-0', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: false, village: 0, dx: 0, dy: -20, champion: true },
  { id: 'champion-1', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: false, village: 1, dx: 0, dy: -20, champion: true },
  { id: 'champion-2', tex: 'nordic-warrior', url: wr.url, walk: 6, captive: false, village: 2, dx: 0, dy: -20, champion: true },
  // Dragon people (village 3 = Drachenterrasse): same atlas layout as the Nordic warrior; men are armed warriors.
  { id: 'dragon-w0', url: dw0.url, walk: 6, captive: true, village: 3, dx: -40, dy: 40, death: true },
  { id: 'dragon-w1', url: dw1.url, walk: 6, captive: true, village: 3, dx: 40, dy: 40, death: true },
  { id: 'dragon-w2', url: dw2.url, walk: 6, captive: true, village: 3, dx: -110, dy: 60, death: true },
  { id: 'dragon-m0', url: dm0.url, walk: 6, captive: true, village: 3, dx: -40, dy: -30, warrior: true },
  { id: 'dragon-m1', url: dm1.url, walk: 6, captive: true, village: 3, dx: 40, dy: -30, warrior: true },
  { id: 'dragon-m2', url: dm2.url, walk: 6, captive: false, village: 3, dx: 0, dy: 110, warrior: true },
  { id: 'dragon-m3', url: dm3.url, walk: 6, captive: true, village: 3, dx: 110, dy: 60, warrior: true },
] as const;
/** Home settlements of all folk: the Nordic villages, then the dragon terrace. */
export const FOLK_HOMES = [...VILLAGES, DRAGON_VILLAGE] as const;
export const NORDIC_FOLK = T.map(t => ({ ...t, tex: 'tex' in t ? t.tex : t.id, x: FOLK_HOMES[t.village].x + t.dx, y: FOLK_HOMES[t.village].y + t.dy }));
export type FolkTemplate = typeof NORDIC_FOLK[number];
export const isChampion = (t: FolkTemplate) => 'champion' in t;
/** Men are warriors: armed, fight to the death. Women gather and panic when the village is attacked. */
export const isWarrior = (t: FolkTemplate) => t.tex === 'nordic-warrior' || 'warrior' in t;
/** Templates whose atlas carries the 4-direction death fall. */
export const hasDeath = (t: FolkTemplate) => isWarrior(t) || 'death' in t;
export const ATTACK_START = 72, DEATH_START = 144;
const deathDir = (facing: number) => [0, 1, 1, 2, 2, 3, 3, 0][facing] ?? 1;
const surrenderFrame = (t: FolkTemplate, f: number) => 8 + 8 * t.walk + f;
export const surrenderFrameOf = (f: Folk) => surrenderFrame(f.t, f.facing);
export const boundFrame = (t: FolkTemplate, f: number) => 16 + 8 * t.walk + f;

export type Folk = {
  beheaded?: boolean | undefined;
  headPosition?: { x: number; y: number } | undefined;
  headSprite?: Phaser.GameObjects.Image | undefined;
  deathClock?: number | undefined;
  skullTaken?: boolean | undefined;
  combat: Fighter;
  sprite: Phaser.Physics.Arcade.Sprite; t: FolkTemplate; c: Captive;
  facing: number; next: number; until: number; tx: number; ty: number; seed: number;
};

export function preloadFolk(scene: Phaser.Scene) {
  for (const t of NORDIC_FOLK.filter((t, i, a) => a.findIndex(o => o.tex === t.tex) === i)) scene.load.spritesheet(t.tex, t.url, { frameWidth: 32, frameHeight: 32 });
}

export function createFolk(scene: Phaser.Scene, obstacles: Phaser.Physics.Arcade.StaticGroup): Folk[] {
  return NORDIC_FOLK.map((t, i) => {
    if (!scene.anims.exists(`${t.tex}-walk-0`)) for (let d = 0; d < 8; d++) {
      const s = 8 + d * t.walk;
      scene.anims.create({ key: `${t.tex}-walk-${d}`, frames: scene.anims.generateFrameNumbers(t.tex, { start: s, end: s + t.walk - 1 }), frameRate: 8, repeat: -1 });
      if (isWarrior(t)) scene.anims.create({ key: `${t.tex}-attack-${d}`, frames: scene.anims.generateFrameNumbers(t.tex, { start: ATTACK_START + d * 9, end: ATTACK_START + d * 9 + 8 }), frameRate: 18, repeat: 0 });
    }
    const sprite = scene.physics.add.sprite(t.x, t.y, t.tex, 2).setSize(10, 7).setOffset(11, 23).setDepth(t.y).setPushable(false);
    if (isChampion(t)) sprite.setScale(CHAMPION_SCALE).setTint(0xffe6c0);
    scene.physics.add.collider(sprite, obstacles);
    return { sprite, t, combat: newFighter(isChampion(t) ? CHAMPION_HP : undefined), c: { id: t.id, state: 'free', x: t.x, y: t.y }, facing: 2, next: scene.time.now + 800 + i * 300, until: 0, tx: t.x, ty: t.y, seed: 977 + i * 151 };
  });
}

/** A dark pool stays under every corpse for as long as the body lies there. */
function corpseBlood(f: Folk) {
  const sc = f.sprite.scene, any = f as Folk & { pool?: Phaser.GameObjects.Ellipse };
  if (any.pool?.active) return;
  any.pool = sc.add.ellipse(f.sprite.x + 2, f.sprite.y + 9, 22, 9, 0x5a0606, 0.8).setDepth(f.sprite.y - 6);
}
/** Plays the death fall once, then poseFolk keeps the last frame. */
export function dieFolk(f: Folk) {
  poseFolk(f);
  if (f.beheaded || !hasDeath(f.t)) return;
  const sc = f.sprite.scene, key = `${f.t.tex}-death-${deathDir(f.facing)}`, st = DEATH_START + deathDir(f.facing) * 7;
  if (!sc.anims.exists(key)) sc.anims.create({ key, frames: sc.anims.generateFrameNumbers(f.t.tex, { start: st, end: st + 6 }), frameRate: 10, repeat: 0 });
  f.sprite.play(key);
}
/** Re-applies the visible pose after a state change. */
export function poseFolk(f: Folk) {
  const s = f.sprite; s.anims.stop(); s.setVelocity(0, 0);
  const body = s.body as Phaser.Physics.Arcade.Body;
  body.enable = f.c.state !== 'carried' && f.combat.phase === 'ready';
  s.setVisible(f.c.state !== 'carried');
  s.setAngle(0);
  s.setCrop();
  if (f.combat.phase === 'dead' && f.beheaded) {
    const art = corpseParts(s.scene, f.t.tex);
    if (art) {
      s.setTexture(art.bodyKey).setDepth(s.y - 4);
      corpseBlood(f);
      if (f.headPosition && !f.skullTaken && !f.headSprite?.active) {
        f.headSprite = s.scene.add.image(f.headPosition.x, f.headPosition.y, art.headKey).setScale(s.scaleX, s.scaleY).setDepth(f.headPosition.y);
      }
      return;
    }
  }
  if (s.texture.key !== f.t.tex) s.setTexture(f.t.tex);
  if (f.combat.phase !== 'dead') {
    f.beheaded = false; f.headPosition = undefined; f.deathClock = undefined; f.skullTaken = undefined;
    f.headSprite?.destroy(); f.headSprite = undefined;
  }
  if (f.combat.phase === 'dead' && hasDeath(f.t)) {
    s.setFrame(DEATH_START + deathDir(f.facing) * 7 + 6).setDepth(s.y - 4);
    corpseBlood(f); return;
  }
  if (f.combat.phase === 'dead') corpseBlood(f); else (f as Folk & { pool?: Phaser.GameObjects.Ellipse }).pool?.destroy();
  if (f.combat.phase !== 'ready') {
    // Use this inhabitant's own lying pose; templates without it fall sideways, never borrow another ethnicity.
    const frame = boundFrame(f.t, 0);
    if (s.texture.has(String(frame))) s.setFrame(frame);
    else s.setFrame(f.facing).setAngle(90);
    s.setDepth(s.y);
    return;
  }
  if (f.c.state === 'surrender') s.setFrame(surrenderFrame(f.t, f.facing));
  else if (f.c.state === 'bound') s.setFrame(boundFrame(f.t, 0));
  else s.setFrame(f.facing);
  if (f.c.state === 'bound' || f.c.state === 'camp') s.setPosition(f.c.x, f.c.y);
  s.setDepth(s.y);
}

export function tickFolk(folk: Folk[], obstacles: Phaser.Physics.Arcade.StaticGroup | undefined, time: number, stopped: boolean, controlled: ReadonlySet<string> = new Set()) {
  for (const f of folk) {
    if (controlled.has(f.c.id)) { f.next = time + 600; continue; }
    if (f.combat.phase !== 'ready') continue;
    if (f.c.state !== 'free' && f.c.state !== 'camp') continue;
    const s = f.sprite, v = FOLK_HOMES[f.t.village];
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
