import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Flame, Footprints, Heart, Map, Maximize, Pause, Play, X, Zap, Hand, VolumeX, Backpack, Moon, Sword } from 'lucide-react';
import { Button } from '@/components/ui/button';
import loader from '@/assets/loader.gif.asset.json';
import cover from '@/assets/cover.jpg.asset.json';
import { ICON_AXE, ICON_SPEAR, IDLE, type Weapon } from './gear';
import type { GameInput, GameStatus } from './world';

type Slot = 'hand' | 'head' | 'chest' | 'feet';
type Item = { id: string; name: string; slot: Slot; icon: string | undefined; weapon: Weapon | undefined };
const ITEMS: Item[] = [
  { id: 'fists', name: 'Fäuste', slot: 'hand', icon: undefined, weapon: 'none' },
  { id: 'axe', name: 'Steinaxt', slot: 'hand', icon: ICON_AXE, weapon: 'axe' },
  { id: 'spear', name: 'Steinspeer', slot: 'hand', icon: ICON_SPEAR, weapon: 'spear' },
];
const SLOT_LABEL: Record<Slot, string> = { hand: 'Haupthand', head: 'Kopf', chest: 'Brust', feet: 'Füße' };

export default function GameView(){
 const host=useRef<HTMLDivElement>(null);
 const input=useRef<GameInput>({x:0,y:0,sprint:false,action:0,attack:0,paused:false,weapon:'none',sleep:false,crouch:false,respawn:0,eat:null});
 const [status,setStatus]=useState<GameStatus>({x:1000,y:610,stamina:100,health:100,berries:0,meat:0,cooked:0,nearFire:false,healPulse:0,area:'Höhlenlager',message:'',weapon:'none',sleeping:false,nearBed:false,hidden:false,crouching:false,dead:false});
 const [ready,setReady]=useState(false);const [error,setError]=useState(false);
 const [paused,setPaused]=useState(false);const [panel,setPanel]=useState<'map'|'settings'|'gear'|null>(null);
 const [knob,setKnob]=useState({x:0,y:0});const [sprinting,setSprinting]=useState(false);
 const [equipped,setEquipped]=useState<Record<Slot,string|null>>({hand:'fists',head:null,chest:null,feet:null});
 const [openSlot,setOpenSlot]=useState<Slot|null>(null);
 useEffect(()=>{let cancelled=false;let destroy:(()=>void)|undefined;import('./world').then(({createWorld})=>{if(cancelled||!host.current)return;const game=createWorld(host.current,input.current,s=>{setStatus(s);setReady(true);});destroy=()=>game.destroy(true);}).catch(()=>setError(true));return()=>{cancelled=true;destroy?.();};},[]);
 useEffect(()=>{input.current.paused=paused||panel!==null;input.current.x=0;input.current.y=0;setKnob({x:0,y:0});},[paused,panel]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;e.preventDefault();setPanel(p=>p==='gear'?null:p===null?'gear':p);setOpenSlot(null);};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[]);
 const equip=(item:Item)=>{
   setEquipped(e=>({...e,[item.slot]:item.id}));
   if(item.weapon)input.current.weapon=item.weapon;
   setOpenSlot(null);
 };
 const weapon=ITEMS.find(i=>i.id===equipped.hand);
 const move=(e:React.PointerEvent<HTMLDivElement>)=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;const len=Math.hypot(x,y),scale=len>40?40/len:1;setKnob({x:x*scale,y:y*scale});input.current.x=x*scale/40;input.current.y=y*scale/40;};
 const release=()=>{input.current.x=0;input.current.y=0;setKnob({x:0,y:0});};
 return <div className="game-page">
  <main className="game-shell">
   <section className="game-frame" aria-label="Steinzeit-Spielwelt">
    <div className="world-canvas" ref={host}/>
    {!ready&&<div className="game-loading" style={{backgroundImage:`url(${cover.url})`}}><img src={loader.url} alt="" className="loader-icon"/>{error?'Die Wildnis konnte nicht geladen werden.':'Die Wildnis erwacht …'}</div>}
    <div className="top-shade"/>
    <div className="hud"><div className="portrait"><img src={IDLE[status.weapon][2]} alt="Dein Höhlenmensch"/></div><div className="vitals"><div className="vitals-label"><span>HÖHLENMENSCH</span><span>LV. 1</span></div><div className="stat-row"><Heart className="health-icon"/><div key={status.healPulse} className={`stat-track health ${status.healPulse?"is-healing":""}`}><i style={{width:`${status.health}%`}}/></div><span>{status.health}</span></div><div className="stat-row"><Zap className="energy-icon"/><div className="stat-track energy"><i style={{width:`${status.stamina}%`}}/></div><span>{status.stamina}</span></div></div><Button variant="ghost" size="icon" className="glass-icon pause-button" title={paused?'Fortsetzen':'Pause'} aria-label={paused?'Fortsetzen':'Pause'} onClick={()=>setPaused(!paused)}>{paused?<Play/>:<Pause/>}</Button></div>
    <div className="location-label"><span className="live-dot"/>{status.area}<ChevronDown size={12}/></div>
    <Button variant="ghost" className="mini-map" aria-label="Karte öffnen" title="Karte öffnen" onClick={()=>setPanel('map')}><div className="map-terrain"><span className="map-river"/><span className="map-mountain"/><i className="map-player" style={{left:`${status.x/2048*100}%`,top:`${status.y/2048*100}%`}}/><span className="north-marker">N</span></div><span className="map-caption"><Map size={10}/> KARTE</span></Button>
    <Button variant="ghost" size="icon" className="glass-icon gear-button" aria-label="Inventar öffnen" title="Inventar" onClick={()=>setPanel('gear')}><Backpack/></Button>
    <div className="camp-marker"><Flame size={12}/> LAGERFEUER <span>·</span> {Math.round(Math.hypot(status.x-1000,status.y-680))} m</div>
    {status.message&&<div className="game-toast" role="status"><Hand size={16}/>{status.message}</div>}
    {status.nearFire&&status.meat>0&&!status.nearBed&&<div className="sleep-hint"><Flame size={14}/> AKTION zum Fleisch braten</div>}
    {status.nearBed&&!status.sleeping&&<div className="sleep-hint"><Moon size={14}/> AKTION zum Schlafen</div>}
    {status.hidden&&!status.sleeping&&!status.dead&&<div className="stealth-hint">👁 Auf der Lauer</div>}
     {status.crouching&&!status.hidden&&!status.dead&&<div className="stealth-hint">Geduckt · leiser</div>}
     {status.dead&&<div className="death-screen" role="alertdialog" aria-label="Du bist gestorben"><span className="eyebrow">DIE WILDNIS IST GNADENLOS</span><h2>Du bist gefallen</h2><p>{status.meat} Fleisch · {status.berries} Beeren gesammelt</p><Button className="resume-button" onClick={()=>input.current.respawn++}><Flame size={16}/> Am Lagerfeuer erwachen</Button></div>}
    <div className="touch-controls"><div className="joystick-area"><div className="joystick" role="group" aria-label="Bewegungsjoystick" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e);}} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><span className="joystick-arrow up">⌃</span><span className="joystick-arrow down">⌄</span><span className="joystick-arrow left">‹</span><span className="joystick-arrow right">›</span><span className="joystick-knob" style={{transform:`translate(${knob.x}px,${knob.y}px)`}}><span/></span></div><span className="control-caption">BEWEGEN</span></div><div className="action-area"><Button variant="ghost" className={`run-button ${sprinting?'is-active':''}`} aria-label="Sprinten" title="Sprinten" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);input.current.sprint=true;setSprinting(true);}} onPointerUp={()=>{input.current.sprint=false;setSprinting(false);}} onPointerCancel={()=>{input.current.sprint=false;setSprinting(false);}} onLostPointerCapture={()=>{input.current.sprint=false;setSprinting(false);}}><Footprints/></Button><Button variant="ghost" className="attack-button" aria-label="Angreifen" title="Angreifen" onClick={()=>input.current.attack++}><Sword/></Button><div className="gather-wrap"><Button variant="ghost" className="gather-button" aria-label="Sammeln" title="Sammeln, schlafen oder am Feuer ausruhen" onClick={()=>input.current.action++}><Hand/></Button><span className="control-caption">AKTION</span></div></div></div>
    <div className="game-bottom"><button className="food-quick" title="Beeren essen (+15) · Taste 1" onClick={()=>{input.current.eat='berries';}}><span className="berry-icon">✦</span> {status.berries} <span className="resource-label">BEEREN</span></button><button className="food-quick" title="Rohes Fleisch essen (+20) · Taste 2" onClick={()=>{input.current.eat='meat';}}><span className="berry-icon">🥩</span> {status.meat} <span className="resource-label">ROH</span></button><button className="food-quick" title="Gebratenes Fleisch essen (+45, volle Ausdauer) · Taste 3" onClick={()=>{input.current.eat='cooked';}}><span className="berry-icon">🍖</span> {status.cooked} <span className="resource-label">GEBRATEN</span></button><span><span className="sun-icon">☀</span> TAG 1 <span className="bottom-dot">·</span> 08:24</span><Button variant="ghost" size="icon" aria-label="Vollbild" title="Vollbild" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void document.querySelector('.game-frame')?.requestFullscreen?.();}}><Maximize/></Button></div>
    {(paused||panel)&&<div className="pause-overlay"><div className={`pause-panel ${panel==='gear'?'gear-panel':''}`}><div className="panel-heading"><span className="eyebrow">URZEIT</span><Button variant="ghost" size="icon" aria-label="Schließen" onClick={()=>{setPanel(null);setPaused(false);setOpenSlot(null);}}><X/></Button></div>
     {panel==='gear'?<>
      <h2>Ausrüstung</h2>
      <div className="gear-layout">
       <div className="gear-slots">
        {(['head','chest','feet'] as Slot[]).map(s=>{const it=ITEMS.find(i=>i.id===equipped[s]);return <button key={s} className={`gear-slot ${openSlot===s?'is-open':''}`} onClick={()=>setOpenSlot(openSlot===s?null:s)}>{it?.icon?<img src={it.icon} alt={it.name}/>:<span className="slot-sil">{s==='head'?'◯':s==='chest'?'▣':'▽'}</span>}<em>{SLOT_LABEL[s]}</em></button>;})}
       </div>
       <div className="gear-figure"><img src={IDLE[status.weapon][2]} alt="Charakter"/><div className="gear-health"><i style={{width:`${status.health}%`}}/></div></div>
       <div className="gear-slots">
        {(['hand'] as Slot[]).map(s=>{const it=ITEMS.find(i=>i.id===equipped[s]);return <button key={s} className={`gear-slot ${openSlot===s?'is-open':''}`} onClick={()=>setOpenSlot(openSlot===s?null:s)}>{it?.icon?<img src={it.icon} alt={it.name}/>:<span className="slot-sil">●</span>}<em>{it?.name??SLOT_LABEL[s]}</em></button>;})}
       </div>
      </div>
      {openSlot?<div className="gear-items"><p className="gear-items-title">{SLOT_LABEL[openSlot]} wählen</p><div className="gear-grid">{ITEMS.filter(i=>i.slot===openSlot).map(i=><button key={i.id} className={`gear-item ${equipped[openSlot]===i.id?'is-equipped':''}`} onClick={()=>equip(i)}>{i.icon?<img src={i.icon} alt={i.name}/>:<span className="slot-sil">{i.id==='fists'?'●':'✦'}</span>}<em>{i.name}</em></button>)}</div></div>
       :<div className="gear-items"><p className="gear-items-title">Proviant · antippen zum Essen</p><div className="gear-grid">{([['berries','Beeren','✦',status.berries,15],['meat','Rohes Fleisch','🥩',status.meat,20],['cooked','Gebraten','🍖',status.cooked,45]] as const).map(([id,name,ic,n,hp])=><button key={id} className="gear-item" disabled={n<=0} onClick={()=>{input.current.eat=id;}}><span className="slot-sil">{ic}</span><em>{name} ×{n} · +{hp}</em></button>)}</div><p className="gear-items-title">Beutel</p><div className="gear-grid">{ITEMS.map(i=><button key={i.id} className={`gear-item ${equipped[i.slot]===i.id?'is-equipped':''}`} onClick={()=>equip(i)}>{i.icon?<img src={i.icon} alt={i.name}/>:<span className="slot-sil">{i.id==='fists'?'●':'✦'}</span>}<em>{i.name}</em></button>)}</div></div>}
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);setOpenSlot(null);}}><Play size={16}/> Weiter erkunden</Button>
     </>:panel==='map'?<>
      <h2>Die graue Wildnis</h2>
      <div className="large-map"><span className="map-river"/><span className="map-mountain"/><span className="large-map-cave">▲ Höhle</span><span className="large-map-fire">♨ Lager</span><i className="map-player" style={{left:`${status.x/2048*100}%`,top:`${status.y/2048*100}%`}}/><span className="north-marker">N</span></div><p className="coordinates">POSITION {status.x} / {status.y}</p>
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);}}><Play size={16}/> Weiter erkunden</Button>
     </>:panel==='settings'?<>
      <h2>Einstellungen</h2>
      <div className="setting-row"><span>Ton</span><Button variant="outline" disabled title="In dieser ersten Version noch ohne Ton"><VolumeX/> Aus</Button></div><div className="setting-row"><span>Darstellung</span><span>Pixel · 8 Richtungen</span></div><div className="setting-row"><span>Version</span><span>Alpha 0.1</span></div>
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);}}><Play size={16}/> Weiter erkunden</Button>
     </>:<>
      <h2>Eine kurze Rast.</h2>
      <p>Deine Wildnis wartet auf dich.</p>
      <Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);}}><Play size={16}/> Weiter erkunden</Button>
     </>}
    </div></div>}
   </section>
  </main>
 </div>;
}
