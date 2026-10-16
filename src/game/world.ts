import * as Phaser from 'phaser';
import north from '@/assets/north.png.asset.json';
import northEast from '@/assets/north-east.png.asset.json';
import east from '@/assets/east.png.asset.json';
import southEast from '@/assets/south-east.png.asset.json';
import south from '@/assets/south.png.asset.json';
import southWest from '@/assets/south-west.png.asset.json';
import west from '@/assets/west.png.asset.json';
import northWest from '@/assets/north-west.png.asset.json';
import campfire from '@/assets/campfire.png.asset.json';
import tree0 from '@/assets/tree-east.png.asset.json';
import tree1 from '@/assets/tree-south-east.png.asset.json';
import tree2 from '@/assets/tree-south.png.asset.json';
import tree3 from '@/assets/tree-south-west.png.asset.json';
import tree4 from '@/assets/tree-west.png.asset.json';
import tree5 from '@/assets/tree-north-west.png.asset.json';
import tree6 from '@/assets/tree-north.png.asset.json';
import tree7 from '@/assets/tree-north-east.png.asset.json';
import walkEast from '@/assets/walk-east.png.asset.json';
import walkSouthEast from '@/assets/walk-south-east.png.asset.json';
import walkSouth from '@/assets/walk-south.png.asset.json';
import walkSouthWest from '@/assets/walk-south-west.png.asset.json';
import walkWest from '@/assets/walk-west.png.asset.json';
import walkNorthWest from '@/assets/walk-north-west.png.asset.json';
import walkNorth from '@/assets/walk-north.png.asset.json';
import walkNorthEast from '@/assets/walk-north-east.png.asset.json';
import { IDLE, WALK, ATTACK, SLEEP, BED, type Weapon } from './gear';
import { TIGER, GAZELLE } from './wildlife';

export type GameInput = { x: number; y: number; sprint: boolean; action: number; attack: number; paused: boolean; weapon: Weapon; sleep: boolean };
export type GameStatus = { x: number; y: number; stamina: number; health: number; berries: number; meat: number; area: string; message: string; weapon: Weapon; sleeping: boolean; nearBed: boolean; hidden: boolean };
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
    meatPickups: { x: number; y: number; sprite: Phaser.GameObjects.Image }[] = [];
    meat = 0;
    hidden = false;
    covers: { x: number; y: number }[] = [];
    hitFlash = 0;
    attackPending = false;
    lastDamage = 0;
    preload() {
      sprites.forEach((asset, i) => this.load.image(`human${i}`, asset.url));
      walkSheets.forEach((asset, i) => this.load.spritesheet(`walk${i}`, asset.url, { frameWidth: 28, frameHeight: 28 }));
      (['none','axe','spear'] as Weapon[]).forEach(w => {
        IDLE[w].forEach((u, i) => this.load.image(`${w}-idle-${i}`, u));
        WALK[w].forEach((u, i) => this.load.spritesheet(`${w}-walk-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
        ATTACK[w].forEach((u, i) => this.load.spritesheet(`${w}-attack-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
      });
      this.load.image('sleep', SLEEP);
      this.load.image('bed', BED);
      treeTex.forEach((asset, i) => this.load.image(`tree${i}`, asset.url));
      this.load.image('fire', campfire.url);
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
      });
      this.add.image(0,0,'ground').setOrigin(0);
      this.physics.world.setBounds(0,0,WORLD,WORLD);
      this.obstacles=this.physics.add.staticGroup();
      const obstacle=(x:number,y:number,key:string,bw:number,bh:number)=> {
        const obj=this.obstacles?.create(x,y,key) as Phaser.Physics.Arcade.Sprite | undefined;
        if(!obj)return;obj.setDepth(y+obj.height/2-6); const body=obj.body as Phaser.Physics.Arcade.StaticBody;body.setSize(bw,bh);body.setOffset((obj.width-bw)/2,obj.height-bh-4);
      };
      let seed=419;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
      for(let i=0;i<460;i++) {
        const x=40+random()*(WORLD-80),y=40+random()*(WORLD-80);
        if(y<mEdge(x)+40 || Math.abs(x-riverX(y))<130 || Math.hypot(x-CAMP.x,y-CAMP.y)<200)continue;
        // Forest thins toward the camp so the start stays readable.
        if(Math.hypot(x-CAMP.x,y-CAMP.y)<380&&i%3!==0)continue;
        if(i%7===0)obstacle(x,y,'rock',24,13); else obstacle(x,y,`tree${i%8}`,22,10);
      }
      // Boulders along the cliff foot and flanking the camp.
      for(let x=30;x<WORLD;x+=70+Math.floor(random()*90)){if(Math.abs(x-CAMP.x)<70)continue;obstacle(x,mEdge(x)+14+random()*20,'rock',24,13);}
      for(const [x,y] of [[870,600],[1135,610],[860,700],[1145,705]] as const) obstacle(x,y,'rock',24,13);
      for(const [x,y] of [[820,760],[1190,770],[930,820],[1090,830]] as const) obstacle(x,y,`tree${(x+y)%8}`,22,10);
      // Invisible segmented colliders: river banks and the mountain wall.
      for(let y=0;y<WORLD;y+=24){ if(y<mEdge(riverX(y)))continue;const zone=this.add.zone(riverX(y),y,115,30);this.physics.add.existing(zone,true);this.obstacles.add(zone); }
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
        if (s.texture?.key === 'rock') this.covers.push({ x: s.x, y: s.y });
      });
      this.player=this.physics.add.sprite(CAMP.x,CAMP.y-30,'human2').setDepth(CAMP.y).setCollideWorldBounds(true);
      this.player.setTexture('none-idle-2');
      this.player.setSize(10,7).setOffset(11,23);
      this.player.on('animationcomplete',(a:Phaser.Animations.Animation)=>{if(a.key.startsWith('anim-'))this.attacking=false;});
      this.physics.add.collider(this.player,this.obstacles);
      this.cameras.main.setBounds(0,0,WORLD,WORLD).setZoom(2.6).startFollow(this.player,true,0.07,0.07);
      this.keys=this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,SPACE,Q') as Record<string,Phaser.Input.Keyboard.Key>;
      this.game.events.on('blur',()=>{input.x=0;input.y=0;input.sprint=false;});
      // Meat loot texture.
      make('meat', 14, 10, c => { rect(c,'#5a2a26',1,2,12,7);rect(c,'#8a3a30',2,3,10,5);rect(c,'#c25545',4,4,6,3);rect(c,'#efe6c8',6,5,2,1);rect(c,'#2b1510',3,8,8,1); });
      // Spawn wildlife at safe, open locations away from camp, mountain and river.
      let wseed = 2131; const wr = () => { wseed = (wseed * 16807) % 2147483647; return wseed / 2147483647; };
      const spawn = (kind: 'tiger' | 'gazelle', x: number, y: number) => {
        const key = `${kind}-idle-2`;
        const s = this.physics.add.sprite(x, y, key).setDepth(y).setCollideWorldBounds(true);
        s.setSize(14, 8).setOffset(13, 28);
        this.physics.add.collider(s, this.obstacles);
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
      for (let i = 0; i < 2; i++) { const s = safeSpot(); if (s) spawn('tiger', s.x, s.y); }
    }
    override update(time:number, delta:number) {
      const p=this.player;if(!p)return;
      const k=this.keys; let dx=input.x,dy=input.y;
      if(k?.['A']?.isDown||k?.['LEFT']?.isDown)dx=-1;if(k?.['D']?.isDown||k?.['RIGHT']?.isDown)dx=1;
      if(k?.['W']?.isDown||k?.['UP']?.isDown)dy=-1;if(k?.['S']?.isDown||k?.['DOWN']?.isDown)dy=1;
      if(input.weapon!==this.weapon){this.weapon=input.weapon;this.attacking=false;}
      const bedX=this.bed?.x??0,bedY=this.bed?.y??0;
      this.nearBed=Math.hypot(p.x-bedX,p.y-bedY)<34;
      // Sleeping: lie on the bed, fade, restore vitals, wake up.
      if(input.sleep&&!this.sleeping&&this.nearBed){
        this.sleeping=true;p.anims.stop();p.setVelocity(0,0);p.setPosition(bedX,bedY-4);p.setTexture('sleep');
        const cam=this.cameras.main;cam.fadeOut(900,8,6,4);
        this.time.delayedCall(1700,()=>{this.health=100;this.stamina=100;cam.fadeIn(900,8,6,4);});
        this.time.delayedCall(3200,()=>{this.sleeping=false;input.sleep=false;p.setPosition(bedX,bedY+18);this.message='Ausgeschlafen · voll erholt';this.messageUntil=this.time.now+2400;});
      }
      if(input.sleep&&!this.nearBed&&!this.sleeping)input.sleep=false;
      if(this.sleeping){p.setVelocity(0,0);p.setDepth(bedY+20);this.report(time,p);return;}
      if(input.paused||this.attacking){dx=0;dy=0;}
      const moving=Math.hypot(dx,dy)>0.12;const running=moving&&(input.sprint||k?.['SHIFT']?.isDown)&&this.stamina>1;
      const speed=running?105:65; const len=Math.max(1,Math.hypot(dx,dy));p.setVelocity(dx/len*speed,dy/len*speed);
      this.stamina=Phaser.Math.Clamp(this.stamina+(running?-22:13)*Math.min(delta,50)/1000,0,100);
      const w=this.weapon;
      const qKey=k?.['Q'];
      const keyAttack=qKey&&Phaser.Input.Keyboard.JustDown(qKey);
      if(!input.paused&&!this.attacking&&(input.attack!==this.lastAttack||keyAttack)){
        this.lastAttack=input.attack;this.attacking=true;this.attackPending=true;p.setVelocity(0,0);
        p.anims.timeScale=1;p.play(`anim-${w}-attack-${this.lastFacing}`);
      } else if(input.attack!==this.lastAttack)this.lastAttack=input.attack;
      if(this.attacking){/* attack animation plays out */}
      else if(moving) {
        const angle=Math.atan2(dy,dx);this.lastFacing=(Math.round(angle/(Math.PI/4))+8)%8;
        const animKey=`${w}-walk-${this.lastFacing}`;
        if(p.anims.currentAnim?.key!==animKey||!p.anims.isPlaying)p.play(animKey);
        p.anims.timeScale=running?1.5:1;
      } else {
        p.anims.stop();
        p.setTexture(`${w}-idle-${this.lastFacing}`);
      }
      p.setDepth(p.y);
      const actionKey=k?.['E'],spaceKey=k?.['SPACE'];
      const keyboardAction=(actionKey&&Phaser.Input.Keyboard.JustDown(actionKey))||(spaceKey&&Phaser.Input.Keyboard.JustDown(spaceKey));
      if(!input.paused&&(input.action!==this.lastAction||keyboardAction)){
        this.lastAction=input.action;
        const berry=this.berries.find(b=>!b.picked&&Math.hypot(p.x-b.x,p.y-b.y)<65);
        const meat=this.meatPickups.find(m=>Math.hypot(p.x-m.x,p.y-m.y)<32);
        if(this.nearBed){input.sleep=true;this.message='Du legst dich schlafen …';}
        else if(meat){meat.sprite.destroy();this.meatPickups=this.meatPickups.filter(m=>m!==meat);this.meat++;this.message='Fleisch aufgehoben · +1';}
        else if(berry){berry.picked=true;berry.sprite.setTint(0x849461);this.count++;this.message='Beeren gesammelt · +1';}
        else if(Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<70){this.stamina=100;this.message='Am Feuer ausgeruht';}
        else if(p.y<CAMP.y-20&&Math.abs(p.x-CAMP.x)<60)this.message='Die Sippenhöhle – hier bist du sicher';
        else this.message='Hier gibt es nichts zu sammeln';
        this.messageUntil=time+2400;
      }
      this.tickWildlife(time, delta, p);
      this.report(time,p);
    }
    tickWildlife(time:number, delta:number, p:Phaser.Physics.Arcade.Sprite){
      // Stealth: hidden when crouched behind any cover within 36 px.
      this.hidden = this.covers.some(c => Math.hypot(c.x - p.x, c.y - p.y) < 36);
      p.setAlpha(this.hidden ? 0.6 : 1);
      // Player attack hit: resolve on the first tick after attack starts.
      const reach = this.weapon === 'spear' ? 46 : this.weapon === 'axe' ? 38 : 30;
      const fa = this.lastFacing * (Math.PI / 4);
      const fx = Math.cos(fa), fy = Math.sin(fa);
      if (this.attackPending) {
        this.attackPending = false;
        for (const c of this.creatures) {
          if (c.state === 'dead') continue;
          const ddx = c.sprite.x - p.x, ddy = c.sprite.y - p.y, d = Math.hypot(ddx, ddy);
          if (d > reach) continue;
          if ((ddx * fx + ddy * fy) / Math.max(0.1, d) < 0.3) continue;
          this.hurt(c, this.weapon === 'spear' ? 22 : this.weapon === 'axe' ? 18 : 10, fx, fy, time);
        }
      }
      // Creature AI.
      for (const c of this.creatures) {
        if (c.state === 'dead') continue;
        const s = c.sprite; const body = s.body as Phaser.Physics.Arcade.Body;
        const dx = p.x - s.x, dy = p.y - s.y, dist = Math.hypot(dx, dy);
        const sees = !this.hidden && dist < (c.kind === 'tiger' ? 260 : 200);
        if (c.kind === 'gazelle') {
          if (sees && c.state !== 'flee') { c.state = 'flee'; c.stateUntil = time + 2500; }
          if (c.state === 'flee' && time > c.stateUntil && dist > 260) { c.state = 'wander'; c.nextDecision = time + 800; }
        } else {
          if (sees && c.state === 'wander') { c.state = 'chase'; c.stateUntil = time + 6000; }
          if (c.state === 'chase' && !sees && dist > 360 && time > c.stateUntil) { c.state = 'wander'; c.nextDecision = time + 800; }
          if (c.state === 'chase' && dist < 32 && time > c.nextAttack) {
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
      if(time-this.lastReport>100){this.lastReport=time;onStatus({x:Math.round(p.x),y:Math.round(p.y),stamina:Math.round(this.stamina),health:Math.round(this.health),berries:this.count,meat:this.meat,hidden:this.hidden,weapon:this.weapon,sleeping:this.sleeping,nearBed:this.nearBed,area:Math.hypot(p.x-CAMP.x,p.y-CAMP.y)<200?'Höhlenlager':p.y<mEdge(p.x)+140?'Am Bergmassiv':Math.abs(p.x-riverX(p.y))<220?'Flussufer':'Graue Wildnis',message:time<this.messageUntil?this.message:''});}
    }
  }
  const game=new Phaser.Game({type:Phaser.AUTO,parent,width:parent.clientWidth,height:parent.clientHeight,pixelArt:true,roundPixels:true,backgroundColor:'#56654c',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},scene:Wilderness,audio:{noAudio:true},input:{activePointers:4}});(window as unknown as {__game?:Phaser.Game}).__game=game;return game;
}
function riverX(y:number){const t=Phaser.Math.Clamp(y/WORLD,0,1);return (1-t)**3*1570+3*(1-t)**2*t*1290+3*(1-t)*t*t*1750+t**3*1580;}

// Southern edge of the mountain massif; flattened at the camp with rock spurs either side.
function mEdge(x:number){const base=440+55*Math.sin(x/150)+30*Math.sin(x/57+2)+18*Math.sin(x/23);const w=Math.exp(-(((x-CAMP.x)/200)**2));const spur=110*Math.exp(-(((Math.abs(x-CAMP.x)-210)/55)**2));return base*(1-w)+560*w+spur;}
