import type * as Phaser from 'phaser';

/** The uploaded lying frame has its head on the right, not above the torso. */
export function corpseParts(scene: Phaser.Scene, texture: string) {
  const cut = texture === 'nordic-warrior' ? 20 : 19;
  const bodyKey = `${texture}-headless`, headKey = `${texture}-head-piece`;
  if (!scene.textures.exists(bodyKey)) {
    const frame = scene.textures.getFrame(texture, 64);
    const body = scene.textures.createCanvas(bodyKey, 32, 32);
    const head = scene.textures.createCanvas(headKey, 32 - cut, 14);
    if (!frame || !body || !head) return null;
    const source = frame.source.image as HTMLImageElement;
    const ctx = body.context;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, frame.cutX, frame.cutY, cut, 32, 0, 0, cut, 32);
    // A narrow pixel neck closes the cut without covering the original torso.
    ctx.fillStyle = '#5e0808'; ctx.fillRect(cut - 1, 14, 2, 6);
    ctx.fillStyle = '#b01818'; ctx.fillRect(cut, 15, 1, 4);
    head.context.imageSmoothingEnabled = false;
    head.context.drawImage(source, frame.cutX + cut, frame.cutY + 9, 32 - cut, 14, 0, 0, 32 - cut, 14);
    body.refresh(); head.refresh();
  }
  return { bodyKey, headKey, neckX: cut - 16, neckY: 1, headX: (cut + 32) / 2 - 16, headY: 0 };
}