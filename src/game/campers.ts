import type * as Phaser from 'phaser';
import { CAMP_ALLIES, isCampDestination } from './tribe';

export type Camper = {
  sprite: Phaser.Physics.Arcade.Sprite;
  template: typeof CAMP_ALLIES[number];
  facing: number;
  turnAt: number;
  nextDecision: number;
  walkUntil: number;
  targetX: number;
  targetY: number;
  seed: number;
};

export function preloadCampers(scene: Phaser.Scene) {
  for (const template of CAMP_ALLIES) {
    scene.load.spritesheet(template.id, template.url, { frameWidth: 32, frameHeight: 32 });
  }
}

export function createCampers(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, obstacles: Phaser.Physics.Arcade.StaticGroup): Camper[] {
  const campers = CAMP_ALLIES.map((template, index): Camper => {
    for (let direction = 0; direction < 8; direction++) {
      if (template.walkingFrames === 0) continue;
      const start = 8 + direction * template.walkingFrames;
      scene.anims.create({
        key: `${template.id}-walk-${direction}`,
        frames: scene.anims.generateFrameNumbers(template.id, { start, end: start + template.walkingFrames - 1 }),
        frameRate: 8, repeat: -1,
      });
    }
    const sprite = scene.physics.add.sprite(template.x, template.y, template.id, 2)
      .setSize(10, 7).setOffset(11, 23).setDepth(template.y).setCollideWorldBounds(true);
    scene.physics.add.collider(sprite, obstacles);
    scene.physics.add.collider(sprite, player);
    return { sprite, template, facing: 2, turnAt: 0, nextDecision: scene.time.now + 900 + index * 450,
      walkUntil: 0, targetX: template.x, targetY: template.y, seed: 713 + index * 137 };
  });
  campers.forEach((camper, index) => {
    campers.slice(index + 1).forEach(other => scene.physics.add.collider(camper.sprite, other.sprite));
  });
  return campers;
}

export function tickCampers(campers: Camper[], obstacles: Phaser.Physics.Arcade.StaticGroup | undefined, time: number, stopped: boolean) {
  const clear = (x: number, y: number) => isCampDestination(x, y) && !obstacles?.getChildren().some(object => {
    const body = (object as Phaser.Physics.Arcade.Sprite).body;
    // Test at the feet, where all actor bodies are anchored.
    return body && x + 6 > body.x && x - 6 < body.x + body.width
      && y + 15 > body.y && y + 5 < body.y + body.height;
  });
  for (const camper of campers) {
    const { sprite, template } = camper;
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    const random = () => { camper.seed = camper.seed * 16807 % 2147483647; return camper.seed / 2147483647; };
    if (stopped || template.walkingFrames === 0) {
      sprite.setVelocity(0, 0); sprite.anims.stop(); sprite.setFrame(camper.facing);
      // Re-plan after a pause rather than jumping directly into a stale destination.
      if (stopped) camper.nextDecision = time + 600;
      continue;
    }
    if (time > camper.nextDecision) {
      camper.targetX = sprite.x; camper.targetY = sprite.y;
      for (let attempt = 0; attempt < 16; attempt++) {
        const x = sprite.x + (random() - 0.5) * 100;
        const y = sprite.y + (random() - 0.5) * 80;
        const safePath = [0.25, 0.5, 0.75, 1].every(t => clear(sprite.x + (x - sprite.x) * t, sprite.y + (y - sprite.y) * t));
        if (!safePath) continue;
        camper.targetX = x; camper.targetY = y; break;
      }
      camper.walkUntil = time + 3200;
      camper.nextDecision = time + 4800 + random() * 2200;
    }
    const dx = camper.targetX - sprite.x, dy = camper.targetY - sprite.y, distance = Math.hypot(dx, dy);
    const blocked = body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down;
    const touching = body.touching.left || body.touching.right || body.touching.up || body.touching.down;
    if (time < camper.walkUntil && distance > 4 && !blocked && !touching) {
      sprite.setVelocity(dx / distance * 18, dy / distance * 18);
      const facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      if (time >= camper.turnAt && facing !== camper.facing) { camper.facing = facing; camper.turnAt = time + 250; }
      sprite.play(`${template.id}-walk-${camper.facing}`, true);
    } else {
      sprite.setVelocity(0, 0); sprite.anims.stop(); sprite.setTexture(template.id, camper.facing);
      if (blocked || touching) camper.walkUntil = 0;
    }
    sprite.setDepth(sprite.y);
  }
}