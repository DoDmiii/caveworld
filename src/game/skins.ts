// Uploaded player skins, packed as one atlas per skin: row = anim*8 + direction (E,SE,S,SW,W,NW,N,NE), 9 columns of 32×32.
import wolf from '@/assets/skins/skin-wolf.png.asset.json';
import sabre from '@/assets/skins/skin-sabre.png.asset.json';
import blood from '@/assets/skins/skin-blood.png.asset.json';
import wolfP from '@/assets/skins/skin-wolf-portrait.png.asset.json';
import sabreP from '@/assets/skins/skin-sabre-portrait.png.asset.json';
import bloodP from '@/assets/skins/skin-blood-portrait.png.asset.json';
import type { SkinId } from './appearance';

export const SKIN_ANIMS = ['idle', 'walk', 'run', 'crouch', 'death', 'punch', 'finisher'] as const;
export type SkinAnim = (typeof SKIN_ANIMS)[number];
export const SKIN_COLS = 9;
export const SKINS: Record<SkinId, { url: string; portrait: string; frames: Record<SkinAnim, number> }> = {
  wolf: { url: wolf.url, portrait: wolfP.url, frames: { idle: 1, walk: 8, run: 4, crouch: 6, death: 7, punch: 6, finisher: 9 } },
  sabre: { url: sabre.url, portrait: sabreP.url, frames: { idle: 1, walk: 8, run: 0, crouch: 6, death: 7, punch: 6, finisher: 9 } },
  blood: { url: blood.url, portrait: bloodP.url, frames: { idle: 1, walk: 8, run: 0, crouch: 6, death: 7, punch: 6, finisher: 0 } },
};
export const skinFrame = (a: SkinAnim, dir: number, f = 0) => (SKIN_ANIMS.indexOf(a) * 8 + dir) * SKIN_COLS + f;

// Armed variants per skin (axe/spear), atlas rows = anim*8 + direction for idle, walk, run, attack.
import wolfAxe from '@/assets/skins/skin-wolf-axe.png.asset.json';
import wolfSpear from '@/assets/skins/skin-wolf-spear.png.asset.json';
import sabreAxe from '@/assets/skins/skin-sabre-axe.png.asset.json';
import sabreSpear from '@/assets/skins/skin-sabre-spear.png.asset.json';
import bloodAxe from '@/assets/skins/skin-blood-axe.png.asset.json';
import bloodSpear from '@/assets/skins/skin-blood-spear.png.asset.json';
export const ARMED_ANIMS = ['idle', 'walk', 'run', 'attack'] as const;
export type ArmedAnim = (typeof ARMED_ANIMS)[number];
export type ArmedWeapon = 'axe' | 'spear';
export const ARMED_SKINS: Record<SkinId, Record<ArmedWeapon, { url: string; frames: Record<ArmedAnim, number> }>> = {
  wolf: { axe: { url: wolfAxe.url, frames: { idle: 1, walk: 8, run: 8, attack: 9 } }, spear: { url: wolfSpear.url, frames: { idle: 1, walk: 8, run: 8, attack: 9 } } },
  sabre: { axe: { url: sabreAxe.url, frames: { idle: 1, walk: 8, run: 0, attack: 9 } }, spear: { url: sabreSpear.url, frames: { idle: 1, walk: 8, run: 0, attack: 9 } } },
  blood: { axe: { url: bloodAxe.url, frames: { idle: 1, walk: 8, run: 0, attack: 9 } }, spear: { url: bloodSpear.url, frames: { idle: 1, walk: 8, run: 0, attack: 9 } } },
};
export const armedFrame = (a: ArmedAnim, dir: number, f = 0) => (ARMED_ANIMS.indexOf(a) * 8 + dir) * SKIN_COLS + f;
export const isArmed = (w: string): w is ArmedWeapon => w === 'axe' || w === 'spear';

// Torch held in the main hand: atlas layout like ARMED_SKINS (idle, walk, run, attack), one per look incl. the default player.
import torchBase from '@/assets/skins/torch-base.png.asset.json';
import torchWolf from '@/assets/skins/torch-wolf.png.asset.json';
import torchSabre from '@/assets/skins/torch-sabre.png.asset.json';
import torchBlood from '@/assets/skins/torch-blood.png.asset.json';
export const TORCH_SKINS: Record<SkinId | 'base', { url: string } & Record<ArmedAnim, number>> = {
  base: { url: torchBase.url, idle: 1, walk: 9, run: 0, attack: 9 },
  wolf: { url: torchWolf.url, idle: 1, walk: 8, run: 8, attack: 9 },
  sabre: { url: torchSabre.url, idle: 1, walk: 8, run: 0, attack: 9 },
  blood: { url: torchBlood.url, idle: 1, walk: 8, run: 0, attack: 9 },
};

// Wooden club in the main hand: same atlas layout as TORCH_SKINS; larger uploaded canvases are centre-cropped to 32×32 without losing pixels.
import clubBase from '@/assets/skins/club-base.png.asset.json';
import clubWolf from '@/assets/skins/club-wolf.png.asset.json';
import clubSabre from '@/assets/skins/club-sabre.png.asset.json';
import clubBlood from '@/assets/skins/club-blood.png.asset.json';
export const CLUB_SKINS: typeof TORCH_SKINS = {
  base: { url: clubBase.url, idle: 1, walk: 8, run: 0, attack: 9 },
  wolf: { url: clubWolf.url, idle: 1, walk: 8, run: 8, attack: 9 },
  sabre: { url: clubSabre.url, idle: 1, walk: 8, run: 0, attack: 9 },
  blood: { url: clubBlood.url, idle: 1, walk: 8, run: 0, attack: 9 },
};
