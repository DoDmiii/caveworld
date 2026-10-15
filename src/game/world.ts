import * as Phaser from 'phaser';
import north from '@/assets/north.png.asset.json';
import northEast from '@/assets/north-east.png.asset.json';
import east from '@/assets/east.png.asset.json';
import southEast from '@/assets/south-east.png.asset.json';
import south from '@/assets/south.png.asset.json';
import southWest from '@/assets/south-west.png.asset.json';
import west from '@/assets/west.png.asset.json';
import northWest from '@/assets/north-west.png.asset.json';
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

export type GameInput = { x: number; y: number; sprint: boolean; action: number; paused: boolean };
export type GameStatus = { x: number; y: number; stamina: number; berries: number; area: string; message: string };
const sprites = [east, southEast, south, southWest, west, northWest, north, northEast];
const treeTex = [tree0,tree1,tree2,tree3,tree4,tree5,tree6,tree7];
const walkSheets = [walkEast, walkSouthEast, walkSouth, walkSouthWest, walkWest, walkNorthWest, walkNorth, walkNorthEast];
const WORLD = 2048;

export function createWorld(parent: HTMLElement, input: GameInput, onStatus: (s: GameStatus) => void) {
  class Wilderness extends Phaser.Scene {
    player?: Phaser.Physics.Arcade.Sprite;
    keys?: Record<string, Phaser.Input.Keyboard.Key>;
    obstacles?: Phaser.Physics.Arcade.StaticGroup;
    berries: { x: number; y: number; picked: boolean; sprite: Phaser.GameObjects.Image }[] = [];
    stamina = 100;
    count = 0;
    lastAction = 0;
    lastReport = 0;
    message = '';
    messageUntil = 0;
    lastFacing = 2;
    preload() {
      sprites.forEach((asset, i) => this.load.image(`human${i}`, asset.url));
      walkSheets.forEach((asset, i) => this.load.spritesheet(`walk${i}`, asset.url, { frameWidth: 28, frameHeight: 28 }));
      treeTex.forEach((asset, i) => this.load.image(`tree${i}`, asset.url));
    }
    create() {
      // One looping walk cycle per direction; timeScale adapts to sprint speed.
      for (let i = 0; i < 8; i++) {
        this.anims.create({ key: `walk-${i}`, frames: this.anims.generateFrameNumbers(`walk${i}`, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
      }
      // Hand-drawn integer-pixel textures, built once and rendered without filtering.
      const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
        const texture = this.textures.createCanvas(key, w, h);
        if (!texture) return;
        draw(texture.context); texture.refresh();
      };
      const rect = (c: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) => { c.fillStyle = color; c.fillRect(x,y,w,h); };
      make('tree', 56, 76, c => {
        rect(c,'#203b30',12,65,36,7); rect(c,'#644e35',25,43,9,26); rect(c,'#987346',29,44,3,23);
        rect(c,'#223d2b',9,21,40,34); rect(c,'#29482c',4,25,48,23); rect(c,'#335632',8,13,39,31);
        rect(c,'#3c6034',16,5,25,34); rect(c,'#486c3a',11,17,31,15); rect(c,'#52783e',20,8,16,16);
        rect(c,'#658745',18,12,10,5); rect(c,'#52783e',8,28,10,8); rect(c,'#2b482b',30,35,18,10);
        rect(c,'#74934a',23,9,7,3); rect(c,'#3b6032',8,40,17,8);
      });
      make('rock', 34, 26, c => { rect(c,'#294633',2,20,30,5);rect(c,'#657064',4,8,26,13);rect(c,'#8b9380',7,3,19,15);rect(c,'#a4ac94',10,3,12,5);rect(c,'#777e6d',21,10,8,10);rect(c,'#bec3a5',10,5,8,2); });
      make('bush', 26, 24, c => { rect(c,'#294a2b',2,9,23,13);rect(c,'#4b7137',4,4,17,14);rect(c,'#64873d',8,3,12,8); for(const [x,y] of [[6,10],[15,7],[18,14],[10,16]] as const) {rect(c,'#bd655e',x,y,3,3);rect(c,'#eea17c',x,y,1,1);} });
      make('fire', 30, 30, c => {rect(c,'#767665',2,22,26,6);rect(c,'#413e30',6,19,20,5);rect(c,'#916139',4,23,22,3);rect(c,'#ed8642',10,10,12,13);rect(c,'#f5bd66',13,6,5,16);rect(c,'#ffe3a1',14,15,4,7);rect(c,'#e7743d',20,15,4,6);});
      make('cave', 112, 78, c => {rect(c,'#344b39',1,62,108,12);rect(c,'#707567',7,26,99,40);rect(c,'#838773',18,13,80,40);rect(c,'#949783',31,4,54,22);rect(c,'#a4a68d',33,5,41,7);rect(c,'#5a6255',9,45,22,21);rect(c,'#363e32',34,32,43,34);rect(c,'#20291f',41,37,30,29);rect(c,'#a4a68d',21,21,14,7);rect(c,'#65715a',80,40,23,25);rect(c,'#3c5736',11,15,13,10);});
      make('ground', WORLD, WORLD, c => {
        let seed=7351; const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
        rect(c,'#718252',0,0,WORLD,WORLD);
        for(let i=0;i<58000;i++) { const x=Math.floor(rand()*WORLD/3)*3,y=Math.floor(rand()*WORLD/3)*3;rect(c,['#788957','#6a7e4c','#7d8d5b','#63794b'][i%4] ?? '#788957',x,y,3+(i%3)*2,2); }
        // Worn trails connect the camp, old cave, and river crossing.
        c.lineCap='round'; c.lineJoin='round';
        const path=(color:string,width:number)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(650,0);c.bezierCurveTo(850,430,900,660,1050,900);c.bezierCurveTo(1150,1120,740,1360,880,2048);c.stroke();c.beginPath();c.moveTo(1000,980);c.bezierCurveTo(760,860,500,950,0,1180);c.stroke();};
        path('#8d8c60',62);path('#a09a70',42);
        for(let i=0;i<4500;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);const p=c.getImageData(x,y,1,1).data;if((p[0] ?? 0)>130)rect(c,i%2?'#b3a77b':'#92885f',x,y,2,2);}
        const river=(color:string,width:number)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(1570,-100);c.bezierCurveTo(1290,650,1750,1000,1580,2150);c.stroke();};
        river('#555f43',163);river('#a39d6e',148);river('#527e7a',132);river('#639693',110);river('#74a4a0',78);
        for(let y=0;y<WORLD;y+=17) {const x=riverX(y);rect(c,'#92bab0',x-33+Math.floor(rand()*50),y,10+Math.floor(rand()*20),2);}
        for(let i=0;i<2600;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);if(Math.abs(x-riverX(y))<95)continue; rect(c,'#516e3c',x,y,2,5);rect(c,'#5e793e',x+3,y-2,2,5);if(i%8===0){rect(c,'#d4c28a',x+1,y-2,2,2);}}
        // A sandy hearth clearing.
        c.fillStyle='#929064';c.beginPath();c.ellipse(1000,1040,94,65,0,0,Math.PI*2);c.fill();
        for(let i=0;i<110;i++)rect(c,'#a7a074',925+Math.floor(rand()*150),1000+Math.floor(rand()*75),2,2);
      });
      this.add.image(0,0,'ground').setOrigin(0);
      this.physics.world.setBounds(0,0,WORLD,WORLD);
      this.obstacles=this.physics.add.staticGroup();
      const obstacle=(x:number,y:number,key:string,bw:number,bh:number)=> {
        const obj=this.obstacles?.create(x,y,key) as Phaser.Physics.Arcade.Sprite | undefined;
        if(!obj)return;obj.setDepth(y); const body=obj.body as Phaser.Physics.Arcade.StaticBody;body.setSize(bw,bh);body.setOffset((obj.width-bw)/2,obj.height-bh-4);
      };
      let seed=419;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
      for(let i=0;i<380;i++) {
        const x=40+random()*(WORLD-80),y=40+random()*(WORLD-80);
        if(Math.abs(x-riverX(y))<125 || Math.hypot(x-1000,y-1040)<155 || Math.hypot(x-770,y-745)<100)continue;
        // Keep the initial clearing readable while the forest thickens at its edges.
        if(Math.hypot(x-1030,y-970)<290&&i%3!==0)continue;
        obstacle(x,y,i%6===0?'rock':`tree${i%8}`,i%6===0?24:10,i%6===0?13:8);
      }
      for(const [x,y] of [[938,884],[1120,885],[1148,1068],[920,1138]] as const) obstacle(x,y,`tree${(x+y)%8}`,10,8);
      // Invisible segmented river bank prevents crossing deep water.
      for(let y=0;y<WORLD;y+=24){ const zone=this.add.zone(riverX(y),y,115,30);this.physics.add.existing(zone,true);this.obstacles.add(zone); }
      obstacle(770,745,'cave',98,39);
      this.add.image(1000,1058,'fire').setDepth(1060);
      for(const [x,y] of [[1128,952],[895,1095],[1160,1170],[700,850],[1240,780],[760,1240],[480,1080],[1040,600],[980,1460]] as const) {
        const sprite=this.add.image(x,y,'bush').setDepth(y);this.berries.push({x,y,picked:false,sprite});
      }
      this.player=this.physics.add.sprite(1030,970,'human2').setDepth(970).setCollideWorldBounds(true);
      this.player.setSize(10,7).setOffset(9,19);
      this.physics.add.collider(this.player,this.obstacles);
      this.cameras.main.setBounds(0,0,WORLD,WORLD).setZoom(2).startFollow(this.player,true,0.07,0.07);
      this.keys=this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,SPACE') as Record<string,Phaser.Input.Keyboard.Key>;
      this.game.events.on('blur',()=>{input.x=0;input.y=0;input.sprint=false;});
    }
    override update(time:number, delta:number) {
      const p=this.player;if(!p)return;
      const k=this.keys; let dx=input.x,dy=input.y;
      if(k?.['A']?.isDown||k?.['LEFT']?.isDown)dx=-1;if(k?.['D']?.isDown||k?.['RIGHT']?.isDown)dx=1;
      if(k?.['W']?.isDown||k?.['UP']?.isDown)dy=-1;if(k?.['S']?.isDown||k?.['DOWN']?.isDown)dy=1;
      if(input.paused){dx=0;dy=0;}
      const moving=Math.hypot(dx,dy)>0.12;const running=moving&&(input.sprint||k?.['SHIFT']?.isDown)&&this.stamina>1;
      const speed=running?105:65; const len=Math.max(1,Math.hypot(dx,dy));p.setVelocity(dx/len*speed,dy/len*speed);
      this.stamina=Phaser.Math.Clamp(this.stamina+(running?-22:13)*Math.min(delta,50)/1000,0,100);
      if(moving) {
        const angle=Math.atan2(dy,dx);this.lastFacing=(Math.round(angle/(Math.PI/4))+8)%8;
        p.setOrigin(.5,.5);
        const animKey=`walk-${this.lastFacing}`;
        if(p.anims.currentAnim?.key!==animKey)p.play(animKey);
        p.anims.timeScale=running?1.5:1;
      } else {
        p.anims.stop();
        p.setTexture(`human${this.lastFacing}`);
        p.setOrigin(.5,.5);
      }
      p.setDepth(p.y);
      const actionKey=k?.['E'],spaceKey=k?.['SPACE'];
      const keyboardAction=(actionKey&&Phaser.Input.Keyboard.JustDown(actionKey))||(spaceKey&&Phaser.Input.Keyboard.JustDown(spaceKey));
      if(!input.paused&&(input.action!==this.lastAction||keyboardAction)){
        this.lastAction=input.action;
        const berry=this.berries.find(b=>!b.picked&&Math.hypot(p.x-b.x,p.y-b.y)<65);
        if(berry){berry.picked=true;berry.sprite.setTint(0x849461);this.count++;this.message='Beeren gesammelt · +1';}
        else if(Math.hypot(p.x-1000,p.y-1058)<80){this.stamina=100;this.message='Am Feuer ausgeruht';}
        else if(Math.hypot(p.x-770,p.y-745)<110)this.message='Eine alte Höhle entdeckt';
        else this.message='Hier gibt es nichts zu sammeln';
        this.messageUntil=time+2400;
      }
      if(time-this.lastReport>100){this.lastReport=time;onStatus({x:Math.round(p.x),y:Math.round(p.y),stamina:Math.round(this.stamina),berries:this.count,area:Math.hypot(p.x-770,p.y-745)<180?'Alte Höhle':Math.abs(p.x-riverX(p.y))<220?'Flussufer':'Das grüne Tal',message:time<this.messageUntil?this.message:''});}
    }
  }
  const game=new Phaser.Game({type:Phaser.AUTO,parent,width:parent.clientWidth,height:parent.clientHeight,pixelArt:true,roundPixels:true,backgroundColor:'#718252',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},scene:Wilderness,audio:{noAudio:true},input:{activePointers:4}});(window as unknown as {__game?:Phaser.Game}).__game=game;return game;
}
function riverX(y:number){const t=Phaser.Math.Clamp(y/WORLD,0,1);return (1-t)**3*1570+3*(1-t)**2*t*1290+3*(1-t)*t*t*1750+t**3*1580;}
