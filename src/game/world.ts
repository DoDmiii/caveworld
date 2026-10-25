import { eat, roast, FOOD, type Food, type Pantry } from './food';
import * as Phaser from 'phaser';
import { MAP, BIOME_COLOR, BIOME_FLORA, BIOME_NAME, biomeAt, riverX, isFord, FORDS, villageAt, VILLAGES } from './biomes';
import { canRecruit, MAX_COMPANIONS, pickAllyTarget, companionWeapon, ALLY_REACH, ALLY_STRIKE_MS, ALLY_DAMAGE, type CompanionOrder, type Foe } from './companions';
import { CompanionMovement, type CompanionActor, type Block } from './companion-movement';
import { getAvailableInteractions } from './interactions';
import { flankSlot, separation, lungeIndex, hitFighter, recoverFighter, canFinish, finishFighter, KNOCKDOWN_MS, newFighter } from './combat';
import north from '@/assets/north.png.asset.json';
import northEast from '@/assets/north-east.png.asset.json';
import east from '@/assets/east.png.asset.json';
import southEast from '@/assets/south-east.png.asset.json';
import south from '@/assets/south.png.asset.json';
import southWest from '@/assets/south-west.png.asset.json';
import west from '@/assets/west.png.asset.json';
import northWest from '@/assets/north-west.png.asset.json';
import campfire from '@/assets/campfire.png.asset.json';
import { CAMP_TEXTURES, CAMP_LAYOUT } from './camp';
import { NORDIC_TEXTURES, NORDIC_LAYOUT, NORDIC_HOUSES } from './nordic';
import { lootHouse } from './village-loot';
import tree0 from '@/assets/tree-east.png.asset.json';
import tree1 from '@/assets/tree-south-east.png.asset.json';
import tree2 from '@/assets/tree-south.png.asset.json';
import tree3 from '@/assets/tree-south-west.png.asset.json';
import tree4 from '@/assets/tree-west.png.asset.json';
import tree5 from '@/assets/tree-north-west.png.asset.json';
import tree6 from '@/assets/tree-north.png.asset.json';
import tree7 from '@/assets/tree-north-east.png.asset.json';
import snowTree0 from '@/assets/snow/snow-tree-0.png.asset.json';
import snowTree1 from '@/assets/snow/snow-tree-1.png.asset.json';
import snowTree2 from '@/assets/snow/snow-tree-2.png.asset.json';
import snowRock0 from '@/assets/snow/snow-rock-0.png.asset.json';
import snowRock1 from '@/assets/snow/snow-rock-1.png.asset.json';
import snowRock2 from '@/assets/snow/snow-rock-2.png.asset.json';
import snowRock3 from '@/assets/snow/snow-rock-3.png.asset.json';
import snowRock4 from '@/assets/snow/snow-rock-4.png.asset.json';
import snowRock5 from '@/assets/snow/snow-rock-5.png.asset.json';
const SNOW_TREES=[snowTree0,snowTree1,snowTree2];
const SNOW_ROCKS=[snowRock0,snowRock1,snowRock2,snowRock3,snowRock4,snowRock5];
import walkEast from '@/assets/walk-east.png.asset.json';
import walkSouthEast from '@/assets/walk-south-east.png.asset.json';
import walkSouth from '@/assets/walk-south.png.asset.json';
import walkSouthWest from '@/assets/walk-south-west.png.asset.json';
import walkWest from '@/assets/walk-west.png.asset.json';
import walkNorthWest from '@/assets/walk-north-west.png.asset.json';
import walkNorth from '@/assets/walk-north.png.asset.json';
import walkNorthEast from '@/assets/walk-north-east.png.asset.json';
import { XP, levelFromXp, RECIPES, craft, type ItemId, coldFactor, BANDAGE_HP_PER_SEC, BOLA_SLOW, BOLA_MS, pickupAmount } from './progress';
import { IDLE, WALK, ATTACK, SLEEP, BED, ICON_SPEAR, ICON_AXE, DEATH, CROUCH, FINISHER, type Weapon } from './gear';
import { TIGER, GAZELLE, SNOW, type SnowKind } from './wildlife';
const NAME: Record<string, string> = { tiger: 'Säbelzahntiger', gazelle: 'Gazelle', wolf: 'Schneewolf', bear: 'Höhlenbär', mammoth: 'Mammut' };
const reachOf = (k: string) => k === 'mammoth' ? 48 : k === 'bear' ? 38 : 32;
import { preloadCampers, createCampers, tickCampers, type Camper } from './campers';
import resWood from '@/assets/res-wood.png.asset.json';
import resStone from '@/assets/res-stone.png.asset.json';
import resFlint from '@/assets/res-flint.png.asset.json';
import resFiber from '@/assets/res-fiber.png.asset.json';
import { saveGame, type GameSave } from './save';
import { preloadFolk, createFolk, tickFolk, poseFolk, boundFrame, type Folk } from './nordic-folk';
import { interact, drop, CARRY_SPEED } from './captives';

import { decideReaction, type BehaviorDecision } from './behavior';
import type { InteractionContext, InteractionId } from './interactions';
import { EMPTY_RELATIONSHIPS, changeVillageRelationship, changePersonalRelationship, getPersonalRelationship, isAlarmActive, raiseAlarm, type RelationshipState } from './relationships';
import { resolveInteraction, villageKey, INTERACTION_RANGE } from './tribal';
import { START_MINUTES, clockOf, isNight, skyTint, ambientTemp, tickHunger, tickWarmth, survivalDamage, advanceClock, HUNGER_WARN, COLD_WARN, SLEEP_CLOCK_PER_SEC, SLEEP_HUNGER_COST } from './survival';
import { TREE_HP, ROCK_HP, TREE_DROP, ROCK_DROP, RESOURCE_NAME, emptyStock, gain, type Resource, type Stock } from './harvest';

export type GameInput = { x: number; y: number; sprint: boolean; action: number; attack: number; paused: boolean; weapon: Weapon; sleep: boolean; crouch: boolean; respawn: number; eat: Food | null; club: boolean; craft: ItemId | null; save: number; interaction?: { id: InteractionId; target: string } | null };
export type TalkTarget = InteractionContext & { id: string; name: string };
export type GameStatus = { x: number; y: number; stamina: number; health: number; berries: number; meat: number; cooked: number; nearFire: boolean; healPulse: number; area: string; message: string; weapon: Weapon; sleeping: boolean; nearBed: boolean; hidden: boolean; crouching: boolean; dead: boolean; wood: number; stone: number; flint: number; fiber: number; xp: number; level: number; owned: ItemId[]; hunger: number; warmth: number; day: number; minutes: number; talk?: TalkTarget | null; companionCount?: number };
type Creature = {
  kind: 'tiger' | 'gazelle' | SnowKind;
  slowUntil?: number;
  sprite: Phaser.Physics.Arcade.Sprite;
  state: 'idle' | 'wander' | 'flee' | 'chase' | 'attack' | 'dead';
  facing: number;
  hp: number;
  stateUntil: number;
  nextDecision: number;
  nextAttack: number;
  wanderX: number;
  wanderY: number;
  turnAt?: number;
  alert?: number;
};
const sprites = [east, southEast, south, southWest, west, northWest, north, northEast];
const treeTex = [tree0,tree1,tree2,tree3,tree4,tree5,tree6,tree7];
const walkSheets = [walkEast, walkSouthEast, walkSouth, walkSouthWest, walkWest, walkNorthWest, walkNorth, walkNorthEast];
const WORLD = 2048;
// Start camp sits in the forecourt of a cave carved into the northern massif.
const CAMP = { x: 1000, y: 640 };
const FIRE_DY = 40;

export function createWorld(parent: HTMLElement, input: GameInput, onStatus: (s: GameStatus) => void, initial: GameSave | null = null) {
  class Wilderness extends Phaser.Scene {
    player?: Phaser.Physics.Arcade.Sprite;
    keys?: Record<string, Phaser.Input.Keyboard.Key>;
    obstacles?: Phaser.Physics.Arcade.StaticGroup;
    berries: { x: number; y: number; picked: boolean; sprite: Phaser.GameObjects.Image }[] = [];
    stamina = 100;
    cooked = 0;
    healPulse = 0;
    health = 100;
    count = 0;
    lastAction = 0;
    lastAttack = 0;
    attacking = false;
    finisher: Folk | undefined = undefined;
    sleeping = false;
    weapon: Weapon = 'none';
    lastReport = 0;
    message = '';
    messageUntil = 0;
    lastFacing = 2;
    nearBed = false;
    bed?: Phaser.GameObjects.Image;
    creatures: Creature[] = [];
    campers: Camper[] = [];
    companionOrders = new Map<string, CompanionOrder>();
    companionMovement = new CompanionMovement();
    allyFocus?: string;
    allyGear = new Map<string, { img: Phaser.GameObjects.Image; next: number; swingUntil: number }>();
    meatPickups: { x: number; y: number; sprite: Phaser.GameObjects.Image }[] = [];
    meat = 0;
    trees: { x: number; y: number; dir: number; hp: number; tint: number; sprite: Phaser.Physics.Arcade.Sprite }[] = [];
    stumps: { x: number; y: number; dir: number; sprite?: Phaser.GameObjects.Image }[] = [];
    minedRocks: [number, number][] = [];
    lootedHouses: string[] = [];
    folk: Folk[] = [];
    rel: RelationshipState = EMPTY_RELATIONSHIPS;
    folkMood = new Map<string, { icon: Phaser.GameObjects.Text; next: number; dec?: BehaviorDecision | undefined; armedUntil?: number; weapon?: Phaser.GameObjects.Image }>();
    talk: TalkTarget | null = null;
    carried: Folk | undefined = undefined;
    carryImg?: Phaser.GameObjects.Image;
    villageSupplies = new Map<string, Phaser.GameObjects.Image>();
    hunger = 100;
    warmth = 100;
    clock = START_MINUTES; // Spielminuten seit Tag 1, 00:00
    nextHungerWarn = 0;
    nextColdWarn = 0;
    nightTex: Phaser.Textures.CanvasTexture | undefined = undefined;
    night: Phaser.GameObjects.Image | undefined = undefined;
    lastAutosave = 0;
    lastSaveReq = 0;
    plantTree?: (x: number, y: number, dir: number) => void;
    rocks: { x: number; y: number; hp: number; sprite: Phaser.Physics.Arcade.Sprite }[] = [];
    resPickups: { kind: Resource; x: number; y: number; sprite: Phaser.GameObjects.Image }[] = [];
    stock: Stock = emptyStock();
    crouchOn = false;
    hidden = false;
    covers: { x: number; y: number }[] = [];
    hitFlash = 0;
    attackPending = false;
    lastDamage = 0;
    target: Creature | undefined = undefined;
    marker?: Phaser.GameObjects.Image;
    hasSpear = true;
    xp = 0;
    owned: ItemId[] = ['axe'];
    addXp(n: number) { const before = levelFromXp(this.xp); this.xp += n; const after = levelFromXp(this.xp); if (after > before) { this.message = `Stufe ${after} erreicht! Neue Rezepte im Handwerk`; this.messageUntil = this.time.now + 3000; return true; } return false; }
    lockReq = false;
    clickAttack = false;
    get held(): Weapon { return this.weapon==='spear'&&!this.hasSpear?'none':this.weapon; }
    crouching = false;
    dead = false;
    lastRespawn = 0;
    spear: { img: Phaser.GameObjects.Image; target: Creature | undefined; tx: number; ty: number } | undefined = undefined;
    spearOnGround: { x: number; y: number; img: Phaser.GameObjects.Image } | undefined = undefined;
    pantry(){return{health:this.health,stamina:this.stamina,hunger:this.hunger,berries:this.count,meat:this.meat,cooked:this.cooked};}
    setPantry(r:Pantry){this.health=r.health;this.stamina=r.stamina;this.hunger=r.hunger;this.count=r.berries;this.meat=r.meat;this.cooked=r.cooked;}
    /** Aktueller Spielstand der Welt; null, solange Speichern keinen Sinn ergibt (tot, schlafend, noch nicht bereit). */
    snapshot(): GameSave | null {
      const p = this.player;
      if (!p || this.dead || this.sleeping || this.health <= 0) return null;
      return {
        x: Math.round(p.x), y: Math.round(p.y),
        health: Math.min(100, Math.max(1, Math.round(this.health))),
        stamina: Math.min(100, Math.max(0, Math.round(this.stamina))),
        hunger: Math.round(this.hunger), warmth: Math.round(this.warmth), clock: Math.floor(this.clock),
        berries: this.count, meat: this.meat, cooked: this.cooked,
        stock: { ...this.stock }, xp: this.xp, owned: [...this.owned],
        stumps: this.stumps.map(({ x, y, dir }) => ({ x, y, dir })),
        minedRocks: this.minedRocks.map(([x, y]) => [x, y] as [number, number]),
        pickedBerries: this.berries.flatMap((b, i) => (b.picked ? [i] : [])),
        lootedHouses: [...this.lootedHouses],
        // A captive on the shoulders is saved lying bound at the player's feet.
        captives: this.folk.filter(f => f.c.state !== 'free').map(f => f.c.state === 'carried'
          ? { id: f.c.id, state: 'bound' as const, x: Math.round(p.x), y: Math.round(p.y + 6) }
          : { id: f.c.id, state: f.c.state as 'surrender' | 'bound' | 'camp', x: Math.round(f.sprite.x), y: Math.round(f.sprite.y) }),
        fighters: this.folk.filter(f => f.combat.hp !== 60 || f.combat.phase !== 'ready').map(f => ({ id: f.c.id, hp: f.combat.hp, phase: f.combat.phase, x: Math.round(f.sprite.x), y: Math.round(f.sprite.y), facing: f.facing })),
        companions: this.companionActors().flatMap(a => { const order = this.companionOrders.get(a.id); return order ? [{ id: a.id, mode: order.mode, x: Math.round(a.sprite.x), y: Math.round(a.sprite.y) }] : []; }),
        relationships: { village: { ...this.rel.village }, personal: { ...this.rel.personal }, alarmUntil: { ...this.rel.alarmUntil } },
      };
    }
    persist() { const g = this.snapshot(); if (g) saveGame({ game: g }); }
    /** Wendet einen Spielstand auf die frisch (deterministisch) erzeugte Welt an. */
    restore(g: GameSave) {
      const p = this.player; if (!p) return;
      this.health = g.health; this.stamina = g.stamina;
      this.count = g.berries; this.meat = g.meat; this.cooked = g.cooked;
      this.hunger = g.hunger; this.warmth = g.warmth; this.clock = g.clock;
      this.stock = { ...g.stock }; this.xp = g.xp; this.owned = [...g.owned];
      this.lootedHouses = [...g.lootedHouses];
      this.rel = g.relationships;
      for (const id of this.lootedHouses) { this.villageSupplies.get(id)?.destroy(); this.villageSupplies.delete(id); }
      // Bereits gefällte Bäume wieder entfernen; der Stumpf bleibt für das Nachwachsen nach dem Schlafen.
      for (const s of g.stumps) {
        const t = this.trees.find(t => Math.hypot(t.x - s.x, t.y - s.y) < 2); if (!t) continue;
        this.trees = this.trees.filter(o => o !== t); t.sprite.destroy();
        this.stumps.push({ x: t.x, y: t.y, dir: t.dir });
      }
      for (const [x, y] of g.minedRocks) {
        const r = this.rocks.find(r => Math.hypot(r.x - x, r.y - y) < 2); if (!r) continue;
        this.rocks = this.rocks.filter(o => o !== r);
        this.covers = this.covers.filter(c => Math.hypot(c.x - r.x, c.y - r.y) > 1);
        r.sprite.destroy(); this.minedRocks.push([r.x, r.y]);
      }
      for (const i of g.pickedBerries) { const b = this.berries[i]; if (b) { b.picked = true; b.sprite.setTint(0x849461); } }
      for (const c of g.captives) { const f = this.folk.find(o => o.c.id === c.id); if (f) { f.c = { ...c }; poseFolk(f); } }
      for (const saved of g.fighters ?? []) { const f = this.folk.find(o => o.c.id === saved.id); if (!f) continue; f.combat = { hp: saved.hp, phase: saved.phase, downUntil: saved.phase === 'downed' ? this.time.now + KNOCKDOWN_MS : 0 }; f.facing = saved.facing; f.sprite.setPosition(saved.x, saved.y); poseFolk(f); }
      for (const order of g.companions ?? []) {
        const actor = this.companionActors().find(a => a.id === order.id); if (!actor) continue;
        if (order.mode === 'follow' && this.followingCount() >= MAX_COMPANIONS) continue;
        actor.sprite.setPosition(order.x, order.y);
        this.companionOrders.set(order.id, { ...order });
      }
      p.setPosition(Phaser.Math.Clamp(g.x, MAP.x, MAP.x + MAP.w), Phaser.Math.Clamp(g.y, MAP.y, MAP.y + MAP.h));
      this.cameras.main.centerOn(p.x, p.y);
      this.message = 'Spielstand geladen'; this.messageUntil = this.time.now + 2400;
    }
    /** Dunkelheit als Overlay mit "Lichtlöchern" am Lagerfeuer und um den Spieler (Canvas-Textur, deckt die Kamerasicht ab). */
    updateNight() {
      const tex = this.nightTex, img = this.night, p = this.player;
      if (!tex || !img || !p) return;
      const sky = skyTint(clockOf(this.clock).minutesOfDay);
      if (sky.a < 0.01) { img.setVisible(false); return; }
      const wv = this.cameras.main.worldView, pad = 14;
      const wx = wv.x - pad, wy = wv.y - pad, ww = wv.width + pad * 2, wh = wv.height + pad * 2;
      const cw = Math.max(16, Math.ceil(ww / 3)), ch = Math.max(16, Math.ceil(wh / 3)); // 1 Canvas-Pixel = 3 Weltpixel
      if (tex.width !== cw || tex.height !== ch) tex.setSize(cw, ch);
      const ctx = tex.context, k = cw / ww;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = `rgba(${sky.r},${sky.g},${sky.b},${sky.a})`;
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = 'destination-out';
      const hole = (x: number, y: number, r: number, strength: number) => {
        const cx = (x - wx) * k, cy = (y - wy) * k, cr = r * k;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        g.addColorStop(0, `rgba(0,0,0,${strength})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
      };
      hole(CAMP.x, CAMP.y + FIRE_DY, 190, 0.92); // Lagerfeuer
      hole(p.x, p.y, 70, 0.35);                  // Restlicht um den Spieler
      ctx.globalCompositeOperation = 'source-over';
      tex.refresh();
      img.setVisible(true).setPosition(wx, wy).setDisplaySize(ww, wh);
    }
    preload() {
      preloadCampers(this);
      preloadFolk(this);
      sprites.forEach((asset, i) => this.load.image(`human${i}`, asset.url));
      walkSheets.forEach((asset, i) => this.load.spritesheet(`walk${i}`, asset.url, { frameWidth: 28, frameHeight: 28 }));
      (['none','axe','spear','wedge'] as Weapon[]).forEach(w => {
        IDLE[w].forEach((u, i) => this.load.image(`${w}-idle-${i}`, u));
        WALK[w].forEach((u, i) => this.load.spritesheet(`${w}-walk-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
        ATTACK[w].forEach((u, i) => this.load.spritesheet(`${w}-attack-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
      });
      FINISHER.forEach((u,i)=>this.load.spritesheet(`finisher-${i}`,u,{frameWidth:32,frameHeight:32}));
      DEATH.forEach((u,i)=>this.load.spritesheet(`death-${i}`,u,{frameWidth:32,frameHeight:32}));
      CROUCH.forEach((u,i)=>this.load.spritesheet(`crouch-${i}`,u,{frameWidth:32,frameHeight:32}));
      this.load.image('sleep', SLEEP);
      this.load.image('spear-proj', ICON_SPEAR);
      this.load.image('folk-axe', ICON_AXE);
      this.load.image('bed', BED);
      treeTex.forEach((asset, i) => this.load.image(`tree${i}`, asset.url));
      SNOW_TREES.forEach((asset, i) => this.load.image(`snow-tree-${i}`, asset.url));
      SNOW_ROCKS.forEach((asset, i) => this.load.image(`snow-rock-${i}`, asset.url));
      this.load.image('res-wood', resWood.url);
      this.load.image('res-stone', resStone.url);
      this.load.image('res-flint', resFlint.url);
      this.load.image('res-fiber', resFiber.url);
      this.load.image('fire', campfire.url);
      for(const [k,u] of Object.entries({...CAMP_TEXTURES,...NORDIC_TEXTURES})) this.load.image(k,u);
      for (let i = 0; i < 8; i++) {
        this.load.image(`tiger-idle-${i}`, TIGER.idle[i]!);
        this.load.spritesheet(`tiger-walk-${i}`, TIGER.walk[i]!, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet(`tiger-attack-${i}`, TIGER.attack[i]!, { frameWidth: 64, frameHeight: 64 });
        this.load.image(`gazelle-idle-${i}`, GAZELLE.idle[i]!);
        this.load.spritesheet(`gazelle-walk-${i}`, GAZELLE.walk[i]!, { frameWidth: 40, frameHeight: 40 });
        this.load.spritesheet(`gazelle-run-${i}`, GAZELLE.run[i]!, { frameWidth: 40, frameHeight: 40 });
        for (const [k, sp] of Object.entries(SNOW)) {
          const f = { frameWidth: sp.cell, frameHeight: sp.cell };
          this.load.image(`${k}-idle-${i}`, sp.idle[i]!);
          this.load.spritesheet(`${k}-walk-${i}`, sp.walk[i]!, f);
          if (sp.attack) this.load.spritesheet(`${k}-attack-${i}`, sp.attack[i]!, f);
        }
      }
    }
    create() {
      // One looping walk cycle per direction; timeScale adapts to sprint speed.
      for (let i = 0; i < 8; i++) {
        this.anims.create({ key: `walk-${i}`, frames: this.anims.generateFrameNumbers(`walk${i}`, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
      }
      (['none','axe','spear','wedge'] as Weapon[]).forEach(w => {
        for (let i = 0; i < 8; i++) {
          const walkKey = `${w}-walk-${i}`;
          this.anims.create({ key: walkKey, frames: this.anims.generateFrameNumbers(walkKey, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
          const atkKey = `${w}-attack-${i}`;
          const tex = this.textures.get(atkKey);
          const frames = this.anims.generateFrameNumbers(atkKey, { start: 0, end: tex.frameTotal - 2 });
          this.anims.create({ key: `anim-${atkKey}`, frames, frameRate: 12, repeat: 0 });
        }
      });
      for (let i = 0; i < 8; i++) {
        this.anims.create({ key: `anim-finisher-${i}`, frames: this.anims.generateFrameNumbers(`finisher-${i}`), frameRate: 10, repeat: 0 });
        this.anims.create({ key: `anim-death-${i}`, frames: this.anims.generateFrameNumbers(`death-${i}`), frameRate: 9, repeat: 0 });
        this.anims.create({ key: `anim-crouch-${i}`, frames: this.anims.generateFrameNumbers(`crouch-${i}`), frameRate: 7, repeat: -1 });
        this.anims.create({ key: `tiger-walk-${i}`, frames: this.anims.generateFrameNumbers(`tiger-walk-${i}`, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        const tAtk = this.textures.get(`tiger-attack-${i}`);
        this.anims.create({ key: `anim-tiger-attack-${i}`, frames: this.anims.generateFrameNumbers(`tiger-attack-${i}`, { start: 0, end: tAtk.frameTotal - 2 }), frameRate: 14, repeat: 0 });
        this.anims.create({ key: `gazelle-walk-${i}`, frames: this.anims.generateFrameNumbers(`gazelle-walk-${i}`, { start: 0, end: 7 }), frameRate: 9, repeat: -1 });
        this.anims.create({ key: `gazelle-run-${i}`, frames: this.anims.generateFrameNumbers(`gazelle-run-${i}`, { start: 0, end: 5 }), frameRate: 14, repeat: -1 });
        for (const [k, sp] of Object.entries(SNOW)) {
          this.anims.create({ key: `${k}-walk-${i}`, frames: this.anims.generateFrameNumbers(`${k}-walk-${i}`), frameRate: k === 'mammoth' ? 7 : 10, repeat: -1 });
          if (sp.attack) this.anims.create({ key: `anim-${k}-attack-${i}`, frames: this.anims.generateFrameNumbers(`${k}-attack-${i}`), frameRate: 13, repeat: 0 });
        }
      }
      // Hand-drawn integer-pixel textures, built once and rendered without filtering.
      const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
        const texture = this.textures.createCanvas(key, w, h);
        if (!texture) return;
        draw(texture.context); texture.refresh();
      };
      const rect = (c: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) => { c.fillStyle = color; c.fillRect(x,y,w,h); };
      make('rock', 34, 26, c => { rect(c,'#2c3529',2,20,30,5);rect(c,'#5a6058',4,8,26,13);rect(c,'#767b72',7,3,19,15);rect(c,'#8d9187',10,3,12,5);rect(c,'#61665d',21,10,8,10);rect(c,'#a3a69b',10,5,8,2);rect(c,'#4f6a45',5,8,6,3); });
      make('bush', 26, 24, c => { rect(c,'#26372a',2,9,23,13);rect(c,'#3d5636',4,4,17,14);rect(c,'#4f6a3e',8,3,12,8); for(const [x,y] of [[6,10],[15,7],[18,14],[10,16]] as const) {rect(c,'#a8524f',x,y,3,3);rect(c,'#d98b70',x,y,1,1);} });
      make('glow', 160, 110, c => { const g=c.createRadialGradient(80,55,4,80,55,80);g.addColorStop(0,'rgba(255,170,80,0.55)');g.addColorStop(0.5,'rgba(230,110,40,0.18)');g.addColorStop(1,'rgba(200,80,30,0)');c.fillStyle=g;c.beginPath();c.ellipse(80,55,80,55,0,0,Math.PI*2);c.fill(); });
      make('ground', WORLD, WORLD, c => {
        let seed=7351; const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
        rect(c,'#56654c',0,0,WORLD,WORLD);
        for(let i=0;i<60000;i++) { const x=Math.floor(rand()*WORLD/3)*3,y=Math.floor(rand()*WORLD/3)*3;rect(c,['#5d6d51','#4f5e46','#68775e','#4b5446','#606a58'][i%5] ?? '#5d6d51',x,y,3+(i%3)*2,2); }
        // Rolling hills: lit crests with shadowed southern flanks.
        let hs=911;const hr=()=>{hs=(hs*16807)%2147483647;return hs/2147483647;};
        for(let i=0;i<22;i++){const x=hr()*WORLD,y=700+hr()*(WORLD-700),rx=90+hr()*150,ry=50+hr()*80;if(Math.abs(x-riverX(y))<rx+60)continue;
          c.fillStyle='rgba(28,36,26,0.35)';c.beginPath();c.ellipse(x+14,y+18,rx,ry,0,0,Math.PI*2);c.fill();
          c.fillStyle='#5f6e53';c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
          c.fillStyle='#6a785c';c.beginPath();c.ellipse(x-rx*.15,y-ry*.2,rx*.7,ry*.6,0,0,Math.PI*2);c.fill();
          c.fillStyle='#74816a';c.beginPath();c.ellipse(x-rx*.25,y-ry*.35,rx*.35,ry*.28,0,0,Math.PI*2);c.fill();
          for(let k=0;k<70;k++)rect(c,k%2?'#7c8572':'#4f5b47',Math.floor(x+(hr()-.5)*rx*1.6),Math.floor(y+(hr()-.5)*ry*1.6),2,2);}
        // Untouched wilderness: irregular moss beds, dark soil, scree and lichen — no trails.
        for(let i=0;i<180;i++){const x=rand()*WORLD,y=rand()*WORLD,r=20+rand()*70;const col=['rgba(64,82,52,0.55)','rgba(70,72,62,0.45)','rgba(48,58,42,0.5)','rgba(98,106,86,0.35)'][i%4] ?? '';c.fillStyle=col;c.beginPath();for(let a=0;a<12;a++){const ang=a/12*Math.PI*2,rr=r*(0.6+rand()*0.5);const px=x+Math.cos(ang)*rr,py=y+Math.sin(ang)*rr*0.7;if(a===0)c.moveTo(px,py);else c.lineTo(px,py);}c.closePath();c.fill();}
        for(let i=0;i<1400;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);for(let k=0;k<5;k++)rect(c,k%2?'#7a7e72':'#555a50',x+Math.floor(rand()*14),y+Math.floor(rand()*8),2,2);}
        for(let i=0;i<900;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);rect(c,'#3a2f26',x,y,4+Math.floor(rand()*6),1);rect(c,'#4a3c30',x+1,y+1,3,1);}
        for(let i=0;i<1600;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);rect(c,['#8f9a6e','#a6a37e','#6f7d58'][i%3] ?? '#8f9a6e',x,y,1,1);}
        const river=(color:string,width:number)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(1570,-100);c.bezierCurveTo(1290,650,1750,1000,1580,2150);c.stroke();};
        river('#3b4438',163);river('#7a7c70',148);river('#3f5f63',132);river('#4b7378',110);river('#5c878a',78);
        for(let y=0;y<WORLD;y+=17) {const x=riverX(y);rect(c,'#a3c0bc',x-33+Math.floor(rand()*50),y,10+Math.floor(rand()*20),2);}
        for(let y=0;y<WORLD;y+=9){const x=riverX(y);for(const s of [-1,1])rect(c,rand()<.5?'#8e9087':'#6b6d64',Math.floor(x+s*(68+rand()*8)),y,3,2);}
        for(let i=0;i<2600;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);if(Math.abs(x-riverX(y))<95)continue; rect(c,'#435238',x,y,2,5);rect(c,'#4e5f40',x+3,y-2,2,5);if(i%9===0){rect(c,'#b9b28e',x+1,y-2,2,2);}}
        // Camp forecourt of trampled earth and gravel.
        // Organic trampled patch that fades into the moss instead of a hard oval.
        for(let i=0;i<70;i++){const a=rand()*Math.PI*2,d=Math.sqrt(rand())*110;const x=CAMP.x+Math.cos(a)*d*1.3,y=CAMP.y+10+Math.sin(a)*d*0.75;c.fillStyle=`rgba(98,94,76,${0.5-d/300})`;c.beginPath();c.ellipse(x,y,14+rand()*22,9+rand()*14,rand()*3,0,Math.PI*2);c.fill();}
        for(let i=0;i<220;i++){const a=rand()*Math.PI*2,d=Math.sqrt(rand())*120;rect(c,i%2?'#7b7867':'#4b4a3f',Math.floor(CAMP.x+Math.cos(a)*d*1.3),Math.floor(CAMP.y+10+Math.sin(a)*d*0.75),2,2);}
        // Mountain massif: rock mass, strata, and a dark cliff face at its foot.
        for(let x=0;x<WORLD;x+=4){const e=Math.floor(mEdge(x));
          rect(c,'#2d3529',x,e-2,4,14);
          rect(c,'#5a5f57',x,0,4,e);
          rect(c,'#4a4f48',x,e-46,4,44);
          rect(c,'#3a3e38',x,e-18,4,16);}
        for(let i=0;i<9000;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*560);const e=mEdge(x);if(y>e-50)continue;rect(c,['#6a6f66','#50554d','#757a6e','#4f6345','#626a58'][i%5] ?? '#6a6f66',x,y,2+(i%4),2);}
        for(let i=0;i<260;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*520);if(y>mEdge(x)-60)continue;rect(c,'#7f847a',x,y,14+Math.floor(rand()*26),2);rect(c,'#40443d',x+2,y+2,12+Math.floor(rand()*20),2);}
        for(let x=0;x<WORLD;x+=6+Math.floor(rand()*10)){const e=Math.floor(mEdge(x));rect(c,'#2f332d',x,e-44,2,30+Math.floor(rand()*10));rect(c,'#636860',x+2,e-44,2,18);}
        // Cave mouth carved into the cliff.
        const cy=Math.floor(mEdge(CAMP.x));
        c.fillStyle='#2e322c';c.beginPath();c.ellipse(CAMP.x,cy-6,46,44,0,Math.PI,0);c.fill();rect(c,'#2e322c',CAMP.x-46,cy-8,92,10);
        c.fillStyle='#141713';c.beginPath();c.ellipse(CAMP.x,cy-4,36,36,0,Math.PI,0);c.fill();rect(c,'#141713',CAMP.x-36,cy-6,72,10);
        c.fillStyle='#090a09';c.beginPath();c.ellipse(CAMP.x,cy,24,24,0,Math.PI,0);c.fill();
        for(const [dx,dy,w] of [[-48,-30,8],[40,-34,10],[-30,-50,14],[18,-52,12],[-52,-4,10],[44,-6,9]] as const)rect(c,'#7c8076',CAMP.x+dx,cy+dy,w,4);
        // Warm hearth light pooled on the forecourt.
        c.fillStyle='rgba(180,110,50,0.12)';c.beginPath();c.ellipse(CAMP.x,CAMP.y+30,70,40,0,0,Math.PI*2);c.fill();
        // Shallow fords: lighter water with stepping stones.
        for(const fy of FORDS){if(fy<0||fy>WORLD)continue;const fx=riverX(fy);c.fillStyle='#7d9a92';c.fillRect(fx-62,fy-30,124,60);
          for(let sx=-56;sx<=56;sx+=14){const oy=Math.floor((rand()-.5)*16);rect(c,'#3e4a42',fx+sx-1,fy+oy-4,12,9);rect(c,'#9a9c90',fx+sx,fy+oy-5,10,7);rect(c,'#b8b9ad',fx+sx+2,fy+oy-5,5,2);}}
        // Fade the start region's edges into the surrounding biome layer.
        c.globalCompositeOperation='destination-out';const F=260;
        for(const [x0,y0,x1,y1,rx,ry,rw,rh] of [[0,0,0,F,0,0,WORLD,F],[0,WORLD,0,WORLD-F,0,WORLD-F,WORLD,F],[0,0,F,0,0,0,F,WORLD],[WORLD,0,WORLD-F,0,WORLD-F,0,F,WORLD]] as const){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(rx,ry,rw,rh);}
        c.globalCompositeOperation='source-over';
      });
      // Low-res biome layer for the whole map (4 px texels keep memory small on phones).
      const BS=4,bw=MAP.w/BS,bh=MAP.h/BS;const bt=this.textures.createCanvas('biome',bw,bh);
      if(bt){const ctx=bt.context;const img=ctx.createImageData(bw,bh);let ns=99;const nr=()=>{ns=ns*16807%2147483647;return ns/2147483647;};
        for(let j=0;j<bh;j++){const wy=MAP.y+j*BS;const rx=riverX(wy);const ford=isFord(wy);
          for(let i=0;i<bw;i++){const wx=MAP.x+i*BS;const d=Math.abs(wx-rx);let col:readonly [number,number,number];
            if(d<56)col=ford?[125,154,146]:d<32?[92,135,138]:[75,115,120];else if(d<72)col=[122,124,112];
            else col=BIOME_COLOR[biomeAt(wx+(nr()-.5)*48,wy+(nr()-.5)*48)];
            const n=(nr()-.5)*16,o=(j*bw+i)*4;img.data[o]=col[0]+n;img.data[o+1]=col[1]+n;img.data[o+2]=col[2]+n;img.data[o+3]=255;}}
        ctx.putImageData(img,0,0);bt.refresh();}
      this.add.image(MAP.x,MAP.y,'biome').setOrigin(0).setScale(BS).setDepth(MAP.y-200);
      this.add.image(0,0,'ground').setOrigin(0).setDepth(MAP.y-199);
      this.physics.world.setBounds(MAP.x,MAP.y,MAP.w,MAP.h);
      this.obstacles=this.physics.add.staticGroup();
      const obstacle=(x:number,y:number,key:string,bw:number,bh:number)=> {
        const obj=this.obstacles?.create(x,y,key) as Phaser.Physics.Arcade.Sprite | undefined;
        if(!obj)return undefined;obj.setDepth(y+obj.height/2-6); const body=obj.body as Phaser.Physics.Arcade.StaticBody;body.setSize(bw,bh);body.setOffset((obj.width-bw)/2,obj.height-bh-4);
        return obj;
      };
      const choppable=(x:number,y:number,dir:number)=>{
        const snow=biomeAt(x,y)==='nordics';
        const obj=obstacle(x,y,snow?`snow-tree-${dir%3}`:`tree${dir}`,22,10);if(!obj)return;
        const tint=snow?0xffffff:BIOME_FLORA[biomeAt(x,y)].tint;obj.setTint(tint);
        this.trees.push({x,y,dir,hp:TREE_HP,tint,sprite:obj});
      };
      this.plantTree=choppable;
      const mineable=(x:number,y:number)=>{
        const snow=biomeAt(x,y)==='nordics';
        const key=snow?`snow-rock-${Math.abs(Math.floor(x*7+y*13))%6}`:'rock';
        const obj=obstacle(x,y,key,24,13);if(obj)this.rocks.push({x,y,hp:ROCK_HP,sprite:obj});
      };
      let seed=419;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
      for(let i=0;i<460;i++) {
        const x=40+random()*(WORLD-80),y=40+random()*(WORLD-80);
        if(y<mEdge(x)+40 || Math.abs(x-riverX(y))<130 || Math.hypot(x-CAMP.x,y-CAMP.y)<200)continue;
        // Forest thins toward the camp so the start stays readable.
        if(Math.hypot(x-CAMP.x,y-CAMP.y)<380&&i%3!==0)continue;
        if(i%7===0)mineable(x,y); else choppable(x,y,i%8);
      }
      // Boulders along the cliff foot and flanking the camp.
      for(let x=30;x<WORLD;x+=70+Math.floor(random()*90)){if(Math.abs(x-CAMP.x)<70)continue;mineable(x,mEdge(x)+14+random()*20);}
      for(const [x,y] of [[800,610],[1200,615]] as const) mineable(x,y);
      for(const [x,y] of [[790,770],[1215,775],[900,870],[1110,875]] as const) choppable(x,y,(x+y)%8);
      // Main camp: huts and palisade.
      for(const pc of CAMP_LAYOUT){const o=obstacle(pc.x,pc.y,pc.key,pc.bw,pc.bh);if(o&&pc.flip)o.setFlipX(true);}
      // Outer biomes beyond the start region, density driven by each biome's flora.
      let os=7717;const orr=()=>{os=os*16807%2147483647;return os/2147483647;};
      for(let i=0;i<1800;i++){const x=MAP.x+40+orr()*(MAP.w-80),y=MAP.y+40+orr()*(MAP.h-80);
        if(x>-20&&x<WORLD+20&&y>-20&&y<WORLD+20)continue;if(Math.abs(x-riverX(y))<120)continue;
        if(villageAt(x,y,40))continue;const f=BIOME_FLORA[biomeAt(x,y)],r=orr();if(r<f.rocks*0.4)mineable(x,y);else if(r<f.rocks*0.4+f.trees*0.6)choppable(x,y,i%8);}
      // Nordic villages.
      for(const pc of NORDIC_LAYOUT){
        if(pc.bw === 0){this.add.image(pc.x,pc.y,pc.key).setDepth(pc.y-32);continue;}
        const o=obstacle(pc.x,pc.y,pc.key,pc.bw,pc.bh);if(o&&pc.flip)o.setFlipX(true);
      }
      for (const h of NORDIC_HOUSES) {
        this.villageSupplies.set(h.id, this.add.image(h.x, h.y + 38, h.variant === 0 ? 'spear-proj' : 'res-wood').setScale(h.variant === 0 ? 0.55 : 1).setDepth(h.y + 38));
      }
      // Invisible segmented colliders: river banks and the mountain wall.
      for(let y=MAP.y;y<MAP.y+MAP.h;y+=24){ if(y>=0&&y<=WORLD&&y<mEdge(riverX(y)))continue;if(isFord(y))continue;const zone=this.add.zone(riverX(y),y,115,30);this.physics.add.existing(zone,true);this.obstacles.add(zone); }
      for(let x=0;x<WORLD;x+=16){const e=mEdge(x+8);const zone=this.add.zone(x+8,(e-4)/2,16,e-4);this.physics.add.existing(zone,true);this.obstacles.add(zone);}
      const glow=this.add.image(CAMP.x,CAMP.y+FIRE_DY+6,'glow').setDepth(CAMP.y).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({targets:glow,alpha:{from:.4,to:.6},scale:{from:.95,to:1.06},duration:420,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      obstacle(CAMP.x,CAMP.y+FIRE_DY,'fire',20,8);
      // Sleeping place next to the campfire.
      this.bed=this.add.image(CAMP.x+46,CAMP.y+FIRE_DY+10,'bed').setDepth(CAMP.y+FIRE_DY+16);
      for(const [x,y] of [[1128,700],[895,760],[1160,1170],[700,850],[1240,900],[760,1240],[480,1080],[1340,760],[980,1460]] as const) {
        const sprite=this.add.image(x,y,'bush').setDepth(y+8);this.berries.push({x,y,picked:false,sprite});this.covers.push({x,y});
      }
      // Cover zones: all rock obstacles plus bushes already pushed above.
      this.obstacles.getChildren().forEach(obj => {
        const s = obj as Phaser.Physics.Arcade.Sprite;
        if (s.texture?.key === 'rock' || s.texture?.key.startsWith('snow-rock')) this.covers.push({ x: s.x, y: s.y });
      });
      this.player=this.physics.add.sprite(CAMP.x,CAMP.y-30,'human2').setDepth(CAMP.y).setCollideWorldBounds(true);
      this.player.setTexture('none-idle-2');
      this.player.setSize(10,7).setOffset(11,23);
      this.player.on('animationupdate',(a:Phaser.Animations.Animation, frame:Phaser.Animations.AnimationFrame)=>{if(a.key.startsWith('anim-finisher-') && frame.index === 9)this.landFinisher();});
      this.player.on('animationcomplete',(a:Phaser.Animations.Animation)=>{if(a.key.startsWith('anim-'))this.attacking=false;if(a.key.startsWith('anim-finisher-')){this.finisher=undefined;this.persist();}});
      this.physics.add.collider(this.player,this.obstacles);
      this.cameras.main.setBounds(MAP.x,MAP.y,MAP.w,MAP.h).setZoom(2.6).startFollow(this.player,true,0.07,0.07);
      this.keys=this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,SPACE,Q,F,R,CTRL,C,ONE,TWO,THREE') as Record<string,Phaser.Input.Keyboard.Key>;
      this.input.mouse?.disableContextMenu();
      this.input.on('pointerdown',(ptr:Phaser.Input.Pointer)=>{if(ptr.wasTouch)return;if(ptr.rightButtonDown())this.lockReq=true;else if(ptr.leftButtonDown())this.clickAttack=true;});
      this.game.events.on('blur',()=>{input.x=0;input.y=0;input.sprint=false;});
      // Meat loot texture.
      make('meat', 14, 10, c => { rect(c,'#5a2a26',1,2,12,7);rect(c,'#8a3a30',2,3,10,5);rect(c,'#c25545',4,4,6,3);rect(c,'#efe6c8',6,5,2,1);rect(c,'#2b1510',3,8,8,1); });
      // Target lock marker: bone-white chevron.
      make('lock', 11, 7, c => { rect(c,'#2b1510',0,0,11,2);rect(c,'#2b1510',2,2,7,2);rect(c,'#2b1510',4,4,3,3);rect(c,'#efe2b8',1,0,9,1);rect(c,'#efe2b8',3,2,5,1);rect(c,'#e0a040',5,4,1,2); });
      this.marker=this.add.image(0,0,'lock').setVisible(false);
      // Spawn wildlife at safe, open locations away from camp, mountain and river.
      let wseed = 2131; const wr = () => { wseed = (wseed * 16807) % 2147483647; return wseed / 2147483647; };
      const spawn = (kind: Creature['kind'], x: number, y: number) => {
        const key = `${kind}-idle-2`;
        const s = this.physics.add.sprite(x, y, key).setDepth(y).setCollideWorldBounds(true);
        if (kind === 'tiger') s.setSize(14, 8).setOffset(25, 40);
        else if (kind === 'gazelle') s.setSize(14, 8).setOffset(13, 28);
        else { const b = SNOW[kind].body; s.setSize(b[0], b[1]).setOffset(b[2], b[3]); }
        if (this.obstacles) this.physics.add.collider(s, this.obstacles);
        // Solid bodies: player and animals can't overlap.
        if (this.player) this.physics.add.collider(this.player, s);
        (s.body as Phaser.Physics.Arcade.Body).pushable = false;
        this.creatures.push({ kind, sprite: s, state: 'wander', facing: 2, hp: kind === 'tiger' ? 60 : kind === 'gazelle' ? 30 : SNOW[kind].hp, stateUntil: 0, nextDecision: 0, nextAttack: 0, wanderX: x, wanderY: y });
      };
      const safeSpot = () => {
        for (let t = 0; t < 40; t++) {
          const x = 180 + wr() * (WORLD - 360), y = 180 + wr() * (WORLD - 360);
          if (y < mEdge(x) + 80) continue;
          if (Math.abs(x - riverX(y)) < 180) continue;
          if (Math.hypot(x - CAMP.x, y - CAMP.y) < 420) continue;
          return { x, y };
        }
        return null;
      };
      for (let i = 0; i < 5; i++) { const s = safeSpot(); if (s) spawn('gazelle', s.x, s.y); }
      for (let i = 0; i < 1; i++) { const s = safeSpot(); if (s) spawn('tiger', s.x, s.y); }
      // Snow animals roam only the Nordic mountains, never inside villages or near the river.
      const snowSpot = () => {
        for (let t = 0; t < 80; t++) {
          const x = MAP.x + 120 + wr() * (MAP.w - 240), y = MAP.y + 120 + wr() * (1700);
          if (biomeAt(x, y) !== 'nordics' || villageAt(x, y, 140) || Math.abs(x - riverX(y)) < 160) continue;
          return { x, y };
        }
        return null;
      };
      for (const k of Object.keys(SNOW) as SnowKind[]) {
        if (k === 'wolf') {
          // Two packs of three.
          for (let p = 0; p < SNOW.wolf.count / 3; p++) { const s = snowSpot(); if (s) for (let j = 0; j < 3; j++) spawn('wolf', s.x + (j - 1) * 26, s.y + (j % 2) * 20); }
        } else for (let i = 0; i < SNOW[k].count; i++) { const s = snowSpot(); if (s) spawn(k, s.x, s.y); }
      }
      this.campers = createCampers(this, this.player, this.obstacles);
      for (const camper of this.campers) {
        for (const creature of this.creatures) this.physics.add.collider(camper.sprite, creature.sprite);
      }
      this.folk = createFolk(this, this.obstacles);
      for (const f of this.folk) this.physics.add.collider(f.sprite, this.player, undefined, () => f.c.state === 'free' || f.c.state === 'camp');
      const allies = this.companionActors();
      allies.forEach((ally, i) => { for (const other of allies.slice(i + 1)) this.physics.add.collider(ally.sprite, other.sprite); });
      for (const f of this.folk) for (const camper of this.campers) this.physics.add.collider(f.sprite, camper.sprite, undefined, () => f.c.state === 'free' || f.c.state === 'camp');
      this.carryImg = this.add.image(0, 0, 'nordic-w0', 0).setOrigin(0.5).setVisible(false);
      if (this.textures.exists('night')) this.textures.remove('night');
      this.nightTex = this.textures.createCanvas('night', 64, 64) ?? undefined;
      if (this.nightTex) {
        this.nightTex.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.night = this.add.image(0, 0, 'night').setOrigin(0).setDepth(900000).setVisible(false);
        this.events.on('postupdate', () => this.updateNight());
      }
      if (initial) this.restore(initial);
      // Beim Schließen oder Wegwischen der Seite sofort sichern (visibilitychange ist auf Mobilgeräten am zuverlässigsten).
      const flush = () => this.persist();
      const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', onHide);
      const off = () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onHide); };
      this.events.once('shutdown', off); this.events.once('destroy', off);
    }
    override update(time:number, delta:number) {
      const p=this.player;if(!p)return;
      const controlled = new Set(this.companionOrders.keys());
      tickCampers(this.campers, this.obstacles, time, input.paused || this.dead || this.health <= 0 || this.sleeping, controlled);
      tickFolk(this.folk, this.obstacles, time, input.paused || this.dead || this.health <= 0 || this.sleeping, controlled);
      const blocks: Block[] = (this.obstacles?.getChildren() ?? []).flatMap(o => {
        const body = (o as Phaser.Physics.Arcade.Sprite).body;
        return body ? [{ x: body.x, y: body.y, width: body.width, height: body.height }] : [];
      });
      this.companionMovement.tick(this.companionActors(), this.companionOrders, p, this.lastFacing, time,
        input.paused || this.dead || this.health <= 0 || this.sleeping, !!(input.sprint || this.keys?.['SHIFT']?.isDown) && this.stamina > 1 && !this.carried,
        this.crouching, blocks, this.allyEngage(time, p));
      this.allyStrikes(time);
      this.tribal(time);
      const k=this.keys; let dx=input.x,dy=input.y;
      if(k?.['A']?.isDown||k?.['LEFT']?.isDown)dx=-1;if(k?.['D']?.isDown||k?.['RIGHT']?.isDown)dx=1;
      if(k?.['W']?.isDown||k?.['UP']?.isDown)dy=-1;if(k?.['S']?.isDown||k?.['DOWN']?.isDown)dy=1;
      if(this.dead){
        p.setVelocity(0,0);
        if(input.respawn!==this.lastRespawn){
          this.lastRespawn=input.respawn;this.dead=false;this.health=100;this.stamina=100;this.hunger=Math.max(this.hunger,50);this.warmth=Math.max(this.warmth,80);p.setPosition(CAMP.x,CAMP.y-30);p.anims.stop();p.setTexture(`${this.held}-idle-2`);this.lastFacing=2;
          for(const c of this.creatures)if(c.state==='chase'||c.state==='attack'){c.state='wander';c.alert=0;}
          this.message='Du erwachst am Lagerfeuer';this.messageUntil=time+2400;
        }
        this.report(time,p);return;
      }
      this.lastRespawn=input.respawn;
      if(this.health<=0){
        this.finisher=undefined;this.attackPending=false;this.dead=true;this.attacking=false;this.target=undefined;p.setVelocity(0,0);p.clearTint();p.setAlpha(1);p.anims.timeScale=1;p.play(`anim-death-${this.lastFacing}`);
        this.report(time,p);return;
      }
      if(this.sleeping){this.clock+=SLEEP_CLOCK_PER_SEC*Math.min(delta,100)/1000;}
      else if(!input.paused){
        const dt=Math.min(delta,100)/1000;
        this.clock=advanceClock(this.clock,dt);
        const minutesOfDay=clockOf(this.clock).minutesOfDay;
        const nearWarmth=Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<120;
        this.hunger=tickHunger(this.hunger,dt);
        {const before=this.warmth;const after=tickWarmth(before,{ambient:ambientTemp(biomeAt(p.x,p.y),minutesOfDay),nearFire:nearWarmth,seconds:dt});this.warmth=after<before?before-(before-after)*coldFactor(this.owned,isNight(minutesOfDay)):after;}
        if(this.owned.includes('bandage')&&this.hunger>30&&this.health<100)this.health=Math.min(100,this.health+BANDAGE_HP_PER_SEC*dt);
        this.health=Math.max(0,this.health-survivalDamage(this.hunger,this.warmth,dt));
        if(time>=this.messageUntil){
          if(this.warmth<COLD_WARN&&time>this.nextColdWarn){this.nextColdWarn=time+25000;this.message='Dir ist kalt – such ein Feuer';this.messageUntil=time+2400;}
          else if(this.hunger<HUNGER_WARN&&time>this.nextHungerWarn){this.nextHungerWarn=time+25000;this.message='Dein Magen knurrt – du brauchst Nahrung';this.messageUntil=time+2400;}
        }
      }
      if(input.save!==this.lastSaveReq){this.lastSaveReq=input.save;this.persist();this.message='Spielstand gespeichert';this.messageUntil=time+1800;}
      else if(time-this.lastAutosave>15000){this.lastAutosave=time;this.persist();}
      if(this.finisher){p.setVelocity(0,0);this.lastAttack=input.attack;this.lastAction=input.action;if(input.paused)p.anims.pause();else p.anims.resume();this.report(time,p);return;}
      if(input.craft){const rc=RECIPES.find(x=>x.id===input.craft);const next=rc&&craft(rc,this.stock,levelFromXp(this.xp),this.owned);if(rc&&next){this.stock=next;this.owned=[...this.owned,rc.id];this.message=`${rc.name} hergestellt · +25 EP`;this.messageUntil=time+2400;this.addXp(XP.craft);}input.craft=null;}
      if(input.weapon!==this.weapon){this.weapon=input.weapon==='none'||this.owned.includes(input.weapon)?input.weapon:'none';this.attacking=false;this.attackPending=false;}
      const bedX=this.bed?.x??0,bedY=this.bed?.y??0;
      this.nearBed=Math.hypot(p.x-bedX,p.y-bedY)<34;
      // Sleeping: lie on the bed, fade, restore vitals, wake up.
      if(input.sleep&&!this.sleeping&&this.nearBed){
        this.sleeping=true;p.anims.stop();p.setVelocity(0,0);p.setPosition(bedX,bedY-4);p.setTexture('sleep');
        const cam=this.cameras.main;cam.fadeOut(900,8,6,4);
        this.time.delayedCall(1700,()=>{this.health=100;this.stamina=100;cam.fadeIn(900,8,6,4);});
        this.time.delayedCall(3200,()=>{this.sleeping=false;input.sleep=false;this.hunger=Math.max(5,this.hunger-SLEEP_HUNGER_COST);this.warmth=Math.max(this.warmth,90);p.setPosition(bedX,bedY+18);const grown=this.regrowTrees();this.message=grown===1?'Ausgeschlafen · ein Baum ist nachgewachsen':grown>1?`Ausgeschlafen · ${grown} Bäume sind nachgewachsen`:'Ausgeschlafen · voll erholt';this.messageUntil=this.time.now+2400;this.persist();});
      }
      if(input.sleep&&!this.nearBed&&!this.sleeping)input.sleep=false;
      if(this.sleeping){p.setVelocity(0,0);p.setDepth(bedY+20);this.report(time,p);return;}
      if(input.paused||this.attacking){dx=0;dy=0;}
      const moving=Math.hypot(dx,dy)>0.12;const running=!this.carried&&moving&&(input.sprint||k?.['SHIFT']?.isDown)&&this.stamina>1;
      // Ducken als Umschalter: einmal drücken = ducken, erneut drücken = aufstehen.
      const cKey=k?.['C'],ctrlKey=k?.['CTRL'];
      if((cKey&&Phaser.Input.Keyboard.JustDown(cKey))||(ctrlKey&&Phaser.Input.Keyboard.JustDown(ctrlKey)))this.crouchOn=!this.crouchOn;
      if(running||this.attacking)this.crouchOn=false;
      this.crouching=!running&&!this.attacking&&(this.crouchOn||input.crouch);
      const speed=running?105:this.crouching?34:this.carried?CARRY_SPEED:65; const len=Math.max(1,Math.hypot(dx,dy));p.setVelocity(dx/len*speed,dy/len*speed);
      this.stamina=Phaser.Math.Clamp(this.stamina+(running?-22:13)*Math.min(delta,50)/1000,0,100);
      const w=this.held;
      // Lock-on (F): cycle to the nearest living animal within range.
      const fKey=k?.['F'];
      const lockNow=this.lockReq||(fKey&&Phaser.Input.Keyboard.JustDown(fKey));this.lockReq=false;
      if(!input.paused&&lockNow){
        const cands=this.creatures.filter(c=>c.state!=='dead'&&c!==this.target&&Math.hypot(c.sprite.x-p.x,c.sprite.y-p.y)<260).sort((a,b)=>Math.hypot(a.sprite.x-p.x,a.sprite.y-p.y)-Math.hypot(b.sprite.x-p.x,b.sprite.y-p.y));
        this.target=cands[0];
        if(this.target&&this.owned.includes('bola')){this.target.slowUntil=time+BOLA_MS;}
        this.message=this.target?`${NAME[this.target.kind]} anvisiert${this.owned.includes('bola')?' · Bola trifft!':''}`:'Kein Tier in Sicht';this.messageUntil=time+1400;
      }
      // Throw (R): spear only, needs a locked target and the spear in hand.
      const rKey=k?.['R'];
      if(!input.paused&&!this.attacking&&rKey&&Phaser.Input.Keyboard.JustDown(rKey)){
        if(w!=='spear'){this.message='Rüste den Steinspeer aus zum Werfen';}
        else if(!this.hasSpear){this.message='Dein Speer liegt noch im Gras';}
        else if(!this.target){this.message='Erst ein Ziel anvisieren [Rechtsklick]';}
        else{
          const t=this.target;this.lastFacing=(Math.round(Math.atan2(t.sprite.y-p.y,t.sprite.x-p.x)/(Math.PI/4))+8)%8;
          this.attacking=true;p.setVelocity(0,0);p.anims.timeScale=1;p.play(`anim-spear-attack-${this.lastFacing}`);
          this.hasSpear=this.owned.includes('bundle');
          const img=this.add.image(p.x,p.y-8,'spear-proj').setScale(0.5);
          this.spear={img,target:t,tx:t.sprite.x,ty:t.sprite.y};
          this.message='Speer geworfen!';
        }
        this.messageUntil=time+1400;
      }
      const qKey=k?.['Q'];
      const keyAttack=(qKey&&Phaser.Input.Keyboard.JustDown(qKey))||this.clickAttack;this.clickAttack=false;
      if(this.carried&&(input.attack!==this.lastAttack||keyAttack)){this.lastAttack=input.attack;this.message='Hände voll · erst absetzen [E]';this.messageUntil=time+1400;}
      else if(!input.paused&&!this.attacking&&(input.attack!==this.lastAttack||keyAttack)){
        this.lastAttack=input.attack;
        const downed=this.folk.filter(f=>f.c.state==='free'&&canFinish(f.combat,Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y),this.held==='wedge',false)).sort((a,b)=>Phaser.Math.Distance.Between(p.x,p.y,a.sprite.x,a.sprite.y)-Phaser.Math.Distance.Between(p.x,p.y,b.sprite.x,b.sprite.y))[0];
        if(downed&&this.startFinisher(downed)){this.report(time,p);return;}
        this.attacking=true;this.attackPending=true;p.setVelocity(0,0);
        if(this.target)this.lastFacing=(Math.round(Math.atan2(this.target.sprite.y-p.y,this.target.sprite.x-p.x)/(Math.PI/4))+8)%8;
        p.anims.timeScale=1;p.play(`anim-${w}-attack-${this.lastFacing}`);
      } else if(input.attack!==this.lastAttack)this.lastAttack=input.attack;
      if(this.attacking){/* attack animation plays out; facing stays locked */}
      else if(this.crouching) {
        if(moving)this.lastFacing=(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
        else if(this.target)this.lastFacing=(Math.round(Math.atan2(this.target.sprite.y-p.y,this.target.sprite.x-p.x)/(Math.PI/4))+8)%8;
        const ck=`anim-crouch-${this.lastFacing}`;
        if(moving){if(p.anims.currentAnim?.key!==ck||!p.anims.isPlaying)p.play(ck);}
        else{p.anims.stop();p.setTexture(`crouch-${this.lastFacing}`,4);}
      }
      else if(moving) {
        const angle=Math.atan2(dy,dx);this.lastFacing=(Math.round(angle/(Math.PI/4))+8)%8;
        const animKey=`${w}-walk-${this.lastFacing}`;
        if(p.anims.currentAnim?.key!==animKey||!p.anims.isPlaying)p.play(animKey);
        p.anims.timeScale=running?1.5:1;
      } else {
        if(this.target)this.lastFacing=(Math.round(Math.atan2(this.target.sprite.y-p.y,this.target.sprite.x-p.x)/(Math.PI/4))+8)%8;
        p.anims.stop();
        p.setTexture(`${w}-idle-${this.lastFacing}`);
      }
      p.setDepth(p.y);
      if(this.carried&&this.carryImg){
        // Bound captive lies across the shoulders and bobs with the walk cycle.
        const side=[0,1,7,6].includes(this.lastFacing)?0:4;
        const bob=p.anims.isPlaying?(p.anims.currentFrame?.index??0)%2:0;
        this.carryImg.setTexture(this.carried.t.tex,boundFrame(this.carried.t,side)).setPosition(p.x,p.y-13+bob).setDepth(this.lastFacing===6||this.lastFacing===5||this.lastFacing===7?p.y-1:p.y+1).setVisible(true);
      }
      const eatKey:Food|null=k?.['ONE']&&Phaser.Input.Keyboard.JustDown(k['ONE'])?'berries':k?.['TWO']&&Phaser.Input.Keyboard.JustDown(k['TWO'])?'meat':k?.['THREE']&&Phaser.Input.Keyboard.JustDown(k['THREE'])?'cooked':null;
      const food=input.eat??eatKey;input.eat=null;
      if(food&&!this.dead&&!this.sleeping){const r=eat(this.pantry(),food);
        if(r){this.setPantry(r);this.healPulse++;this.message=`${FOOD[food].name} gegessen · +${FOOD[food].heal} Leben`;}
        else this.message=this.pantry()[food]<=0?`Keine ${FOOD[food].name} im Beutel`:'Du bist schon satt';
        this.messageUntil=time+2000;}
      const actionKey=k?.['E'],spaceKey=k?.['SPACE'];
      const keyboardAction=(actionKey&&Phaser.Input.Keyboard.JustDown(actionKey))||(spaceKey&&Phaser.Input.Keyboard.JustDown(spaceKey));
      if(!input.paused&&!this.attacking&&(input.action!==this.lastAction||keyboardAction)){
        this.lastAction=input.action;
        const downed=this.folk.find(f=>f.c.state==='free'&&canFinish(f.combat,Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y),w==='wedge',false));
        if(downed&&this.startFinisher(downed)){this.report(time,p);return;}
        const knocked=this.folk.find(f=>f.c.state==='free'&&f.combat.phase==='downed'&&f.t.captive&&Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y)<30);
        if(knocked){knocked.combat=newFighter();knocked.c={...knocked.c,state:'surrender'};poseFolk(knocked);}
        const berry=this.berries.find(b=>!b.picked&&Math.hypot(p.x-b.x,p.y-b.y)<65);
        const meat=this.meatPickups.find(m=>Math.hypot(p.x-m.x,p.y-m.y)<32);
        const res=this.resPickups.find(r=>Math.hypot(p.x-r.x,p.y-r.y)<30);
        const sg=this.spearOnGround&&Math.hypot(p.x-this.spearOnGround.x,p.y-this.spearOnGround.y)<34?this.spearOnGround:undefined;
        const house = NORDIC_HOUSES.find(h => Math.hypot(p.x-h.x,p.y-h.y-38)<28);
        const captive = this.carried ? undefined : this.folk.find(f=>(f.c.state==='surrender'||f.c.state==='bound')&&Math.hypot(p.x-f.sprite.x,p.y-f.sprite.y)<30);
        if(this.carried){
          const f=this.carried;const inCamp=Math.hypot(p.x-CAMP.x,p.y-CAMP.y-50)<130;
          f.c=drop(f.c,p.x,p.y+6,inCamp);this.carried=undefined;this.carryImg?.setVisible(false);poseFolk(f);
          this.message=inCamp?'Willkommen im Stamm! Die Gefangene gehört jetzt zu euch':'Gefangene abgesetzt · [E] wieder aufheben';
          this.persist();
        }
        else if(captive){
          const was=captive.c.state;captive.c=interact(captive.c,false);
          if(was==='surrender'){captive.c={...captive.c,x:Math.round(captive.sprite.x),y:Math.round(captive.sprite.y)};this.message='Gefesselt · [E] auf die Schultern nehmen';}
          else{this.carried=captive;this.message='Auf den Schultern · bring sie ins Höhlenlager';}
          poseFolk(captive);
        }
        else if(this.nearBed){input.sleep=true;this.message='Du legst dich schlafen …';}
        else if(sg){sg.img.destroy();this.spearOnGround=undefined;this.hasSpear=true;this.message='Speer aufgehoben';}
        else if(meat){meat.sprite.destroy();this.meatPickups=this.meatPickups.filter(m=>m!==meat);this.meat++;this.message='Fleisch aufgehoben · +1';}
        else if(res){res.sprite.destroy();this.resPickups=this.resPickups.filter(r=>r!==res);{const n=pickupAmount(this.owned);for(let i=0;i<n;i++)this.stock=gain(this.stock,res.kind);this.message=`${RESOURCE_NAME[res.kind]} aufgehoben · +${n}`;}}
        else if(house){
          const next = lootHouse({ stock:this.stock, berries:this.count, meat:this.meat, cooked:this.cooked, owned:this.owned, lootedHouses:this.lootedHouses }, house.id);
          if(next){
            const weapon = next.owned.find(id => !this.owned.includes(id));
            this.stock=next.stock;this.count=next.berries;this.meat=next.meat;this.cooked=next.cooked;this.owned=next.owned;this.lootedHouses=next.lootedHouses;
            this.villageSupplies.get(house.id)?.destroy();this.villageSupplies.delete(house.id);
            const name = weapon === 'spear' ? 'Steinspeer' : weapon === 'club' ? 'Holzkeule' : 'Steinaxt';
            this.message=`${house.village} · +4 Holz, +3 Stein, +2 Fasern, +1 Feuerstein · +3 Beeren, +1 Fleisch, +2 Gebratenes${weapon ? ` · ${name}` : ''}`;
            this.persist();
          } else this.message='Dieses Haus ist bereits durchsucht';
        }
        else if(berry){berry.picked=true;berry.sprite.setTint(0x849461);this.count++;this.message='Beeren gesammelt · +1';this.messageUntil=time+2400;if(this.addXp(XP.berry))return this.report(time,p);}
        else if(Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<70){const r=roast(this.pantry());if(r){this.setPantry(r);this.message='Fleisch gebraten · [3] essen';this.messageUntil=time+2400;if(this.addXp(XP.roast))return this.report(time,p);}else{this.stamina=100;this.message='Am Feuer ausgeruht';}}
        else if(p.y<CAMP.y-20&&Math.abs(p.x-CAMP.x)<60)this.message='Die Sippenhöhle – hier bist du sicher';
        else this.message='Hier gibt es nichts zu sammeln';
        this.messageUntil=time+2400;
      }
      this.tickWildlife(time, delta, p);
      this.report(time,p);
    }
    // Bäume fällen und Felsen abbauen mit der Steinaxt (normale Schlag-Animation).
    chop(time: number, fx: number, fy: number) {
      const p = this.player; if (!p) return;
      const inCone = (x: number, y: number, r: number) => { const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy); return d < r && (dx * fx + dy * fy) / Math.max(0.1, d) > 0.3; };
      const tree = this.trees.find(t => inCone(t.x, t.y, 48));
      if (tree) {
        if (this.held !== 'axe') { this.message = 'Dafür brauchst du die Steinaxt'; this.messageUntil = time + 1600; return; }
        tree.hp--;
        tree.sprite.setTint(0xffe0b0);
        this.time.delayedCall(120, () => { if (tree.sprite.active) tree.sprite.setTint(tree.tint); });
        if (tree.hp <= 0) {
          this.trees = this.trees.filter(t => t !== tree);
          const { x, y, dir } = tree;
          tree.sprite.destroy();
          // Baum verschwindet komplett; Position wird nur zum Nachwachsen gemerkt.
          this.stumps.push({ x, y, dir });
          this.dropResources(x, y, TREE_DROP);
          this.message = 'Baum gefällt! · +15 EP';
          this.messageUntil = time + 2200;
          this.addXp(XP.tree);
        } else { this.message = 'Der Baum wankt …'; this.messageUntil = time + 1200; }
        return;
      }
      const rock = this.rocks.find(r => inCone(r.x, r.y, 44));
      if (rock) {
        if (this.held !== 'axe') { this.message = 'Dafür brauchst du die Steinaxt'; this.messageUntil = time + 1600; return; }
        rock.hp--;
        rock.sprite.setTint(0xffe0b0);
        this.time.delayedCall(120, () => { if (rock.sprite.active) rock.sprite.clearTint(); });
        if (rock.hp <= 0) {
          this.rocks = this.rocks.filter(r => r !== rock);
          this.minedRocks.push([rock.x, rock.y]);
          this.covers = this.covers.filter(c => Math.hypot(c.x - rock.x, c.y - rock.y) > 1);
          rock.sprite.destroy();
          this.dropResources(rock.x, rock.y, ROCK_DROP);
          this.message = 'Fels zertrümmert · +15 EP';
          this.messageUntil = time + 2200;
          this.addXp(XP.rock);
        } else { this.message = 'Der Fels bröckelt …'; this.messageUntil = time + 1200; }
      }
    }
    dropResources(x: number, y: number, drop: Partial<Record<Resource, number>>) {
      let i = 0;
      for (const [res, n] of Object.entries(drop) as [Resource, number][]) {
        for (let k = 0; k < n; k++) {
          const a = i * 2.4 + 0.7, d = 14 + (i % 3) * 8;
          const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
          const sprite = this.add.image(px, py, `res-${res}`).setDepth(py);
          this.resPickups.push({ kind: res, x: px, y: py, sprite });
          i++;
        }
      }
    }
    /** Nach dem Schlafen wachsen alle Stümpfe zu neuen Bäumen nach; gibt die Anzahl zurück. */
    regrowTrees(): number {
      const grown = this.stumps.length;
      for (const s of this.stumps) {
        s.sprite?.destroy();
        this.plantTree?.(s.x, s.y, s.dir);
      }
      this.stumps = [];
      return grown;
    }
    /** Nearby villager for the interaction wheel, NPC reactions (icons, fleeing, guards) and wheel choices. */
    tribal(time: number) {
      const p = this.player; if (!p) return;
      const now = Date.now();
      const req = input.interaction; input.interaction = null;
      if (req) { if (!this.applyAllyInteraction(req.target, req.id, time)) { const f = this.folk.find(o => o.c.id === req.target); if (f) this.applyInteraction(f, req.id, time); } }
      const stop = input.paused || this.dead || this.sleeping || this.health <= 0;
      const inside = !!villageAt(p.x, p.y);
      let best: Folk | undefined, bd = INTERACTION_RANGE;
      for(const f of this.folk){if(f===this.finisher||f.combat.phase!=='downed'||f.c.state!=='free')continue;if(stop){f.combat.downUntil+=Math.min(this.game.loop.delta,100);continue;}const recovered=recoverFighter(f.combat,time);if(recovered!==f.combat){f.combat=recovered;poseFolk(f);this.armFolk(f,time);}}
      const armedFolk = this.folk.filter(o => o.combat.phase === 'ready' && o.c.state === 'free' && (this.folkMood.get(o.c.id)?.armedUntil ?? 0) > time);
      for (const f of this.folk) {
        if (f.c.state === 'carried' || f.combat.phase === 'dead') {this.folkMood.get(f.c.id)?.icon.setVisible(false);this.folkMood.get(f.c.id)?.weapon?.setVisible(false);continue;}
        if(f.combat.phase==='downed'){this.folkMood.get(f.c.id)?.icon.setVisible(false);this.folkMood.get(f.c.id)?.weapon?.setVisible(false);continue;}
        const s = f.sprite, d = Math.hypot(p.x - s.x, p.y - s.y);
        if (d < bd) { bd = d; best = f; }
        let m = this.folkMood.get(f.c.id);
        if (!m) { m = { icon: this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ffe08a', stroke: '#1c1712', strokeThickness: 3 }).setOrigin(0.5, 1).setResolution(3), next: 0 }; this.folkMood.set(f.c.id, m); }
        const v = VILLAGES[f.t.village], vk = villageKey(v.name);
        // Villagers who saw an attack draw their weapons and hunt the player for a while.
        const armed = f.c.state === 'free' && (m.armedUntil ?? 0) > time;
        if (!armed) m.weapon?.setVisible(false);
        if (armed && !stop) {
          const s2 = f.sprite, dx = p.x - s2.x, dy = p.y - s2.y;
          if (!m.weapon) m.weapon = this.add.image(0, 0, f.seed % 2 ? 'folk-axe' : 'spear-proj').setScale(0.45);
          const inRange = Math.hypot(s2.x - v.x, s2.y - v.y) < v.r * 1.4;
          const idx = armedFolk.indexOf(f), n = armedFolk.length;
          const lunging = idx === lungeIndex(n, time);
          // Non-lunging fighters hold a ring slot and circle; the lunger closes in to strike.
          const goal = lunging ? { x: p.x, y: p.y } : flankSlot(idx, n, p, 34, time, f.seed);
          const sep = separation(s2, armedFolk.filter(o => o !== f).map(o => o.sprite), 26);
          let gx = goal.x - s2.x + sep.x * 40, gy = goal.y - s2.y + sep.y * 40;
          const gl = Math.hypot(gx, gy);
          f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
          if (gl > 4 && inRange && !(lunging && d <= 15)) {
            const spd = lunging ? 72 : 52; gx /= gl; gy /= gl;
            s2.setVelocity(gx * spd, gy * spd); s2.play(`${f.t.tex}-walk-${f.facing}`, true);
          } else { s2.setVelocity(0, 0); s2.anims.stop(); s2.setFrame(f.facing); }
          const left = dx < 0, swing = (m as { swingUntil?: number }).swingUntil ?? 0;
          if (lunging && d <= 19 && time > this.lastDamage + 900) {
            this.health = Math.max(0, this.health - (f.t.captive ? 5 : 7)); this.hitFlash = time + 200; this.lastDamage = time;
            (m as { swingUntil?: number }).swingUntil = time + 220;
            this.bleed(p.x, p.y, dx / Math.max(1, d), dy / Math.max(1, d), 6);
            this.message = f.t.captive ? 'Ein Dorfbewohner schlägt mit seiner Waffe zu!' : 'Eine Wache schlägt zu!'; this.messageUntil = time + 1400;
          }
          const sw = time < swing ? 1.2 : 0;
          m.weapon.setVisible(true).setFlipX(left).setPosition(s2.x + (left ? -7 : 7), s2.y - 2).setRotation((left ? -1 : 1) * (0.5 + sw)).setDepth(s2.y + 1);
          m.icon.setText('⚔').setPosition(s2.x, s2.y - 14).setDepth(s2.y + 2000).setVisible(true);
          s2.setDepth(s2.y);
          if (d > 260 || !inRange && d > 120) m.armedUntil = 0;
          continue;
        }
        if (f.c.state !== 'free' || d > 160) { m.dec = undefined; m.icon.setVisible(false); continue; }
        if (time > m.next) {
          m.next = time + 400;
          m.dec = decideReaction({ relationship: getPersonalRelationship(this.rel, f.c.id, vk), armed: this.held !== 'none', crouching: this.crouching, carryingCaptive: !!this.carried, night: isNight(clockOf(this.clock).minutesOfDay), witnessedCrime: false, insideVillage: inside, alarmActive: isAlarmActive(this.rel, vk, now), role: f.t.captive ? 'villager' : 'guard' });
          if (m.dec.shouldRaiseAlarm) { this.rel = raiseAlarm(this.rel, vk, now); this.message = `${v.name} schlägt Alarm!`; this.messageUntil = time + 1800; }
        }
        const dec = m.dec; if (!dec) continue;
        m.icon.setText(dec.icon === 'none' ? '' : dec.icon).setPosition(s.x, s.y - 14).setDepth(s.y + 2000).setVisible(dec.icon !== 'none');
        if (stop) continue;
        const dx = p.x - s.x, dy = p.y - s.y, len = Math.max(1, d);
        const home = Math.hypot(s.x - v.x, s.y - v.y) < v.r;
        const face = (vx: number, vy: number) => { f.facing = (Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8; s.play(`${f.t.tex}-walk-${f.facing}`, true); };
        if (dec.shouldAttack && !f.t.captive) {
          // Guards close in and strike; they never leave their village.
          if (d > 16 && home) { s.setVelocity(dx / len * 55, dy / len * 55); face(dx, dy); }
          else { s.setVelocity(0, 0); if (d <= 18 && time > this.lastDamage + 1100) { this.health = Math.max(0, this.health - 6); this.hitFlash = time + 200; this.lastDamage = time; this.message = 'Eine Wache schlägt zu!'; this.messageUntil = time + 1400; } }
        } else if ((dec.shouldFlee || dec.state === 'hostile') && home) { s.setVelocity(-dx / len * 45, -dy / len * 45); face(-dx, -dy); }
        s.setDepth(s.y);
      }
      if (best && !this.carried) {
        const f = best, st = f.c.state, vk = villageKey(VILLAGES[f.t.village].name);
        this.talk = {
          id: f.c.id, name: st === 'camp' ? 'Stammesmitglied' : `Bewohner von ${VILLAGES[f.t.village].name}`,
          target: st === 'camp' ? 'ally' : st === 'surrender' || st === 'bound' ? 'captive' : f.t.captive ? 'villager' : 'guard',
          targetRole: f.t.captive ? 'villager' : 'guard', relationship: getPersonalRelationship(this.rel, f.c.id, vk),
          hasGift: this.count > 0 || this.stock.flint > 0, hasTradeGoods: this.stock.flint > 0 || this.stock.fiber >= 2,
          targetDefeated: st === 'surrender' || st === 'bound', targetBound: st === 'bound', targetCarried: false, isOwnTribe: st === 'camp', inRange: true,
        };
      } else this.talk = null;
      const ally = this.companionActors().filter(a => Math.hypot(a.sprite.x - p.x, a.sprite.y - p.y) <= INTERACTION_RANGE)
        .sort((a, b) => Math.hypot(a.sprite.x - p.x, a.sprite.y - p.y) - Math.hypot(b.sprite.x - p.x, b.sprite.y - p.y))[0];
      if (!this.carried && ally && (!best || Math.hypot(ally.sprite.x - p.x, ally.sprite.y - p.y) <= bd)) this.talk = this.allyContext(ally);
    }
    /** Live foes as engine-free records; creature ids are their index, folk ids their captive id. */
    allyFoes(): (Foe & { ref: Creature | Folk })[] {
      return [
        ...this.creatures.map((c, i) => ({ id: 'c' + i, x: c.sprite.x, y: c.sprite.y, alive: c.state !== 'dead' && c.sprite.active, hostile: c.state === 'chase' || c.state === 'attack', ref: c as Creature | Folk })),
        ...this.folk.map(f => ({ id: 'f' + f.c.id, x: f.sprite.x, y: f.sprite.y, alive: f.c.state === 'free' && f.combat.phase === 'ready',
          hostile: (this.folkMood.get(f.c.id)?.armedUntil ?? 0) > this.time.now, ref: f as Creature | Folk })),
      ];
    }
    allyTarget?: Foe & { ref: Creature | Folk };
    allyEngage(time: number, p: Phaser.Physics.Arcade.Sprite) {
      const goals = new Map<string, { x: number; y: number }>();
      const following = this.companionActors().filter(a => this.companionOrders.get(a.id)?.mode === 'follow').sort((a, b) => a.id.localeCompare(b.id));
      const t = this.dead || this.sleeping || this.carried ? undefined : pickAllyTarget(this.allyFoes(), p, this.allyFocus) as (Foe & { ref: Creature | Folk }) | undefined;
      if (!t) this.allyFocus = undefined;
      this.allyTarget = t;
      if (t) following.forEach((a, i) => goals.set(a.id, flankSlot(i + 1, following.length + 1, t, ALLY_REACH - 4, time, 1.7)));
      for (const a of following) {
        let g = this.allyGear.get(a.id);
        if (!g) { g = { img: this.add.image(0, 0, companionWeapon(a.id) === 'spear' ? 'spear' : 'axe').setScale(0.5), next: 0, swingUntil: 0 }; this.allyGear.set(a.id, g); }
        const left = t ? t.x < a.sprite.x : a.facing >= 3 && a.facing <= 5, sw = time < g.swingUntil ? 1.2 : 0;
        g.img.setVisible(!!t).setFlipX(left).setPosition(a.sprite.x + (left ? -7 : 7), a.sprite.y - 2).setRotation((left ? -1 : 1) * (0.5 + sw)).setDepth(a.sprite.y + 1);
      }
      for (const [id, g] of this.allyGear) if (this.companionOrders.get(id)?.mode !== 'follow') g.img.setVisible(false);
      return goals;
    }
    allyStrikes(time: number) {
      const t = this.allyTarget; if (!t || input.paused) return;
      for (const a of this.companionActors()) {
        const g = this.allyGear.get(a.id); if (!g || this.companionOrders.get(a.id)?.mode !== 'follow') continue;
        const dx = t.ref.sprite.x - a.sprite.x, dy = t.ref.sprite.y - a.sprite.y, d = Math.hypot(dx, dy);
        if (d > ALLY_REACH + 6 || time < g.next) continue;
        g.next = time + ALLY_STRIKE_MS + Math.random() * 300; g.swingUntil = time + 220;
        const fx = dx / Math.max(1, d), fy = dy / Math.max(1, d);
        const dir = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8; a.face(dir);
        if ('kind' in t.ref) { if (t.ref.state !== 'dead') this.hurt(t.ref, ALLY_DAMAGE, fx, fy, time); }
        else {
          const f = t.ref; if (f.combat.phase !== 'ready' || f.c.state !== 'free') continue;
          f.combat = hitFighter(f.combat, ALLY_DAMAGE, time); this.armFolk(f, time); this.bleed(f.sprite.x, f.sprite.y, fx, fy, 8);
          if (f.combat.phase === 'downed') { poseFolk(f); this.message = 'Dein Jagdtrupp hat einen Gegner niedergeschlagen'; this.messageUntil = time + 1800; }
        }
      }
    }
    followingCount() { return [...this.companionOrders.values()].filter(o => o.mode === 'follow').length; }
    companionActors(): CompanionActor[] {
      return [
        ...this.campers.map(c => ({ id: c.template.id, sprite: c.sprite, texture: c.template.id,
          home: { x: c.template.x, y: c.template.y }, facing: c.facing, face: (d: number) => { c.facing = d; } })),
        ...this.folk.filter(f => f.c.state === 'camp' && f.combat.phase === 'ready').map(f => ({ id: f.c.id, sprite: f.sprite, texture: f.t.tex,
          home: { x: 940 + this.folk.indexOf(f) % 4 * 38, y: 735 }, facing: f.facing, face: (d: number) => { f.facing = d; } })),
      ];
    }
    allyContext(a: CompanionActor): TalkTarget {
      return { id: a.id, name: 'Stammesmitglied', target: 'ally', targetRole: 'villager', relationship: 100,
        hasGift: this.count > 0, hasTradeGoods: false, targetDefeated: false, targetBound: false,
        targetCarried: false, isOwnTribe: true, inRange: true, following: this.companionOrders.get(a.id)?.mode === 'follow', companionCount: this.followingCount() };
    }
    applyAllyInteraction(target: string, id: InteractionId, time: number): boolean {
      const actor = this.companionActors().find(a => a.id === target); if (!actor) return false;
      const p = this.player;
      if (!p || this.dead || this.health <= 0 || this.sleeping || Math.hypot(actor.sprite.x - p.x, actor.sprite.y - p.y) > INTERACTION_RANGE) return true;
      const option = getAvailableInteractions(this.allyContext(actor)).find(o => o.id === id);
      if (!option || option.disabled) return true;
      if (id === 'follow' || id === 'wait' || id === 'return') {
        if (id === 'follow' && !canRecruit(true, this.followingCount(), this.companionOrders.get(target)?.mode === 'follow')) return true;
        this.companionOrders.set(target, { id: target, mode: id, x: actor.sprite.x, y: actor.sprite.y });
        actor.sprite.setVelocity(0, 0); this.companionMovement.reset(target);
        this.message = id === 'follow' ? `Begleitet dich · Jagdtrupp ${this.followingCount()}/${MAX_COMPANIONS}` : id === 'wait' ? 'Wartet hier auf dich' : 'Kehrt zum Höhlenlager zurück';
      } else if (id === 'feed') {
        const o = resolveInteraction(id, { state: 'camp', capturable: false, relationship: 100, goods: { berries: this.count, cooked: this.cooked, flint: this.stock.flint, fiber: this.stock.fiber } });
        this.count = o.goods.berries; this.cooked = o.goods.cooked; this.message = o.message;
      } else return true;
      this.messageUntil = time + 2200; this.persist(); return true;
    }
    /** Every free villager of f's village who can see f draws a weapon (f itself only if it is still free). */
    armFolk(f: Folk, time: number) {
      for (const o of this.folk) {
        if (o.combat.phase !== 'ready' || o.c.state !== 'free' || o.t.village !== f.t.village) continue;
        if (o !== f && Math.hypot(o.sprite.x - f.sprite.x, o.sprite.y - f.sprite.y) > 200) continue;
        const m = this.folkMood.get(o.c.id); if (m) m.armedUntil = time + 25000;
      }
    }
    applyInteraction(f: Folk, id: InteractionId, time: number) {
      const p=this.player;if(!p||Math.hypot(p.x-f.sprite.x,p.y-f.sprite.y)>INTERACTION_RANGE||f.combat.phase!=='ready')return;
      if(id==='attack'){if(f.c.state==='free'&&!input.paused&&!this.attacking){this.lastFacing=(Math.round(Math.atan2(f.sprite.y-p.y,f.sprite.x-p.x)/(Math.PI/4))+8)%8;this.attacking=true;this.attackPending=true;p.setVelocity(0,0);p.play(`anim-${this.held}-attack-${this.lastFacing}`);}return;}
      const vk = villageKey(VILLAGES[f.t.village].name);
      const o = resolveInteraction(id, { state: f.c.state, capturable: f.t.captive, relationship: getPersonalRelationship(this.rel, f.c.id, vk), goods: { berries: this.count, cooked: this.cooked, flint: this.stock.flint, fiber: this.stock.fiber } });
      if (o.carry && this.carried) { this.message = 'Du trägst schon jemanden'; this.messageUntil = time + 1600; return; }
      this.count = o.goods.berries; this.cooked = o.goods.cooked; this.stock.flint = o.goods.flint; this.stock.fiber = o.goods.fiber;
      if (o.rel && f.c.state !== 'camp') this.rel = changeVillageRelationship(changePersonalRelationship(this.rel, f.c.id, o.rel, vk), vk, o.rel);
      if (o.alarm) this.rel = raiseAlarm(this.rel, vk, Date.now());
      if (o.state !== f.c.state) {
        f.c = { ...f.c, state: o.state, x: Math.round(f.sprite.x), y: Math.round(f.sprite.y) };
        if (o.carry) this.carried = f;
        poseFolk(f);
      }
      this.message = o.message; this.messageUntil = time + 2200;
      this.persist();
    }
    startFinisher(f:Folk):boolean {
      const p=this.player;
      if(!p||this.attacking||this.carried||input.paused||!canFinish(f.combat,Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y),this.held==='wedge',f.c.state!=='free'))return false;
      const angle=Math.atan2(f.sprite.y-p.y,f.sprite.x-p.x);
      this.lastFacing=(Math.round(angle/(Math.PI/4))+8)%8;
      this.target=undefined;this.finisher=f;this.attacking=true;this.attackPending=false;this.crouchOn=false;
      p.setPosition(f.sprite.x-Math.cos(angle)*14,f.sprite.y-Math.sin(angle)*14).setVelocity(0,0).setDepth(f.sprite.y+1);
      p.anims.timeScale=1;p.play(`anim-finisher-${this.lastFacing}`);
      this.message='Finisher!';this.messageUntil=this.time.now+1800;return true;
    }
    landFinisher(){
      const f=this.finisher,p=this.player;if(!f||!p||this.dead||f.combat.phase!=='downed')return;
      f.combat=finishFighter(f.combat);poseFolk(f);this.armFolk(f,this.time.now);
      this.bleed(f.sprite.x,f.sprite.y,Math.cos(this.lastFacing*Math.PI/4),Math.sin(this.lastFacing*Math.PI/4),18);
      const vk=villageKey(VILLAGES[f.t.village].name);this.rel=changeVillageRelationship(raiseAlarm(this.rel,vk,Date.now()),vk,-35);
      this.message='Gegner besiegt';this.messageUntil=this.time.now+2200;this.persist();
    }
    /** Pixel blood: droplets fly in hit direction, then leave fading stains on the ground. */
    bleed(x: number, y: number, dx: number, dy: number, n: number) {
      const reds = [0x8a0f0f, 0xb01818, 0x5e0808];
      for (let i = 0; i < n; i++) {
        const sz = Math.random() < 0.3 ? 2 : 1;
        const drop = this.add.rectangle(x, y - 6, sz, sz, reds[i % 3]).setDepth(y + 5);
        const spread = (Math.random() - 0.5) * 1.4, sp = 10 + Math.random() * 18;
        const a = Math.atan2(dy, dx) + spread;
        const tx = x + Math.cos(a) * sp, ty = y + Math.sin(a) * sp * 0.6 + 2;
        this.tweens.add({ targets: drop, x: tx, y: { from: y - 6, to: ty }, duration: 220 + Math.random() * 160, ease: 'Quad.easeOut', onComplete: () => {
          drop.setDepth(MAP.y - 197).setAlpha(0.85);
          this.tweens.add({ targets: drop, alpha: 0, delay: 9000, duration: 4000, onComplete: () => drop.destroy() });
        } });
      }
      const pool = this.add.ellipse(x + dx * 4, y + 3 + dy * 2, 5 + n * 0.5, 3 + n * 0.25, 0x6e0b0b, 0.7).setDepth(MAP.y - 198);
      this.tweens.add({ targets: pool, alpha: 0, delay: 12000, duration: 5000, onComplete: () => pool.destroy() });
    }
    hurt(c: Creature, dmg: number, fx: number, fy: number, time: number) {
      if (c.kind !== 'mammoth' || dmg > 0) this.bleed(c.sprite.x, c.sprite.y, fx, fy, c.kind === 'gazelle' ? 6 : 9);
      c.hp -= dmg;
      c.sprite.setTint(0xff6b4a);
      this.time.delayedCall(140, () => { if (c.state !== 'dead') c.sprite.clearTint(); });
      (c.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(fx * 90, fy * 90);
      if (c.hp <= 0) {
        c.state = 'dead';
        const mx = c.sprite.x, my = c.sprite.y;
        c.sprite.destroy();
        if (this.target === c) this.target = undefined;
        const meat = this.add.image(mx, my, 'meat').setDepth(my);
        this.meatPickups.push({ x: mx, y: my, sprite: meat });
        this.message = `${NAME[c.kind]} erlegt · Fleisch zurückgelassen`;
        this.messageUntil = time + 2600;
        this.addXp(XP[c.kind]);
      } else if (c.kind === 'gazelle') { c.state = 'flee'; c.stateUntil = time + 4000; }
      else { c.state = 'chase'; c.stateUntil = time + 8000; c.nextAttack = Math.max(c.nextAttack, time + 500); }
    }
    tickWildlife(time:number, delta:number, p:Phaser.Physics.Arcade.Sprite){
      // Stealth: hidden when crouched behind any cover within 36 px.
      this.hidden = this.covers.some(c => Math.hypot(c.x - p.x, c.y - p.y) < 36);
      p.setAlpha(this.hidden ? 0.6 : this.crouching ? 0.85 : 1);
      // Player attack hit: resolve on the first tick after attack starts.
      const hw = this.held;
      const reach = hw === 'wedge' ? 24 : hw === 'spear' ? 46 : hw === 'axe' ? 38 : 30;
      const fa = this.lastFacing * (Math.PI / 4);
      const fx = Math.cos(fa), fy = Math.sin(fa);
      if (this.attackPending && (hw !== 'wedge' || (p.anims.currentFrame?.index ?? 0) >= 7)) {
        this.attackPending = false;
        for (const c of this.creatures) {
          if (c.state === 'dead') continue;
          const ddx = c.sprite.x - p.x, ddy = c.sprite.y - p.y, d = Math.hypot(ddx, ddy);
          if (d > reach) continue;
          if ((ddx * fx + ddy * fy) / Math.max(0.1, d) < 0.3) continue;
          this.allyFocus = 'c' + this.creatures.indexOf(c);
          this.hurt(c, hw === 'wedge' ? 24 : hw === 'spear' ? 22 : hw === 'axe' ? 18 : input.club ? 16 : 10, fx, fy, time);
        }
        for (const f of this.folk) {
          if (f.c.state !== 'free') continue;
          const ddx = f.sprite.x - p.x, ddy = f.sprite.y - p.y, d = Math.hypot(ddx, ddy);
          if (d > reach || (ddx * fx + ddy * fy) / Math.max(0.1, d) < 0.3) continue;
          if(f.combat.phase!=='ready')continue;
          this.allyFocus='f'+f.c.id;
          f.combat=hitFighter(f.combat,hw==='wedge'?24:hw==='spear'?22:hw==='axe'?18:input.club?16:10,time);
          this.armFolk(f,time);
          this.bleed(f.sprite.x,f.sprite.y,fx,fy,10);
          if(f.combat.phase==='downed'){poseFolk(f);this.message=f.t.captive?'Niedergeschlagen · Steinkeil: Finisher · ohne: [E] fesseln':'Wache niedergeschlagen · Steinkeil: Finisher';}
          else{f.sprite.setTint(0xff6b4a);this.time.delayedCall(140,()=>f.sprite.clearTint());this.message='Treffer! Das Dorf greift an!';}
          this.messageUntil=time+2000;
          const vk=villageKey(VILLAGES[f.t.village].name);
          this.rel=changeVillageRelationship(raiseAlarm(this.rel,vk,Date.now()),vk,-15);
        }
        this.chop(time, fx, fy);
      }
      // Creature AI.
      for (const c of this.creatures) {
        if (c.state === 'dead') continue;
        const s = c.sprite; const body = s.body as Phaser.Physics.Arcade.Body;
        const dx = p.x - s.x, dy = p.y - s.y, dist = Math.hypot(dx, dy);
        // Sight range: hidden behind cover = invisible, crouching = much shorter range.
        const base = c.kind === 'tiger' ? 150 : c.kind === 'gazelle' ? 200 : SNOW[c.kind].sight;
        const range = this.crouching ? base * 0.47 : base;
        const sees = !this.hidden && dist < range;
        if (c.kind === 'gazelle') {
          if (sees && c.state !== 'flee') { c.state = 'flee'; c.stateUntil = time + 2500; }
          if (c.state === 'flee' && time > c.stateUntil && dist > 260) { c.state = 'wander'; c.nextDecision = time + 800; }
        } else {
          // Predators need a moment of clear sight before they notice you; mammoths never do (sight 0).
          const nm = NAME[c.kind];
          c.alert = Phaser.Math.Clamp((c.alert ?? 0) + (sees ? delta : -delta * 0.6), 0, 1600);
          if (c.state === 'wander' && c.alert >= (c.kind === 'wolf' ? 900 : 1400)) { c.state = 'chase'; c.stateUntil = time + 5000; this.message = `${nm} hat dich entdeckt!`; this.messageUntil = time + 1800; }
          if (c.state === 'chase' && (this.hidden ? time > c.stateUntil - 3500 : (!sees && dist > 260 && time > c.stateUntil))) { c.state = 'wander'; c.alert = 0; c.nextDecision = time + 800; if (this.hidden) { this.message = `${nm} verliert deine Spur`; this.messageUntil = time + 1800; } }
          if (c.state === 'chase' && !this.dead && dist < reachOf(c.kind) && time > c.nextAttack) {
            c.state = 'attack'; c.nextAttack = time + (c.kind === 'wolf' ? 1100 : 1600); c.stateUntil = time + 650;
            body.setVelocity(0, 0);
            const facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
            c.facing = facing;
            const ak = `anim-${c.kind}-attack-${facing}`;
            if (this.anims.exists(ak)) s.play(ak, true); else s.play(`${c.kind}-walk-${facing}`, true);
            if (time > this.lastDamage + 900) {
              this.health = Math.max(0, this.health - (c.kind === 'tiger' ? 10 : SNOW[c.kind].damage));
              this.hitFlash = time + 200;
              this.bleed(p.x, p.y, dx / Math.max(1, dist), dy / Math.max(1, dist), 7);
              this.lastDamage = time;
              this.message = `${nm} greift dich an!`;
              this.messageUntil = time + 1600;
            }
          }
        }
        if (c.state === 'attack') {
          if (time > c.stateUntil) c.state = 'chase';
        } else if (c.state === 'flee') {
          const nx = -dx, ny = -dy, nl = Math.max(1, Math.hypot(nx, ny));
          const sl = c.slowUntil && c.slowUntil > time ? BOLA_SLOW : 1;
          body.setVelocity(nx / nl * 95 * sl, ny / nl * 95 * sl);
        } else if (c.state === 'chase') {
          const sp = (c.kind === 'tiger' ? 70 : SNOW[c.kind as SnowKind].speed) * (c.slowUntil && c.slowUntil > time ? BOLA_SLOW : 1);
          // Pack hunters approach from different angles and keep apart instead of stacking.
          const pack = this.creatures.filter(o => o !== c && o.state !== 'dead' && (o.state === 'chase' || o.state === 'attack'));
          const sep = separation(s, pack.map(o => o.sprite), reachOf(c.kind) * 0.9);
          let gx = dx, gy = dy;
          if (pack.length && dist > reachOf(c.kind)) {
            const all = [c, ...pack].sort((a, b) => a.sprite.x - b.sprite.x);
            const slot = flankSlot(all.indexOf(c), all.length, p, reachOf(c.kind) * 0.8, time, c.sprite.x % 7);
            gx = slot.x - s.x; gy = slot.y - s.y;
          }
          gx += sep.x * 50; gy += sep.y * 50;
          const gl = Math.max(1, Math.hypot(gx, gy));
          if (dist < reachOf(c.kind) - 6 && Math.hypot(sep.x, sep.y) < 0.05) body.setVelocity(0, 0); else body.setVelocity(gx / gl * sp, gy / gl * sp);
        } else {
          // Wander: pick a nearby target now and then.
          if (time > c.nextDecision) {
            c.nextDecision = time + 1800 + Math.random() * 2200;
            c.wanderX = s.x + (Math.random() - 0.5) * 160;
            c.wanderY = s.y + (Math.random() - 0.5) * 160;
          }
          const wx = c.wanderX - s.x, wy = c.wanderY - s.y, wl = Math.hypot(wx, wy);
          if (wl > 8) body.setVelocity(wx / wl * 22, wy / wl * 22);
          else body.setVelocity(0, 0);
        }
        // Villages are off-limits: steer wildlife back out of the protected zone.
        const vil = villageAt(s.x, s.y, 50);
        if (vil) {
          const ox = s.x - vil.x, oy = s.y - vil.y, ol = Math.max(1, Math.hypot(ox, oy));
          body.setVelocity(ox / ol * 60, oy / ol * 60);
          c.wanderX = vil.x + ox / ol * (vil.r + 120); c.wanderY = vil.y + oy / ol * (vil.r + 120);
          if (c.state === 'chase' || c.state === 'attack') { c.state = 'wander'; c.alert = 0; c.nextDecision = time + 2500; }
        }
        // Animate based on velocity.
        if (c.state !== 'attack') {
          const vx = body.velocity.x, vy = body.velocity.y, vlen = Math.hypot(vx, vy);
          if (vlen > 12) {
            // Only turn after a short hold so close-range contact doesn't flicker directions.
            const facing = (Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8;
            if (facing !== c.facing && time > (c.turnAt ?? 0)) { c.facing = facing; c.turnAt = time + 220; }
            const key = c.kind === 'gazelle' && c.state === 'flee' ? `gazelle-run-${c.facing}` : `${c.kind}-walk-${c.facing}`;
            if (s.anims.currentAnim?.key !== key || !s.anims.isPlaying) s.play(key);
          } else if (vlen < 4) {
            s.anims.stop();
            s.setTexture(`${c.kind}-idle-${c.facing}`);
          }
        }
        s.setDepth(s.y);
      }
      // Target lock marker.
      if (this.target && this.target.state === 'dead') this.target = undefined;
      if (this.target && Math.hypot(this.target.sprite.x - p.x, this.target.sprite.y - p.y) > 320) { this.target = undefined; this.message = 'Ziel verloren'; this.messageUntil = time + 1200; }
      if (this.marker) {
        if (this.target) { this.marker.setVisible(true).setPosition(this.target.sprite.x, this.target.sprite.y - 26).setDepth(99999); this.marker.setScale(1 + 0.12 * Math.sin(time / 120)); }
        else this.marker.setVisible(false);
      }
      // Thrown spear: homes toward its locked target, then drops to the ground.
      const sp = this.spear;
      if (sp) {
        const tgt = sp.target && sp.target.state !== 'dead' ? sp.target : undefined;
        const tx = tgt ? tgt.sprite.x : sp.tx, ty = tgt ? tgt.sprite.y : sp.ty;
        const ddx = tx - sp.img.x, ddy = ty - sp.img.y, d = Math.hypot(ddx, ddy);
        const step = 420 * Math.min(delta, 50) / 1000;
        sp.img.setRotation(Math.atan2(ddy, ddx) + Math.PI / 4).setDepth(sp.img.y + 20);
        if (d <= step + 6) {
          if (tgt) this.hurt(tgt, tgt.kind === 'gazelle' ? 999 : tgt.kind === 'wolf' ? 40 : 45, ddx / Math.max(1, d), ddy / Math.max(1, d), time);
          sp.img.setPosition(tx, ty + 6).setRotation(Math.PI / 4 + 0.6).setDepth(ty);
          this.spearOnGround = { x: tx, y: ty + 6, img: sp.img };
          this.spear = undefined;
        } else sp.img.setPosition(sp.img.x + ddx / d * step, sp.img.y + ddy / d * step);
      }
      if (time < this.hitFlash) p.setTint(0xff5050); else p.clearTint();
    }
    report(time:number,p:Phaser.Physics.Arcade.Sprite){
      if(time-this.lastReport>100){this.lastReport=time;onStatus({x:Math.round(p.x),y:Math.round(p.y),stamina:Math.round(this.stamina),health:Math.round(this.health),berries:this.count,meat:this.meat,cooked:this.cooked,healPulse:this.healPulse,wood:this.stock.wood,stone:this.stock.stone,flint:this.stock.flint,fiber:this.stock.fiber,xp:this.xp,level:levelFromXp(this.xp),owned:this.owned,hunger:Math.round(this.hunger),warmth:Math.round(this.warmth),day:clockOf(this.clock).day,minutes:clockOf(this.clock).minutesOfDay,nearFire:Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<70,hidden:this.hidden,weapon:this.held,sleeping:this.sleeping,nearBed:this.nearBed,crouching:this.crouching,dead:this.dead,area:Math.hypot(p.x-CAMP.x,p.y-CAMP.y)<200?'Höhlenlager':p.x>=0&&p.x<=WORLD&&p.y>=0&&p.y<mEdge(p.x)+140?'Am Bergmassiv':isFord(p.y)&&Math.abs(p.x-riverX(p.y))<90?'Furt':Math.abs(p.x-riverX(p.y))<130?'Flussufer':BIOME_NAME[biomeAt(p.x,p.y)],message:time<this.messageUntil?this.message:'',talk:this.talk,companionCount:this.followingCount()});}
    }
  }
  const game=new Phaser.Game({type:Phaser.AUTO,parent,width:parent.clientWidth,height:parent.clientHeight,pixelArt:true,roundPixels:true,backgroundColor:'#56654c',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},scene:Wilderness,audio:{noAudio:true},input:{activePointers:4}});(window as unknown as {__game?:Phaser.Game}).__game=game;return game;
}

// Southern edge of the mountain massif; flattened at the camp with rock spurs either side.
function mEdge(x:number){const base=440+55*Math.sin(x/150)+30*Math.sin(x/57+2)+18*Math.sin(x/23);const w=Math.exp(-(((x-CAMP.x)/200)**2));const spur=110*Math.exp(-(((Math.abs(x-CAMP.x)-210)/55)**2));return base*(1-w)+560*w+spur;}
