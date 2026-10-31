import { clampZoomScale, pinchZoom, ZOOM_KEY, ZOOM_STEP } from './mobile-controls';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CAVES, CAVE_IDS, PAINTINGS, PAINTING_IDS } from './caves';
import { WEATHER } from './weather';
import { TouchControls } from './TouchControls';
import { useEffect, useRef, useState } from 'react';
import { TUTORIAL_STEPS, TUTORIAL_DONE, tutorialLabel } from './tutorial';
import { ChevronDown, Flame, Footprints, Heart, Map, Maximize, Pause, Play, X, Zap, Hand, VolumeX, Backpack, Moon, Sword, Save, Drumstick, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import loader from '@/assets/loader.gif.asset.json';
import cover from '@/assets/cover.jpg.asset.json';
import { ICON_AXE, ICON_SPEAR, ICON_WEDGE, IDLE, type Weapon } from './gear';
import resWood from '@/assets/res-wood.png.asset.json';
import resStone from '@/assets/res-stone.png.asset.json';
import resFlint from '@/assets/res-flint.png.asset.json';
import resFiber from '@/assets/res-fiber.png.asset.json';
const RESOURCES=[['wood','Holz',resWood.url],['stone','Stein',resStone.url],['flint','Feuerstein',resFlint.url],['fiber','Fasern',resFiber.url]] as const;
import type { GameInput, GameStatus } from './world';
import { discountedRecipe, NO_BONUS } from './bonuses';
import { RECIPES, PASSIVE, canCraft, xpForLevel, type ItemId } from './progress';
import iTorch from '../assets/craft/icon-torch.png.asset.json';
import iBandage from '../assets/craft/icon-bandage.png.asset.json';
import iBag from '../assets/craft/icon-bag.png.asset.json';
import iFur from '../assets/craft/icon-fur.png.asset.json';
import iBundle from '../assets/craft/icon-bundle.png.asset.json';
import iBola from '../assets/craft/icon-bola.png.asset.json';
import iAxe from '../assets/craft/icon-axe.png.asset.json';
import iSpear from '../assets/craft/icon-spear.png.asset.json';
const CRAFT_ICON: Partial<Record<ItemId, string>> = { wedge: ICON_WEDGE, axe: iAxe.url, spear: iSpear.url, torch: iTorch.url, bandage: iBandage.url, bag: iBag.url, fur: iFur.url, bundle: iBundle.url, bola: iBola.url };
import { RESOURCE_NAME } from './harvest';
import { formatMinutes, isNight } from './survival';
import { InteractionWheel } from './InteractionWheel';
import type { TalkTarget } from './world';
import { loadSave, saveGame, clearSave, blockSaving, type UiSave } from './save';
import { MAP, CAMP_POS, BIOME_COLOR, biomeAt, riverX, isFord } from './biomes';
import { STORABLES, chestTotal, type Storable } from './storage';
import chestIcon from '@/assets/camp/storage-chest.png.asset.json';
import jerkyIcon from '@/assets/build/jerky-icon.png.asset.json';
import rackIcon from '@/assets/build/rack-0.png.asset.json';
import shelterIcon from '@/assets/build/shelter-2.png.asset.json';
import barricadeIcon from '@/assets/build/barricade-2.png.asset.json';
import { STRUCTURES, STRUCTURE_KINDS, canAfford } from './building';
import { TRAPS, TRAP_KINDS } from './traps';
const BUILD_ICON: Record<string, string>={rack:rackIcon.url,shelter:shelterIcon.url,barricade:barricadeIcon.url,snare:resFiber.url,pit:resStone.url,rattle:resWood.url};
const BUILD_DEFS: Record<string, { name: string; cost: Partial<Record<string, number>>; effect: string }>={...STRUCTURES,...TRAPS};
const STORABLE_LABEL: Record<Storable, string> = { wood: 'Holz', stone: 'Stein', flint: 'Feuerstein', fiber: 'Fasern', berries: 'Beeren', meat: 'Rohes Fleisch', cooked: 'Gebratenes' };
const STORABLE_ICON: Record<Storable, string> = { wood: resWood.url, stone: resStone.url, flint: resFlint.url, fiber: resFiber.url, berries: '✦', meat: '🥩', cooked: '🍖' };

const MAP_LABELS = [['Schneegebirge der Nordics',300,-700],['Gebirge der Drachenmenschen',2450,-700],['Westliches Tal der Wenja',500,1300],['Tal der unbekannten Wenja',2450,1200],['Trockengebiet',300,3000],['Dschungel der Afrikans',2450,3000]] as const;
/** Paints the biome layout into a small image for the mini and world map. */
function renderBiomeMap(){
 const S=32,w=MAP.w/S,h=MAP.h/S;const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');if(!c)return '';
 const img=c.createImageData(w,h);
 for(let j=0;j<h;j++){const y=MAP.y+j*S;const rx=riverX(y);for(let i=0;i<w;i++){const x=MAP.x+i*S;const col=Math.abs(x-rx)<64?(isFord(y)?[150,170,160]:[70,120,150]):BIOME_COLOR[biomeAt(x,y)];const o=(j*w+i)*4;img.data[o]=col[0] ?? 0;img.data[o+1]=col[1] ?? 0;img.data[o+2]=col[2] ?? 0;img.data[o+3]=255;}}
 c.putImageData(img,0,0);return cv.toDataURL();
}

type Slot = 'hand' | 'head' | 'chest' | 'feet';
type Item = { id: string; name: string; slot: Slot; icon: string | undefined; weapon: Weapon | undefined };
const ITEMS: Item[] = [
  { id: 'fists', name: 'Fäuste', slot: 'hand', icon: undefined, weapon: 'none' },
  { id: 'axe', name: 'Steinaxt', slot: 'hand', icon: ICON_AXE, weapon: 'axe' },
  { id: 'spear', name: 'Steinspeer', slot: 'hand', icon: ICON_SPEAR, weapon: 'spear' },
  { id: 'wedge', name: 'Steinkeil', slot: 'hand', icon: ICON_WEDGE, weapon: 'wedge' },
  { id: 'club', name: 'Holzkeule', slot: 'hand', icon: undefined, weapon: 'none' },
];
const SLOT_LABEL: Record<Slot, string> = { hand: 'Haupthand', head: 'Kopf', chest: 'Brust', feet: 'Füße' };

export default function GameView(){
 const host=useRef<HTMLDivElement>(null);
 const setZoom=(z:number)=>{const v=clampZoomScale(z);input.current.zoomScale=v;try{localStorage.setItem(ZOOM_KEY,String(v));}catch{/* ignore */}};
 const stepZoom=(f:number)=>setZoom((input.current.zoomScale??1)*f);
 useEffect(()=>{try{input.current.zoomScale=clampZoomScale(Number(localStorage.getItem(ZOOM_KEY)??1));}catch{/* ignore */}
  const onKey=(e:KeyboardEvent)=>{if(e.target instanceof HTMLInputElement)return;if(e.key==='+'||e.key==='=')stepZoom(ZOOM_STEP);else if(e.key==='-')stepZoom(1/ZOOM_STEP);else if(e.key==='0')setZoom(1);};
  window.addEventListener('keydown',onKey);
  const el=host.current;let start=0,base=1;
  const dist=(t:TouchList)=>{const a=t.item(0),b=t.item(1);return a&&b?Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY):0;};
  const ts=(e:TouchEvent)=>{if(e.touches.length===2){start=dist(e.touches);base=input.current.zoomScale??1;}};
  const tm=(e:TouchEvent)=>{if(e.touches.length===2&&start>0){e.preventDefault();input.current.zoomScale=pinchZoom(base,start,dist(e.touches));}};
  const te=(e:TouchEvent)=>{if(e.touches.length<2&&start>0){start=0;setZoom(input.current.zoomScale??1);}};
  const wh=(e:WheelEvent)=>{if(!e.ctrlKey)return;e.preventDefault();setZoom((input.current.zoomScale??1)*Math.exp(-e.deltaY*0.01));};
  el?.addEventListener('touchstart',ts,{passive:true});el?.addEventListener('touchmove',tm,{passive:false});el?.addEventListener('touchend',te);el?.addEventListener('touchcancel',te);el?.addEventListener('wheel',wh,{passive:false});
  return()=>{window.removeEventListener('keydown',onKey);el?.removeEventListener('touchstart',ts);el?.removeEventListener('touchmove',tm);el?.removeEventListener('touchend',te);el?.removeEventListener('touchcancel',te);el?.removeEventListener('wheel',wh);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const input=useRef<GameInput>({x:0,y:0,sprint:false,action:0,attack:0,paused:false,weapon:'none',sleep:false,crouch:false,respawn:0,eat:null,club:false,craft:null,save:0});
 const [status,setStatus]=useState<GameStatus>({x:1000,y:610,stamina:100,health:100,berries:0,meat:0,cooked:0,nearFire:false,healPulse:0,area:'Höhlenlager',message:'',weapon:'none',sleeping:false,nearBed:false,hidden:false,crouching:false,dead:false,wood:0,stone:0,flint:0,fiber:0,xp:0,level:1,owned:['axe'],hunger:100,warmth:100,day:1,minutes:504});
 const [buildOpen,setBuildOpen]=useState(false);
 const build=(c:NonNullable<GameInput['build']>)=>{input.current.build=c;};
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if((e.key==='b'||e.key==='B')&&!e.repeat){setBuildOpen(o=>{if(o)input.current.build={op:'cancel'};return !o;});}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[]);
 const [ready,setReady]=useState(false);const [error,setError]=useState(false);
 const [paused,setPaused]=useState(false);const [panel,setPanel]=useState<'map'|'settings'|'gear'|null>(null);
 const [equipped,setEquipped]=useState<Record<Slot,string|null>>({hand:'fists',head:null,chest:null,feet:null});
 const [openSlot,setOpenSlot]=useState<Slot|null>(null);
 const [tab,setTab]=useState<'inv'|'craft'>('inv');
 const [hotbar,setHotbar]=useState<(string|null)[]>(['axe',null,null]);
 const [active,setActive]=useState(0);
 const [pick,setPick]=useState<string|null>(null);
 const [talk,setTalk]=useState<TalkTarget|null>(null);
 const talkRef=useRef<TalkTarget|null>(null);talkRef.current=status.talk??null;
 const [uiRestored,setUiRestored]=useState(false);
 const [mapUrl,setMapUrl]=useState('');useEffect(()=>{setMapUrl(renderBiomeMap());},[]);const mapBg={backgroundImage:mapUrl?`url(${mapUrl})`:undefined,backgroundSize:'100% 100%',imageRendering:'pixelated' as const};
 const owns=(id:string)=>id==='fists'||status.owned.includes(id as ItemId);
 const bag=ITEMS.filter(i=>owns(i.id));
 const hold=(id:string)=>{const it=ITEMS.find(i=>i.id===id)??ITEMS[0];if(!it)return;setEquipped(e=>({...e,hand:it.id}));input.current.weapon=it.weapon??'none';input.current.club=it.id==='club';};
 const selectSlot=(n:number)=>{setActive(n);hold(n===0?'fists':hotbar[n-1]??'fists');};
 const assign=(slot:number,id:string)=>{const next=hotbar.map(h=>h===id?null:h);next[slot]=id;setHotbar(next);setPick(null);if(active===slot+1)hold(id);};
 const wheelRef=useRef({hotbar,active,panel});wheelRef.current={hotbar,active,panel};
 useEffect(()=>{const w=(e:WheelEvent)=>{const c=wheelRef.current;if(c.panel)return;const order=[0,...[1,2,3].filter(n=>c.hotbar[n-1])];const i=order.indexOf(c.active);const n=order[(i+(e.deltaY>0?1:-1)+order.length)%order.length];selectSlot(n??0);};window.addEventListener('wheel',w,{passive:true});return()=>window.removeEventListener('wheel',w);});
 const restoreUi=(ui:UiSave|undefined,owned:readonly string[])=>{
  if(ui){
   const ok=(id:string|null):id is string=>!!id&&ITEMS.some(i=>i.id===id)&&(id==='fists'||owned.includes(id));
   const hb=ui.hotbar.map(id=>ok(id)?id:null);const hand=ok(ui.hand)?ui.hand:'fists';
   const it=ITEMS.find(i=>i.id===hand)??ITEMS[0];if(!it)return;
   setHotbar(hb);setActive(ui.active);setEquipped(e=>({...e,hand}));input.current.weapon=it.weapon??'none';input.current.club=hand==='club';
  }
  setUiRestored(true);
 };
 useEffect(()=>{let cancelled=false;let destroy:(()=>void)|undefined;const saved=loadSave();restoreUi(saved?.ui,saved?.game?.owned??['axe']);import('./world').then(({createWorld})=>{if(cancelled||!host.current)return;const game=createWorld(host.current,input.current,s=>{setStatus(s);setReady(true);},saved?.game??null);destroy=()=>game.destroy(true);}).catch(()=>setError(true));return()=>{cancelled=true;destroy?.();};},[]);
 useEffect(()=>{if(!uiRestored)return;saveGame({ui:{hotbar,hand:equipped.hand??'fists',active}});},[uiRestored,hotbar,equipped.hand,active]);
 useEffect(()=>{input.current.paused=paused||panel!==null||talk!==null||!!status.chestOpen;input.current.x=0;input.current.y=0;input.current.sprint=false;input.current.crouch=false;input.current.focus=false;input.current.throwSpear=false;},[paused,panel,talk,status.chestOpen]);
 useEffect(()=>{const t=(e:KeyboardEvent)=>{if(e.key==='Escape')setTalk(null);if((e.key==='t'||e.key==='T')&&!e.repeat){setTalk(c=>c?null:talkRef.current);}};window.addEventListener('keydown',t);return()=>window.removeEventListener('keydown',t);},[]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;e.preventDefault();setPanel(p=>p==='gear'?null:p===null?'gear':p);setOpenSlot(null);};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[]);
 const equip=(item:Item)=>{
   setEquipped(e=>({...e,[item.slot]:item.id}));
   if(item.weapon){input.current.weapon=item.weapon;input.current.club=item.id==='club';const hs=hotbar.indexOf(item.id);setActive(item.id==='fists'?0:hs>=0?hs+1:active);}
   setOpenSlot(null);
 };
 const weapon=ITEMS.find(i=>i.id===equipped.hand);
 return <div className="game-page">
  <main className="game-shell">
   <section className="game-frame" aria-label="Steinzeit-Spielwelt">
    <div className="world-canvas" ref={host}/><div className="zoom-controls" aria-label="Zoom"><Button variant="ghost" size="icon" className="glass-icon" title="Heranzoomen (+)" aria-label="Heranzoomen" onClick={()=>stepZoom(ZOOM_STEP)}><ZoomIn/></Button><Button variant="ghost" size="icon" className="glass-icon" title="Herauszoomen (−)" aria-label="Herauszoomen" onClick={()=>stepZoom(1/ZOOM_STEP)}><ZoomOut/></Button><Button variant="ghost" size="icon" className="glass-icon" title="Zoom zurücksetzen (0)" aria-label="Zoom zurücksetzen" onClick={()=>setZoom(1)}><RotateCcw/></Button></div>
    {!ready&&<div className="game-loading" style={{backgroundImage:`url(${cover.url})`}}><img src={loader.url} alt="" className="loader-icon"/>{error?'Die Wildnis konnte nicht geladen werden.':'Die Wildnis erwacht …'}</div>}
    <div className="top-shade"/>
    <div className="hud"><div className="portrait"><img src={IDLE[status.weapon][2]} alt="Dein Höhlenmensch"/></div><div className="vitals"><div className="vitals-label"><span>HÖHLENMENSCH</span><span>LV. {status.level}</span></div><div className="xp-track" title={`${status.xp} EP`}><i style={{width:`${Math.min(100,(status.xp-xpForLevel(status.level))/(xpForLevel(status.level+1)-xpForLevel(status.level))*100)}%`}}/></div><div className="stat-row"><Heart className="health-icon"/><div key={status.healPulse} className={`stat-track health ${status.healPulse?"is-healing":""}`}><i style={{width:`${status.health}%`}}/></div><span>{status.health}</span></div><div className="stat-row"><Zap className="energy-icon"/><div className="stat-track energy"><i style={{width:`${status.stamina}%`}}/></div><span>{status.stamina}</span></div><div className="stat-row duo"><Drumstick className="hunger-icon"/><div className={`stat-track hunger ${status.hunger<25?'is-low':''}`} title={`Hunger ${status.hunger}`}><i style={{width:`${status.hunger}%`}}/></div><Snowflake className="warmth-icon"/><div className={`stat-track warmth ${status.warmth<30?'is-low':''}`} title={`Wärme ${status.warmth}`}><i style={{width:`${status.warmth}%`}}/></div></div></div><Button variant="ghost" size="icon" className="glass-icon pause-button" title={paused?'Fortsetzen':'Pause'} aria-label={paused?'Fortsetzen':'Pause'} onClick={()=>setPaused(!paused)}>{paused?<Play/>:<Pause/>}</Button></div>{!!status.squad?.length&&<div className="squad-hud" aria-label="Jagdtrupp">{status.squad.map(m=>{const r=m.hp/m.max;return <div key={m.id} className={`squad-member ${m.down?"is-down":""}`}><div className="squad-portrait"><img src={m.portrait} alt={m.name}/></div><div className="squad-info"><span className="squad-name">{m.name}<em>{m.down?`KO · ${m.down}s`:`${m.hp}/${m.max}`}</em></span><div className="squad-track"><i className={r<0.3?"low":r<0.6?"mid":""} style={{width:`${m.down?0:r*100}%`}}/></div></div></div>;})}</div>}
    <div className="location-label"><span className="live-dot"/>{status.area}<ChevronDown size={12}/></div>
    <Button variant="ghost" className="mini-map" aria-label="Karte öffnen" title="Karte öffnen" onClick={()=>setPanel('map')}><div className="map-terrain" style={mapBg}><i className="map-player" style={{left:`${((status.caves?.current?CAVES[status.caves.current].x:status.x)-MAP.x)/MAP.w*100}%`,top:`${((status.caves?.current?CAVES[status.caves.current].y:status.y)-MAP.y)/MAP.h*100}%`}}/><span className="north-marker">N</span></div><span className="map-caption"><Map size={10}/> KARTE</span></Button>
    <Button variant="ghost" size="icon" className="glass-icon gear-button" aria-label="Inventar öffnen" title="Inventar" onClick={()=>setPanel('gear')}><Backpack/></Button>
    <Button disabled={!!status.caves?.current} variant="ghost" size="icon" className={`glass-icon build-button ${buildOpen?'is-active':''}`} aria-label="Bauen" title="Bauen · Taste B" onClick={()=>{if(buildOpen)build({op:'cancel'});setBuildOpen(!buildOpen);}}><img src={rackIcon.url} alt="" style={{width:24,height:24,imageRendering:'pixelated'}}/></Button>
    {ready&&buildOpen&&!status.caves?.current&&!panel&&!talk&&<div className="build-bar" role="toolbar" aria-label="Baumenü">
      <div className="build-options">{[...STRUCTURE_KINDS,...TRAP_KINDS].map(k=>{const d=BUILD_DEFS[k]!;const ok=canAfford(d.cost,status);return <Button variant="ghost" key={k} type="button" className={`build-option ${status.build?.kind===k?'is-selected':''}`} disabled={!ok&&status.build?.kind!==k} title={d.effect} onClick={()=>build({op:'select',kind:k})}><img src={BUILD_ICON[k]} alt=""/><strong>{d.name}</strong><em>{Object.entries(d.cost).map(([r,n])=>`${n} ${RESOURCE_NAME[r as keyof typeof RESOURCE_NAME]}`).join(' · ')}</em></Button>;})}</div>
      <div className="build-actions">{status.build?<><span className={`build-state ${status.build.error?'is-bad':''}`}>{status.build.error??'Platz frei'}</span>{STRUCTURES[status.build.kind].rotates&&<Button size="sm" variant="outline" onClick={()=>build({op:'rotate'})}>Drehen</Button>}<Button size="sm" disabled={!!status.build.error} onClick={()=>build({op:'place'})}>Platzieren</Button></>:<span className="build-state">Wähle einen Bau · er erscheint vor dir</span>}{status.nearOwnBuild&&<Button size="sm" variant="outline" onClick={()=>build({op:'remove'})}>Abbauen</Button>}<Button size="sm" variant="ghost" onClick={()=>{build({op:'cancel'});setBuildOpen(false);}}>Fertig</Button></div>
    </div>}
    {!status.caves?.current&&<div className="camp-marker"><Flame size={12}/> LAGERFEUER <span>·</span> {Math.round(Math.hypot(status.x-CAMP_POS.x,status.y-CAMP_POS.y-40))} m</div>}
    {ready&&!status.caves?.current&&status.tutorial&&status.tutorial.step<TUTORIAL_DONE&&!status.dead&&<div className="tutorial-card" role="status" aria-label="Einführung"><span className="eyebrow">ZIEL {status.tutorial.step+1}/{TUTORIAL_DONE}</span><strong>{TUTORIAL_STEPS[status.tutorial.step]?.title}</strong><span>{TUTORIAL_STEPS[status.tutorial.step]?.hint}{tutorialLabel(status.tutorial)&&` · ${tutorialLabel(status.tutorial)}`}</span></div>}
    {status.message&&<div className="game-toast" role="status"><Hand size={16}/>{status.message}</div>}
    {status.nearFire&&status.meat>0&&!status.nearBed&&<div className="sleep-hint"><Flame size={14}/> AKTION zum Fleisch braten</div>}
    {status.nearRack&&!status.build&&<div className="sleep-hint"><img src={jerkyIcon.url} alt="" style={{width:16,height:16,imageRendering:'pixelated'}}/> Gestell {status.nearRack.hung}/3{status.nearRack.ready?` · ${status.nearRack.ready} trocken`:''} · AKTION {status.meat>0?'Fleisch aufhängen':'abnehmen'}</div>}
    {ready&&status.cavePrompt&&!paused&&!panel&&<Button variant="outline" className="sleep-hint" onClick={()=>input.current.action++}>{status.cavePrompt}</Button>}
    {ready&&status.caves?.current&&!paused&&!panel&&<div className="cave-tools" aria-label="Höhlenvorräte">
      <span>Obsidian {status.caves.obsidian} · Pigmente {status.caves.pigment}</span>
      <Button size="sm" variant="outline" disabled={status.caves.sharpened||status.caves.obsidian<3} onClick={()=>{input.current.caveCommand={op:'sharpen'};}}>{status.caves.sharpened?'Klingen geschärft':'Klingen · 3 Obsidian'}</Button>
      <Button size="sm" variant="outline" disabled={status.wood<4||status.stone<2} onClick={()=>{input.current.caveCommand={op:'fire'};}}><Flame size={14}/> Feuer · 4 Holz, 2 Stein</Button>
      <Button size="sm" variant="outline" disabled={status.wood<3||status.fiber<4} onClick={()=>{input.current.caveCommand={op:'shelter'};}}><Moon size={14}/> Unterstand · 3 Holz, 4 Fasern</Button>
    </div>}
    {status.nearPaint&&!paused&&!panel&&<div className="cave-ritual" role="group" aria-label="Ritualwand"><strong>Ritualwand</strong>{PAINTING_IDS.map(id=>{const d=PAINTINGS[id],done=status.caves?.paintings.includes(id);return <Button key={id} variant="outline" size="sm" disabled={done||(status.caves?.pigment??0)<d.cost} title={d.effect} onClick={()=>{input.current.caveCommand={op:'paint',id};}}>{done?'✓ ':''}{d.name} · {done?'Vollendet':`${d.cost} Pigmente`}</Button>;})}</div>}
    {status.nearBed&&!status.sleeping&&<div className="sleep-hint"><Moon size={14}/> AKTION zum Schlafen</div>}
    {status.hidden&&!status.sleeping&&!status.dead&&<div className="stealth-hint">👁 Auf der Lauer</div>}
     {status.crouching&&!status.hidden&&!status.dead&&<div className="stealth-hint">Geduckt · leiser</div>}
     {status.dead&&<div className="death-screen" role="alertdialog" aria-label="Du bist gestorben"><span className="eyebrow">DIE WILDNIS IST GNADENLOS</span><h2>Du bist gefallen</h2><p>{status.meat} Fleisch · {status.berries} Beeren gesammelt</p><Button className="resume-button" onClick={()=>input.current.respawn++}><Flame size={16}/> Am Lagerfeuer erwachen</Button></div>}
    {ready&&!paused&&!panel&&!talk&&!status.chestOpen&&!status.dead&&!status.sleeping&&<TouchControls input={input.current} crouching={status.crouching} spear={status.weapon==='spear'} inCave={!!status.caves?.current}/>}

    {ready&&status.talk&&!talk&&!panel&&!paused&&<Button variant="outline" className="sleep-hint talk-hint" onClick={()=>setTalk(status.talk??null)}>{status.talk.name} · Interagieren</Button>}
    {ready&&status.nearChest&&!status.chestOpen&&!talk&&!panel&&!paused&&<Button variant="outline" className="sleep-hint chest-hint" onClick={()=>{input.current.chestToggle=(input.current.chestToggle??0)+1;}}><img src={chestIcon.url} alt="" style={{width:20,height:20,imageRendering:'pixelated'}}/> Vorratskiste öffnen</Button>}
    {status.chestOpen&&<div className="interaction-overlay" role="dialog" aria-modal="true" aria-label="Vorratskiste" onKeyDown={e=>{if(e.key==='Escape')input.current.chestToggle=(input.current.chestToggle??0)+1;}}>
      <div className="interaction-panel chest-panel">
        <div className="interaction-heading">
          <div><div className="eyebrow">LAGER · {status.chest?chestTotal(status.chest):0} VORRÄTE</div><h2>Vorratskiste</h2></div>
          <Button type="button" variant="ghost" size="icon" onClick={()=>{input.current.chestToggle=(input.current.chestToggle??0)+1;}} aria-label="Kiste schließen">✕</Button>
        </div>
        <div className="chest-rows">
          {STORABLES.map(kind=>{
            const have=kind==='berries'?status.berries:kind==='meat'?status.meat:kind==='cooked'?status.cooked:status[kind];
            const stored=status.chest?.[kind]??0;
            const icon=STORABLE_ICON[kind];
            const transfer=(n:number)=>{input.current.chestTransfer={kind,n};};
            return <div key={kind} className="chest-row">
              <span className="chest-name">{icon.startsWith('/')?<img src={icon} alt=""/>:<i>{icon}</i>} {STORABLE_LABEL[kind]}</span>
              <span className="chest-counts">Beutel {have} · Kiste {stored}</span>
              <span className="chest-actions">
                <Button size="sm" variant="outline" disabled={have<=0} onClick={()=>transfer(1)}>+1</Button>
                <Button size="sm" variant="outline" disabled={have<=0} onClick={()=>transfer(Math.min(5,have))}>+5</Button>
                <Button size="sm" variant="outline" disabled={stored<=0} onClick={()=>transfer(-1)}>−1</Button>
                <Button size="sm" variant="outline" disabled={stored<=0} onClick={()=>transfer(-Math.min(5,stored))}>−5</Button>
              </span>
            </div>;
          })}
        </div>
        <p className="chest-hintline">+ legt in die Kiste · − nimmt heraus</p>
      </div>
    </div>}
    {talk&&<InteractionWheel key={talk.id} context={talk} name={talk.name} profile={talk.profile} dialogues={talk.dialogues} onDialogueChoice={(dialogue,choice)=>{input.current.dialogueChoice={target:talk.id,dialogue,choice};setTalk(null);}} onClose={()=>setTalk(null)} onChoose={id=>{input.current.interaction={id,target:talk.id};setTalk(null);}}/>}
    {ready&&<div className="hotbar" role="toolbar" aria-label="Schnellmenü">{[0,1,2,3].map(n=>{const id=n===0?'fists':hotbar[n-1];const it=id?ITEMS.find(i=>i.id===id):undefined;return <button key={n} className={`hot-slot ${active===n?'is-active':''}`} aria-label={it?.name??`Leerer Slot ${n}`} title={it?.name??'Im Rucksack belegen'} onClick={()=>it?selectSlot(n):setPanel('gear')}>{it?.icon?<img src={it.icon} alt=""/>:<span className="slot-sil">{it?(it.id==='fists'?'●':'✦'):''}</span>}<em>{n===0?'H':n}</em></button>;})}</div>}
    {status.boss&&<div className="boss-bar" role="status"><div className="boss-name">⚔ {status.boss.name}{status.boss.down?" · AM BODEN – FINISHER!":""}</div><div className="boss-track"><div className="boss-fill" style={{width:`${Math.max(0,status.boss.hp/status.boss.max*100)}%`}}/></div></div>}<div className="game-bottom"><Button variant="ghost" className="food-quick" title="Beeren essen (+15) · Taste 1" onClick={()=>{input.current.eat='berries';}}><span className="berry-icon">✦</span> {status.berries} <span className="resource-label">BEEREN</span></Button><Button variant="ghost" className="food-quick" title="Rohes Fleisch essen (+20) · Taste 2" onClick={()=>{input.current.eat='meat';}}><span className="berry-icon">🥩</span> {status.meat} <span className="resource-label">ROH</span></Button><Button variant="ghost" className="food-quick" title="Gebratenes Fleisch essen (+45, volle Ausdauer) · Taste 3" onClick={()=>{input.current.eat='cooked';}}><span className="berry-icon">🍖</span> {status.cooked} <span className="resource-label">GEBRATEN</span></Button>{(status.jerky??0)>0&&<Button variant="ghost" className="food-quick" title="Dörrfleisch essen (+30, halbe Ausdauer) · Taste 4" onClick={()=>{input.current.eat='jerky';}}><img src={jerkyIcon.url} alt="" style={{width:16,height:16,imageRendering:'pixelated'}}/> {status.jerky} <span className="resource-label">DÖRR</span></Button>}<span><span className="sun-icon">{isNight(status.minutes)?'☾':'☀'}</span>{status.weather&&status.weather!=='clear'&&<span title={WEATHER[status.weather].name}> {WEATHER[status.weather].icon}</span>} TAG {status.day} <span className="bottom-dot">·</span> {formatMinutes(status.minutes)}</span><Button variant="ghost" size="icon" aria-label="Vollbild" title="Vollbild" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void document.querySelector('.game-frame')?.requestFullscreen?.();}}><Maximize/></Button></div>
    {(paused||panel)&&<div className="pause-overlay"><div className={`pause-panel ${panel==='gear'?'gear-panel':''}`}><div className="panel-heading"><span className="eyebrow">URZEIT</span><Button variant="ghost" size="icon" aria-label="Schließen" onClick={()=>{setPanel(null);setPaused(false);setOpenSlot(null);}}><X/></Button></div>
     {panel==='gear'?<>
      <h2>{tab==='craft'?'Handwerk':'Ausrüstung'}</h2>
      <div className="gear-tabs"><button className={tab==='inv'?'is-on':''} onClick={()=>setTab('inv')}>Rucksack</button><button className={tab==='craft'?'is-on':''} onClick={()=>{setTab('craft');setOpenSlot(null);}}>Handwerk</button></div>
      {tab==='craft'?<div className="gear-items"><p className="gear-items-title">Stufe {status.level} · {status.xp} EP</p>{RECIPES.map(base=>{const rc=discountedRecipe(base,{...NO_BONUS,craftDiscount:!!status.craftDiscount});const ok=canCraft(rc,status,status.level,status.owned);const have=status.owned.includes(rc.id);const locked=status.level<rc.level;return <div key={rc.id} className={`recipe ${ok?'is-ready':''}`}>{CRAFT_ICON[rc.id]&&<img src={CRAFT_ICON[rc.id]} alt="" style={{width:32,height:32,imageRendering:'pixelated'}}/>}<div><strong>{rc.name}</strong>{rc.effect&&<small>{rc.effect}</small>}<small>{locked?`Ab Stufe ${rc.level}`:have?'Bereits im Besitz':''}</small><span className="recipe-cost">{Object.entries(rc.cost).map(([k,n])=><i key={k} className={status[k as keyof typeof RESOURCE_NAME]>=n?'ok':''}>{RESOURCE_NAME[k as keyof typeof RESOURCE_NAME]} {status[k as keyof typeof RESOURCE_NAME]}/{n}</i>)}</span></div><Button size="sm" disabled={!ok} onClick={()=>{input.current.craft=rc.id;}}>Herstellen</Button></div>;})}</div>:<>
      <div className="gear-layout">
       <div className="gear-slots">
        {(['head','chest','feet'] as Slot[]).map(s=>{const it=ITEMS.find(i=>i.id===equipped[s]);return <button key={s} className={`gear-slot ${openSlot===s?'is-open':''}`} onClick={()=>setOpenSlot(openSlot===s?null:s)}>{it?.icon?<img src={it.icon} alt={it.name}/>:<span className="slot-sil">{s==='head'?'◯':s==='chest'?'▣':'▽'}</span>}<em>{SLOT_LABEL[s]}</em></button>;})}
       </div>
       <div className="gear-figure"><img src={IDLE[status.weapon][2]} alt="Charakter"/><div className="gear-health"><i style={{width:`${status.health}%`}}/></div></div>
       <div className="gear-slots">
        {(['hand'] as Slot[]).map(s=>{const it=ITEMS.find(i=>i.id===equipped[s]);return <button key={s} className={`gear-slot ${openSlot===s?'is-open':''}`} onClick={()=>setOpenSlot(openSlot===s?null:s)}>{it?.icon?<img src={it.icon} alt={it.name}/>:<span className="slot-sil">●</span>}<em>{it?.name??SLOT_LABEL[s]}</em></button>;})}
       </div>
      </div>
      {openSlot?<div className="gear-items"><p className="gear-items-title">{SLOT_LABEL[openSlot]} wählen</p><div className="gear-grid">{ITEMS.filter(i=>i.slot===openSlot&&owns(i.id)).map(i=><button key={i.id} className={`gear-item ${equipped[openSlot]===i.id?'is-equipped':''}`} onClick={()=>equip(i)}>{i.icon?<img src={i.icon} alt={i.name}/>:<span className="slot-sil">{i.id==='fists'?'●':'✦'}</span>}<em>{i.name}</em></button>)}</div></div>
       :<div className="gear-items"><p className="gear-items-title">Proviant · antippen zum Essen</p><div className="gear-grid">{([['berries','Beeren','✦',status.berries,15],['meat','Rohes Fleisch','🥩',status.meat,20],['cooked','Gebraten','🍖',status.cooked,45]] as const).map(([id,name,ic,n,hp])=><button key={id} className="gear-item" disabled={n<=0} onClick={()=>{input.current.eat=id;}}><span className="slot-sil">{ic}</span><em>{name} ×{n} · +{hp}</em></button>)}</div><p className="gear-items-title">Ressourcen</p><div className="gear-grid">{RESOURCES.map(([id,name,icon])=><div key={id} className="gear-item is-static"><img src={icon} alt={name}/><em>{name} ×{status[id]}</em></div>)}</div>{status.owned.some(id=>PASSIVE.includes(id))&&<><p className="gear-items-title">Hilfsmittel · wirken automatisch</p><div className="gear-grid">{RECIPES.filter(rc=>PASSIVE.includes(rc.id)&&status.owned.includes(rc.id)).map(rc=><div key={rc.id} className="gear-item is-static" title={rc.effect}><img src={CRAFT_ICON[rc.id]} alt={rc.name}/><em>{rc.name}</em></div>)}</div></>}<p className="gear-items-title">Beutel · antippen für Schnellslot</p>{pick&&<div className="assign-row">{ITEMS.find(i=>i.id===pick)?.name} auf Slot: {[0,1,2].map(n=><Button key={n} size="sm" variant="outline" onClick={()=>assign(n,pick)}>{n+1}</Button>)}<Button size="sm" variant="ghost" onClick={()=>{const it=ITEMS.find(i=>i.id===pick);if(it)equip(it);setPick(null);}}>Ausrüsten</Button></div>}<div className="gear-grid">{bag.map(i=><button key={i.id} className={`gear-item ${equipped[i.slot]===i.id?'is-equipped':''}`} onClick={()=>i.id==='fists'?equip(i):setPick(i.id)}>{i.icon?<img src={i.icon} alt={i.name}/>:<span className="slot-sil">{i.id==='fists'?'●':'✦'}</span>}<em>{i.name}{hotbar.includes(i.id)?` · ${hotbar.indexOf(i.id)+1}`:''}</em></button>)}</div></div>}</>}
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);setOpenSlot(null);}}><Play size={16}/> Weiter erkunden</Button>
     </>:panel==='map'?<>
      <h2>Die Urzeit-Welt</h2>
      <div className="large-map" style={{...mapBg,aspectRatio:`${MAP.w}/${MAP.h}`,height:"auto",maxHeight:"52vh",margin:"0 auto"}}>{MAP_LABELS.map(([n,x,y])=><span key={n} className="large-map-region" style={{left:`${(x-MAP.x)/MAP.w*100}%`,top:`${(y-MAP.y)/MAP.h*100}%`}}>{n}</span>)}{CAVE_IDS.map(id=><span key={id} className="large-map-region" style={{left:`${(CAVES[id].x-MAP.x)/MAP.w*100}%`,top:`${(CAVES[id].y-MAP.y)/MAP.h*100}%`}}>◭ {CAVES[id].name}</span>)}<span className="large-map-fire" style={{left:`${(CAMP_POS.x-MAP.x)/MAP.w*100}%`,top:`${(CAMP_POS.y-MAP.y)/MAP.h*100}%`}}>♨ Lager</span><i className="map-player" style={{left:`${((status.caves?.current?CAVES[status.caves.current].x:status.x)-MAP.x)/MAP.w*100}%`,top:`${((status.caves?.current?CAVES[status.caves.current].y:status.y)-MAP.y)/MAP.h*100}%`}}/><span className="north-marker">N</span></div><p className="coordinates">POSITION {status.x} / {status.y}</p>
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);}}><Play size={16}/> Weiter erkunden</Button>
     </>:panel==='settings'?<>
      <h2>Einstellungen</h2>
      <div className="setting-row"><span>Ton</span><Button variant="outline" disabled title="In dieser ersten Version noch ohne Ton"><VolumeX/> Aus</Button></div><div className="setting-row"><span>Darstellung</span><span>Pixel · 8 Richtungen</span></div><div className="setting-row"><span>Version</span><span>Alpha 0.1</span></div>
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);}}><Play size={16}/> Weiter erkunden</Button>
     </>:<>
      <h2>Eine kurze Rast.</h2>
      {!!status.caves?.paintings.length&&<div className="cave-blessings"><strong>Höhlenmalereien</strong>{status.caves.paintings.map(id=><p key={id}>{PAINTINGS[id].name} · {PAINTINGS[id].effect}</p>)}</div>}
      {status.caves?.sharpened&&<p>Obsidian-Klingen · Speer und Keule +25 % Schaden</p>}
      <p>Deine Wildnis wartet auf dich. Dein Fortschritt wird automatisch gespeichert.</p>
      <details className="controls-overview" style={{textAlign:'left',maxHeight:'40vh',overflowY:'auto',fontSize:12,lineHeight:1.5}}><summary style={{cursor:'pointer',fontWeight:700}}>Steuerung</summary>
       <table style={{width:'100%',borderCollapse:'collapse'}}><tbody>{([
        ['WASD / Pfeile · Joystick','Laufen'],['Shift','Sprinten'],['C / Strg','Ducken / Verstecken'],['Q / Linksklick','Schlagen / Angreifen'],['F / Rechtsklick','Ziel anvisieren'],['R','Speer werfen · im Baumodus drehen'],['E','Sammeln / Kiste / Gestell / Aufnehmen'],['T','Personen-Optionsrad öffnen'],['Tab','Inventar & Ausrüstung'],['B','Baumenü öffnen'],['Leertaste','Bau platzieren'],['X','Eigenen Bau abbauen'],['1 / 2 / 3 / 4','Beeren / Fleisch / Gebratenes / Dörrfleisch essen'],
       ] as const).map(([k,d])=><tr key={k}><td style={{padding:'2px 8px 2px 0',fontWeight:700,overflowWrap:'anywhere'}}>{k}</td><td>{d}</td></tr>)}</tbody></table>
       <dl className="mobile-control-list"><dt>Joystick</dt><dd>Laufen</dd><dt>Fußspuren / Pfeil ↓</dt><dd>Sprinten / Ducken ein–aus</dd><dt>Fadenkreuz / Wurfpfeil</dt><dd>Tier anvisieren / Speer werfen</dd><dt>Schwert / Hand</dt><dd>Angriff oder Finisher / Aktion</dd><dt>Rucksack / Gestell</dt><dd>Ausrüstung, Handwerk / Bauen</dd><dt>Personenname</dt><dd>Gespräche und Trupp-Befehle</dd><dt>Waffe / Nahrung</dt><dd>Antippen zum Wechseln / Essen</dd></dl></details>
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);}}><Play size={16}/> Weiter erkunden</Button>
      <Button variant="outline" onClick={()=>{input.current.save++;}}><Save size={16}/> Jetzt speichern</Button>
      <Button variant="ghost" onClick={()=>{if(window.confirm('Neues Spiel beginnen? Dein Spielstand wird gelöscht.')){blockSaving();clearSave();window.location.reload();}}}>Neues Spiel</Button>
     </>}
    </div></div>}
   </section>
  </main>
 </div>;
}
