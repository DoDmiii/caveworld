import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Flame, Footprints, Heart, Map, Maximize, Pause, Play, Settings2, Trees, X, Zap, Hand, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import south from '@/assets/south.png.asset.json';
import type { GameInput, GameStatus } from './world';

export default function GameView(){
 const host=useRef<HTMLDivElement>(null);
 const input=useRef<GameInput>({x:0,y:0,sprint:false,action:0,paused:false});
 const [status,setStatus]=useState<GameStatus>({x:1030,y:970,stamina:100,berries:0,area:'Das grüne Tal',message:''});
 const [ready,setReady]=useState(false);const [error,setError]=useState(false);
 const [paused,setPaused]=useState(false);const [panel,setPanel]=useState<'map'|'settings'|null>(null);
 const [knob,setKnob]=useState({x:0,y:0});const [sprinting,setSprinting]=useState(false);
 useEffect(()=>{let cancelled=false;let destroy:(()=>void)|undefined;import('./world').then(({createWorld})=>{if(cancelled||!host.current)return;const game=createWorld(host.current,input.current,s=>{setStatus(s);setReady(true);});destroy=()=>game.destroy(true);}).catch(()=>setError(true));return()=>{cancelled=true;destroy?.();};},[]);
 useEffect(()=>{input.current.paused=paused||panel!==null;input.current.x=0;input.current.y=0;setKnob({x:0,y:0});},[paused,panel]);
 const move=(e:React.PointerEvent<HTMLDivElement>)=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;const len=Math.hypot(x,y),scale=len>40?40/len:1;setKnob({x:x*scale,y:y*scale});input.current.x=x*scale/40;input.current.y=y*scale/40;};
 const release=()=>{input.current.x=0;input.current.y=0;setKnob({x:0,y:0});};
 return <div className="game-page">
  <main className="game-shell">
   <div className="game-topline"><div><span className="eyebrow">DEINE REISE BEGINNT</span><h1>Die Wildnis wartet.</h1></div><span className="world-tag"><Trees size={14}/> Steinzeit · Freies Erkunden</span></div>
   <section className="game-frame" aria-label="Steinzeit-Spielwelt">
    <div className="world-canvas" ref={host}/>
    {!ready&&<div className="game-loading"><Flame/>{error?'Die Wildnis konnte nicht geladen werden.':'Die Wildnis erwacht …'}</div>}
    <div className="top-shade"/>
    <div className="hud"><div className="portrait"><img src={south.url} alt="Dein Höhlenmensch"/></div><div className="vitals"><div className="vitals-label"><span>HÖHLENMENSCH</span><span>LV. 1</span></div><div className="stat-row"><Heart className="health-icon"/><div className="stat-track health"><i/></div><span>100</span></div><div className="stat-row"><Zap className="energy-icon"/><div className="stat-track energy"><i style={{width:`${status.stamina}%`}}/></div><span>{status.stamina}</span></div></div><Button variant="ghost" size="icon" className="glass-icon pause-button" title={paused?'Fortsetzen':'Pause'} aria-label={paused?'Fortsetzen':'Pause'} onClick={()=>setPaused(!paused)}>{paused?<Play/>:<Pause/>}</Button></div>
    <div className="location-label"><span className="live-dot"/>{status.area}<ChevronDown size={12}/></div>
    <Button variant="ghost" className="mini-map" aria-label="Karte öffnen" title="Karte öffnen" onClick={()=>setPanel('map')}><div className="map-terrain"><span className="map-river"/><span className="map-path"/><i className="map-player" style={{left:`${status.x/2048*100}%`,top:`${status.y/2048*100}%`}}/><span className="north-marker">N</span></div><span className="map-caption"><Map size={10}/> KARTE</span></Button>
    <div className="camp-marker"><Flame size={12}/> LAGERFEUER <span>·</span> {Math.round(Math.hypot(status.x-1000,status.y-1058))} m</div>
    {status.message&&<div className="game-toast" role="status"><Hand size={16}/>{status.message}</div>}
    <div className="touch-controls"><div className="joystick-area"><div className="joystick" role="group" aria-label="Bewegungsjoystick" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e);}} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><span className="joystick-arrow up">⌃</span><span className="joystick-arrow down">⌄</span><span className="joystick-arrow left">‹</span><span className="joystick-arrow right">›</span><span className="joystick-knob" style={{transform:`translate(${knob.x}px,${knob.y}px)`}}><span/></span></div><span className="control-caption">BEWEGEN</span></div><div className="action-area"><Button variant="ghost" className={`run-button ${sprinting?'is-active':''}`} aria-label="Sprinten" title="Sprinten" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);input.current.sprint=true;setSprinting(true);}} onPointerUp={()=>{input.current.sprint=false;setSprinting(false);}} onPointerCancel={()=>{input.current.sprint=false;setSprinting(false);}} onLostPointerCapture={()=>{input.current.sprint=false;setSprinting(false);}}><Footprints/></Button><div className="gather-wrap"><Button variant="ghost" className="gather-button" aria-label="Sammeln" title="Sammeln oder am Feuer ausruhen" onClick={()=>input.current.action++}><Hand/></Button><span className="control-caption">AKTION</span></div></div></div>
    <div className="game-bottom"><span><span className="berry-icon">✦</span> {status.berries} <span className="resource-label">BEEREN</span></span><span><span className="sun-icon">☀</span> TAG 1 <span className="bottom-dot">·</span> 08:24</span><Button variant="ghost" size="icon" aria-label="Vollbild" title="Vollbild" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void document.querySelector('.game-frame')?.requestFullscreen?.();}}><Maximize/></Button></div>
    {(paused||panel)&&<div className="pause-overlay"><div className="pause-panel"><div className="panel-heading"><span className="eyebrow">URZEIT</span><Button variant="ghost" size="icon" aria-label="Schließen" onClick={()=>{setPanel(null);setPaused(false);}}><X/></Button></div><h2>{panel==='map'?'Das grüne Tal':panel==='settings'?'Einstellungen':'Eine kurze Rast.'}</h2>{panel==='map'?<><div className="large-map"><span className="map-river"/><span className="map-path"/><span className="large-map-cave">▲ Höhle</span><span className="large-map-fire">♨ Lager</span><i className="map-player" style={{left:`${status.x/2048*100}%`,top:`${status.y/2048*100}%`}}/><span className="north-marker">N</span></div><p className="coordinates">POSITION {status.x} / {status.y}</p></>:panel==='settings'?<><div className="setting-row"><span>Ton</span><Button variant="outline" disabled title="In dieser ersten Version noch ohne Ton"><VolumeX/> Aus</Button></div><div className="setting-row"><span>Darstellung</span><span>Pixel · 8 Richtungen</span></div><div className="setting-row"><span>Version</span><span>Alpha 0.1</span></div></>:<p>Deine Wildnis wartet auf dich.</p>}<Button className="resume-button" onClick={()=>{setPanel(null);setPaused(false);}}><Play size={16}/> Weiter erkunden</Button></div></div>}
   </section>
  </main>
 </div>;
}
