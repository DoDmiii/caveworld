// Animated campfire and hut hearths from the uploaded GIFs (32×32 frames, 150 ms each, pixels untouched).
import type * as Phaser from 'phaser';
import campfireSheet from '@/assets/fire/campfire-anim.png.asset.json';
import hearthSheet from '@/assets/fire/hearth-fires.png.asset.json';

export const FIRE_FRAME = 32;
/** The GIFs run at 150 ms per frame. */
export const FIRE_FPS = 1000 / 150;

/** Outdoor campfire (camp, dragon plaza, cave fires): one row of 13 frames. */
export const CAMPFIRE_SHEET = { key: 'campfire-anim', url: campfireSheet.url, frames: 13 };

/** Hut hearths: one row per hearth variant, 11 columns; each row keeps its own frame count. */
export const HEARTH_SHEET = { key: 'hearth-fires', url: hearthSheet.url, cols: 11 };
export const HEARTH_ROWS: Record<string, { row: number; frames: number; bottom: number }> = {
  'hearth-0': { row: 0, frames: 11, bottom: 31 },
  'hearth-1': { row: 1, frames: 9, bottom: 31 },
  'hearth-2': { row: 2, frames: 11, bottom: 31 },
  'hearth-3': { row: 3, frames: 11, bottom: 31 },
  'hearth-4': { row: 4, frames: 11, bottom: 30 },
};
export const hearthAnimKey = (frameId: string) => `anim-${frameId}`;

/** Start offset so neighbouring fires never flicker in lockstep. */
export const fireStartFrame = (x: number, y: number, frames: number) => ((Math.floor(x * 7 + y * 13) % frames) + frames) % frames;

export function loadFireSheets(scene: Phaser.Scene) {
  scene.load.spritesheet(CAMPFIRE_SHEET.key, CAMPFIRE_SHEET.url, { frameWidth: FIRE_FRAME, frameHeight: FIRE_FRAME });
  scene.load.spritesheet(HEARTH_SHEET.key, HEARTH_SHEET.url, { frameWidth: FIRE_FRAME, frameHeight: FIRE_FRAME });
}

export function createFireAnims(scene: Phaser.Scene) {
  if (!scene.anims.exists(CAMPFIRE_SHEET.key)) scene.anims.create({ key: CAMPFIRE_SHEET.key, frames: scene.anims.generateFrameNumbers(CAMPFIRE_SHEET.key, { start: 0, end: CAMPFIRE_SHEET.frames - 1 }), frameRate: FIRE_FPS, repeat: -1 });
  for (const [id, r] of Object.entries(HEARTH_ROWS)) {
    const key = hearthAnimKey(id); if (scene.anims.exists(key)) continue;
    const start = r.row * HEARTH_SHEET.cols;
    scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(HEARTH_SHEET.key, { start, end: start + r.frames - 1 }), frameRate: FIRE_FPS, repeat: -1 });
  }
}

/** Plays the looping campfire on an existing sprite. */
export function playCampfire(o: Phaser.GameObjects.Sprite) {
  o.play({ key: CAMPFIRE_SHEET.key, startFrame: fireStartFrame(o.x, o.y, CAMPFIRE_SHEET.frames) });
  return o;
}
