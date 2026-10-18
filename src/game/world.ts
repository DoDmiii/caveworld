import { eat, roast, FOOD, type Food, type Pantry } from './food';
import * as Phaser from 'phaser';
import { MAP, BIOME_COLOR, BIOME_FLORA, BIOME_NAME, biomeAt, riverX, isFord, FORDS } from './biomes';
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
import { XP, levelFromXp, RECIPES, craft, type ItemId } from './progress';
import { IDLE, WALK, ATTACK, SLEEP, BED, ICON_SPEAR, DEATH, CROUCH, type Weapon } from './gear';
import { TIGER, GAZELLE } from './wildlife';
import { preloadCampers, createCampers, tickCampers, type Camper } from './campers';
import resWood from '@/assets/res-wood.png.asset.json';
import resStone from '@/assets/res-stone.png.asset.json';
import resFlint from '@/assets/res-flint.png.asset.json';
import resFiber from '@/assets/res-fiber.png.asset.json';
import { TREE_HP, ROCK_HP, TREE_DROP, ROCK_DROP, RESOURCE_NAME, emptyStock, gain, type Resource, type Stock } from './harvest';

export type GameInput = { x: number; y: number; sprint: boolean; action: number; attack: number; paused: boolean; weapon: Weapon; sleep: boolean; crouch: boolean; respawn: number; eat: Food | null; club: boolean; craft: ItemId | null };
export type GameStatus = { x: number; y: number; stamina: number; health: number; berries: number; meat: number; cooked: number; nearFire: boolean; healPulse: number; area: string; message: string; weapon: Weapon; sleeping: boolean; nearBed: boolean; hidden: boolean; crouching: boolean; dead: boolean; wood: number; stone: number; flint: number; fiber: number; xp: number; level: number; owned: ItemId[] };
type Creature = {
  kind: 'tiger' | 'gazelle';
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

export function createWorld(parent: HTMLElement, input: GameInput, onStatus: (s: GameStatus) => void) {
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
    meatPickups: { x: number; y: number; sprite: Phaser.GameObjects.Image }[] = [];
    meat = 0;
    trees: { x: number; y: number; dir: number; hp: number; tint: number; sprite: Phaser.Physics.Arcade.Sprite }[] = [];
    stumps: { x: number; y: number; dir: number; sprite?: Phaser.GameObjects.Image }[] = [];
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
    pantry(){return{health:this.health,stamina:this.stamina,berries:this.count,meat:this.meat,cooked:this.cooked};}
    setPantry(r:Pantry){this.health=r.health;this.stamina=r.stamina;this.count=r.berries;this.meat=r.meat;this.cooked=r.cooked;}
    preload() {
      preloadCampers(this);
      sprites.forEach((asset, i) => this.load.image(`human${i}`, asset.url));
      walkSheets.forEach((asset, i) => this.load.spritesheet(`walk${i}`, asset.url, { frameWidth: 28, frameHeight: 28 }));
      (['none','axe','spear'] as Weapon[]).forEach(w => {
        IDLE[w].forEach((u, i) => this.load.image(`${w}-idle-${i}`, u));
        WALK[w].forEach((u, i) => this.load.spritesheet(`${w}-walk-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
        ATTACK[w].forEach((u, i) => this.load.spritesheet(`${w}-attack-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
      });
      DEATH.forEach((u,i)=>this.load.spritesheet(`death-${i}`,u,{frameWidth:32,frameHeight:32}));
      CROUCH.forEach((u,i)=>this.load.spritesheet(`crouch-${i}`,u,{frameWidth:32,frameHeight:32}));
      this.load.image('sleep', SLEEP);
      this.load.image('spear-proj', ICON_SPEAR);
      this.load.image('bed', BED);
      treeTex.forEach((asset, i) => this.load.image(`tree${i}`, asset.url));
      SNOW_TREES.forEach((asset, i) => this.load.image(`snow-tree-${i}`, asset.url));
      SNOW_ROCKS.forEach((asset, i) => this.load.image(`snow-rock-${i}`, asset.url));
      this.load.image('res-wood', resWood.url);
      this.load.image('res-stone', resStone.url);
      this.load.image('res-flint', resFlint.url);
      this.load.image('res-fiber', resFiber.url);
      this.load.image('fire', campfire.url);
      for(const [k,u] of Object.entries(CAMP_TEXTURES)) this.load.image(k,u);
      for (let i = 0; i < 8; i++) {
        this.load.image(`tiger-idle-${i}`, TIGER.idle[i]!);
        this.load.spritesheet(`tiger-walk-${i}`, TIGER.walk[i]!, { frameWidth: 40, frameHeight: 40 });
        this.load.spritesheet(`tiger-attack-${i}`, TIGER.attack[i]!, { frameWidth: 40, frameHeight: 40 });
        this.load.image(`gazelle-idle-${i}`, GAZELLE.idle[i]!);
        this.load.spritesheet(`gazelle-walk-${i}`, GAZELLE.walk[i]!, { frameWidth: 40, frameHeight: 40 });
        this.load.spritesheet(`gazelle-run-${i}`, GAZELLE.run[i]!, { frameWidth: 40, frameHeight: 40 });
      }
    }
    create() {
      // One looping walk cycle per direction; timeScale adapts to sprint speed.
      for (let i = 0; i < 8; i++) {
        this.anims.create({ key: `walk-${i}`, frames: this.anims.generateFrameNumbers(`walk${i}`, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
      }
      (['none','axe','spear'] as Weapon[]).forEach(w => {
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
        this.anims.create({ key: `anim-death-${i}`, frames: this.anims.generateFrameNumbers(`death-${i}`), frameRate: 9, repeat: 0 });
        this.anims.create({ key: `anim-crouch-${i}`, frames: this.anims.generateFrameNumbers(`crouch-${i}`), frameRate: 7, repeat: -1 });
        this.anims.create({ key: `tiger-walk-${i}`, frames: this.anims.generateFrameNumbers(`tiger-walk-${i}`, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        const tAtk = this.textures.get(`tiger-attack-${i}`);
        this.anims.create({ key: `anim-tiger-attack-${i}`, frames: this.anims.generateFrameNumbers(`tiger-attack-${i}`, { start: 0, end: tAtk.frameTotal - 2 }), frameRate: 14, repeat: 0 });
        this.anims.create({ key: `gazelle-walk-${i}`, frames: this.anims.generateFrameNumbers(`gazelle-walk-${i}`, { start: 0, end: 7 }), frameRate: 9, repeat: -1 });
        this.anims.create({ key: `gazelle-run-${i}`, frames: this.anims.generateFrameNumbers(`gazelle-run-${i}`, { start: 0, end: 5 }), frameRate: 14, repeat: -1 });
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
        const f=BIOME_FLORA[biomeAt(x,y)],r=orr();if(r<f.rocks*0.4)mineable(x,y);else if(r<f.rocks*0.4+f.trees*0.6)choppable(x,y,i%8);}
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
      this.player.on('animationcomplete',(a:Phaser.Animations.Animation)=>{if(a.key.startsWith('anim-'))this.attacking=false;});
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
      const spawn = (kind: 'tiger' | 'gazelle', x: number, y: number) => {
        const key = `${kind}-idle-2`;
        const s = this.physics.add.sprite(x, y, key).setDepth(y).setCollideWorldBounds(true);
        s.setSize(14, 8).setOffset(13, 28);
        if (this.obstacles) this.physics.add.collider(s, this.obstacles);
        // Solid bodies: player and animals can't overlap.
        if (this.player) this.physics.add.collider(this.player, s);
        (s.body as Phaser.Physics.Arcade.Body).pushable = false;
        this.creatures.push({ kind, sprite: s, state: 'wander', facing: 2, hp: kind === 'tiger' ? 60 : 30, stateUntil: 0, nextDecision: 0, nextAttack: 0, wanderX: x, wanderY: y });
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
      this.campers = createCampers(this, this.player, this.obstacles);
      for (const camper of this.campers) {
        for (const creature of this.creatures) this.physics.add.collider(camper.sprite, creature.sprite);
      }
    }
    override update(time:number, delta:number) {
      const p=this.player;if(!p)return;
      tickCampers(this.campers, this.obstacles, time, input.paused || this.dead || this.health <= 0 || this.sleeping);
      const k=this.keys; let dx=input.x,dy=input.y;
      if(k?.['A']?.isDown||k?.['LEFT']?.isDown)dx=-1;if(k?.['D']?.isDown||k?.['RIGHT']?.isDown)dx=1;
      if(k?.['W']?.isDown||k?.['UP']?.isDown)dy=-1;if(k?.['S']?.isDown||k?.['DOWN']?.isDown)dy=1;
      if(this.dead){
        p.setVelocity(0,0);
        if(input.respawn!==this.lastRespawn){
          this.lastRespawn=input.respawn;this.dead=false;this.health=100;this.stamina=100;p.setPosition(CAMP.x,CAMP.y-30);p.anims.stop();p.setTexture(`${this.held}-idle-2`);this.lastFacing=2;
          for(const c of this.creatures)if(c.state==='chase'||c.state==='attack'){c.state='wander';c.alert=0;}
          this.message='Du erwachst am Lagerfeuer';this.messageUntil=time+2400;
        }
        this.report(time,p);return;
      }
      this.lastRespawn=input.respawn;
      if(this.health<=0){
        this.dead=true;this.attacking=false;this.target=undefined;p.setVelocity(0,0);p.clearTint();p.setAlpha(1);p.anims.timeScale=1;p.play(`anim-death-${this.lastFacing}`);
        this.report(time,p);return;
      }
      if(input.craft){const rc=RECIPES.find(x=>x.id===input.craft);const next=rc&&craft(rc,this.stock,levelFromXp(this.xp),this.owned);if(rc&&next){this.stock=next;this.owned=[...this.owned,rc.id];this.message=`${rc.name} hergestellt · +25 EP`;this.messageUntil=time+2400;this.addXp(XP.craft);}input.craft=null;}
      if(input.weapon!==this.weapon){this.weapon=input.weapon;this.attacking=false;}
      const bedX=this.bed?.x??0,bedY=this.bed?.y??0;
      this.nearBed=Math.hypot(p.x-bedX,p.y-bedY)<34;
      // Sleeping: lie on the bed, fade, restore vitals, wake up.
      if(input.sleep&&!this.sleeping&&this.nearBed){
        this.sleeping=true;p.anims.stop();p.setVelocity(0,0);p.setPosition(bedX,bedY-4);p.setTexture('sleep');
        const cam=this.cameras.main;cam.fadeOut(900,8,6,4);
        this.time.delayedCall(1700,()=>{this.health=100;this.stamina=100;cam.fadeIn(900,8,6,4);});
        this.time.delayedCall(3200,()=>{this.sleeping=false;input.sleep=false;p.setPosition(bedX,bedY+18);const grown=this.regrowTrees();this.message=grown===1?'Ausgeschlafen · ein Baum ist nachgewachsen':grown>1?`Ausgeschlafen · ${grown} Bäume sind nachgewachsen`:'Ausgeschlafen · voll erholt';this.messageUntil=this.time.now+2400;});
      }
      if(input.sleep&&!this.nearBed&&!this.sleeping)input.sleep=false;
      if(this.sleeping){p.setVelocity(0,0);p.setDepth(bedY+20);this.report(time,p);return;}
      if(input.paused||this.attacking){dx=0;dy=0;}
      const moving=Math.hypot(dx,dy)>0.12;const running=moving&&(input.sprint||k?.['SHIFT']?.isDown)&&this.stamina>1;
      // Ducken als Umschalter: einmal drücken = ducken, erneut drücken = aufstehen.
      const cKey=k?.['C'],ctrlKey=k?.['CTRL'];
      if((cKey&&Phaser.Input.Keyboard.JustDown(cKey))||(ctrlKey&&Phaser.Input.Keyboard.JustDown(ctrlKey)))this.crouchOn=!this.crouchOn;
      if(running||this.attacking)this.crouchOn=false;
      this.crouching=!running&&!this.attacking&&(this.crouchOn||input.crouch);
      const speed=running?105:this.crouching?34:65; const len=Math.max(1,Math.hypot(dx,dy));p.setVelocity(dx/len*speed,dy/len*speed);
      this.stamina=Phaser.Math.Clamp(this.stamina+(running?-22:13)*Math.min(delta,50)/1000,0,100);
      const w=this.held;
      // Lock-on (F): cycle to the nearest living animal within range.
      const fKey=k?.['F'];
      const lockNow=this.lockReq||(fKey&&Phaser.Input.Keyboard.JustDown(fKey));this.lockReq=false;
      if(!input.paused&&lockNow){
        const cands=this.creatures.filter(c=>c.state!=='dead'&&c!==this.target&&Math.hypot(c.sprite.x-p.x,c.sprite.y-p.y)<260).sort((a,b)=>Math.hypot(a.sprite.x-p.x,a.sprite.y-p.y)-Math.hypot(b.sprite.x-p.x,b.sprite.y-p.y));
        this.target=cands[0];
        this.message=this.target?(this.target.kind==='gazelle'?'Gazelle anvisiert':'Säbelzahntiger anvisiert'):'Kein Tier in Sicht';this.messageUntil=time+1400;
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
          this.hasSpear=false;
          const img=this.add.image(p.x,p.y-8,'spear-proj').setScale(0.5);
          this.spear={img,target:t,tx:t.sprite.x,ty:t.sprite.y};
          this.message='Speer geworfen!';
        }
        this.messageUntil=time+1400;
      }
      const qKey=k?.['Q'];
      const keyAttack=(qKey&&Phaser.Input.Keyboard.JustDown(qKey))||this.clickAttack;this.clickAttack=false;
      if(!input.paused&&!this.attacking&&(input.attack!==this.lastAttack||keyAttack)){
        this.lastAttack=input.attack;this.attacking=true;this.attackPending=true;p.setVelocity(0,0);
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
      const eatKey:Food|null=k?.['ONE']&&Phaser.Input.Keyboard.JustDown(k['ONE'])?'berries':k?.['TWO']&&Phaser.Input.Keyboard.JustDown(k['TWO'])?'meat':k?.['THREE']&&Phaser.Input.Keyboard.JustDown(k['THREE'])?'cooked':null;
      const food=input.eat??eatKey;input.eat=null;
      if(food&&!this.dead&&!this.sleeping){const r=eat(this.pantry(),food);
        if(r){this.setPantry(r);this.healPulse++;this.message=`${FOOD[food].name} gegessen · +${FOOD[food].heal} Leben`;}
        else this.message=this.pantry()[food]<=0?`Keine ${FOOD[food].name} im Beutel`:'Du bist schon satt';
        this.messageUntil=time+2000;}
      const actionKey=k?.['E'],spaceKey=k?.['SPACE'];
      const keyboardAction=(actionKey&&Phaser.Input.Keyboard.JustDown(actionKey))||(spaceKey&&Phaser.Input.Keyboard.JustDown(spaceKey));
      if(!input.paused&&(input.action!==this.lastAction||keyboardAction)){
        this.lastAction=input.action;
        const berry=this.berries.find(b=>!b.picked&&Math.hypot(p.x-b.x,p.y-b.y)<65);
        const meat=this.meatPickups.find(m=>Math.hypot(p.x-m.x,p.y-m.y)<32);
        const res=this.resPickups.find(r=>Math.hypot(p.x-r.x,p.y-r.y)<30);
        const sg=this.spearOnGround&&Math.hypot(p.x-this.spearOnGround.x,p.y-this.spearOnGround.y)<34?this.spearOnGround:undefined;
        if(this.nearBed){input.sleep=true;this.message='Du legst dich schlafen …';}
        else if(sg){sg.img.destroy();this.spearOnGround=undefined;this.hasSpear=true;this.message='Speer aufgehoben';}
        else if(meat){meat.sprite.destroy();this.meatPickups=this.meatPickups.filter(m=>m!==meat);this.meat++;this.message='Fleisch aufgehoben · +1';}
        else if(res){res.sprite.destroy();this.resPickups=this.resPickups.filter(r=>r!==res);this.stock=gain(this.stock,res.kind);this.message=`${RESOURCE_NAME[res.kind]} aufgehoben · +1`;}
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
    hurt(c: Creature, dmg: number, fx: number, fy: number, time: number) {
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
        this.message = c.kind === 'tiger' ? 'Säbelzahntiger erlegt · Fleisch zurückgelassen' : 'Gazelle erlegt · Fleisch zurückgelassen';
        this.messageUntil = time + 2600;
        this.addXp(c.kind === 'tiger' ? XP.tiger : XP.gazelle);
      } else if (c.kind === 'gazelle') { c.state = 'flee'; c.stateUntil = time + 4000; }
      else { c.state = 'chase'; c.stateUntil = time + 8000; c.nextAttack = Math.max(c.nextAttack, time + 500); }
    }
    tickWildlife(time:number, delta:number, p:Phaser.Physics.Arcade.Sprite){
      // Stealth: hidden when crouched behind any cover within 36 px.
      this.hidden = this.covers.some(c => Math.hypot(c.x - p.x, c.y - p.y) < 36);
      p.setAlpha(this.hidden ? 0.6 : this.crouching ? 0.85 : 1);
      // Player attack hit: resolve on the first tick after attack starts.
      const hw = this.held;
      const reach = hw === 'spear' ? 46 : hw === 'axe' ? 38 : 30;
      const fa = this.lastFacing * (Math.PI / 4);
      const fx = Math.cos(fa), fy = Math.sin(fa);
      if (this.attackPending) {
        this.attackPending = false;
        for (const c of this.creatures) {
          if (c.state === 'dead') continue;
          const ddx = c.sprite.x - p.x, ddy = c.sprite.y - p.y, d = Math.hypot(ddx, ddy);
          if (d > reach) continue;
          if ((ddx * fx + ddy * fy) / Math.max(0.1, d) < 0.3) continue;
          this.hurt(c, hw === 'spear' ? 22 : hw === 'axe' ? 18 : input.club ? 16 : 10, fx, fy, time);
        }
        this.chop(time, fx, fy);
      }
      // Creature AI.
      for (const c of this.creatures) {
        if (c.state === 'dead') continue;
        const s = c.sprite; const body = s.body as Phaser.Physics.Arcade.Body;
        const dx = p.x - s.x, dy = p.y - s.y, dist = Math.hypot(dx, dy);
        // Sight range: hidden behind cover = invisible, crouching = much shorter range.
        const range = c.kind === 'tiger' ? (this.crouching ? 70 : 150) : (this.crouching ? 95 : 200);
        const sees = !this.hidden && dist < range;
        if (c.kind === 'gazelle') {
          if (sees && c.state !== 'flee') { c.state = 'flee'; c.stateUntil = time + 2500; }
          if (c.state === 'flee' && time > c.stateUntil && dist > 260) { c.state = 'wander'; c.nextDecision = time + 800; }
        } else {
          // Tiger needs a moment of clear sight before it notices you.
          c.alert = Phaser.Math.Clamp((c.alert ?? 0) + (sees ? delta : -delta * 0.6), 0, 1600);
          if (c.state === 'wander' && c.alert >= 1400) { c.state = 'chase'; c.stateUntil = time + 5000; this.message = 'Der Säbelzahntiger hat dich entdeckt!'; this.messageUntil = time + 1800; }
          if (c.state === 'chase' && (this.hidden ? time > c.stateUntil - 3500 : (!sees && dist > 260 && time > c.stateUntil))) { c.state = 'wander'; c.alert = 0; c.nextDecision = time + 800; if (this.hidden) { this.message = 'Der Tiger verliert deine Spur'; this.messageUntil = time + 1800; } }
          if (c.state === 'chase' && !this.dead && dist < 32 && time > c.nextAttack) {
            c.state = 'attack'; c.nextAttack = time + 1500; c.stateUntil = time + 650;
            body.setVelocity(0, 0);
            const facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
            c.facing = facing;
            s.play(`anim-tiger-attack-${facing}`, true);
            if (time > this.lastDamage + 1100) {
              this.health = Math.max(0, this.health - 10);
              this.hitFlash = time + 200;
              this.lastDamage = time;
              this.message = 'Der Säbelzahntiger reißt dich!';
              this.messageUntil = time + 1600;
            }
          }
        }
        if (c.state === 'attack') {
          if (time > c.stateUntil) c.state = 'chase';
        } else if (c.state === 'flee') {
          const nx = -dx, ny = -dy, nl = Math.max(1, Math.hypot(nx, ny));
          body.setVelocity(nx / nl * 95, ny / nl * 95);
        } else if (c.state === 'chase') {
          const nl = Math.max(1, dist);
          if (dist < 26) body.setVelocity(0, 0); else body.setVelocity(dx / nl * 70, dy / nl * 70);
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
          if (tgt) this.hurt(tgt, tgt.kind === 'gazelle' ? 999 : 45, ddx / Math.max(1, d), ddy / Math.max(1, d), time);
          sp.img.setPosition(tx, ty + 6).setRotation(Math.PI / 4 + 0.6).setDepth(ty);
          this.spearOnGround = { x: tx, y: ty + 6, img: sp.img };
          this.spear = undefined;
        } else sp.img.setPosition(sp.img.x + ddx / d * step, sp.img.y + ddy / d * step);
      }
      if (time < this.hitFlash) p.setTint(0xff5050); else p.clearTint();
    }
    report(time:number,p:Phaser.Physics.Arcade.Sprite){
      if(time-this.lastReport>100){this.lastReport=time;onStatus({x:Math.round(p.x),y:Math.round(p.y),stamina:Math.round(this.stamina),health:Math.round(this.health),berries:this.count,meat:this.meat,cooked:this.cooked,healPulse:this.healPulse,wood:this.stock.wood,stone:this.stock.stone,flint:this.stock.flint,fiber:this.stock.fiber,xp:this.xp,level:levelFromXp(this.xp),owned:this.owned,nearFire:Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<70,hidden:this.hidden,weapon:this.held,sleeping:this.sleeping,nearBed:this.nearBed,crouching:this.crouching,dead:this.dead,area:Math.hypot(p.x-CAMP.x,p.y-CAMP.y)<200?'Höhlenlager':p.x>=0&&p.x<=WORLD&&p.y>=0&&p.y<mEdge(p.x)+140?'Am Bergmassiv':isFord(p.y)&&Math.abs(p.x-riverX(p.y))<90?'Furt':Math.abs(p.x-riverX(p.y))<130?'Flussufer':BIOME_NAME[biomeAt(p.x,p.y)],message:time<this.messageUntil?this.message:''});}
    }
  }
  const game=new Phaser.Game({type:Phaser.AUTO,parent,width:parent.clientWidth,height:parent.clientHeight,pixelArt:true,roundPixels:true,backgroundColor:'#56654c',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},scene:Wilderness,audio:{noAudio:true},input:{activePointers:4}});(window as unknown as {__game?:Phaser.Game}).__game=game;return game;
}

// Southern edge of the mountain massif; flattened at the camp with rock spurs either side.
function mEdge(x:number){const base=440+55*Math.sin(x/150)+30*Math.sin(x/57+2)+18*Math.sin(x/23);const w=Math.exp(-(((x-CAMP.x)/200)**2));const spur=110*Math.exp(-(((Math.abs(x-CAMP.x)-210)/55)**2));return base*(1-w)+560*w+spur;}
