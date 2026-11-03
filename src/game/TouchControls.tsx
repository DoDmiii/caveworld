import { useEffect, useRef, useState } from 'react';
import { Footprints, Hand, MoveDown, Sword, Target, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GameInput } from './world';

export function TouchControls({ input, crouching, spear, inCave }: { input: GameInput; crouching: boolean; spear: boolean; inCave: boolean }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [sprint, setSprint] = useState(false);
  const pointer = useRef<number | null>(null);
  const release = () => { pointer.current = null; input.x = 0; input.y = 0; setKnob({ x: 0, y: 0 }); };
  useEffect(() => {
    const reset = () => { release(); input.sprint = false; input.crouch = false; setSprint(false); };
    const visibility = () => { if (document.hidden) reset(); };
    window.addEventListener('blur', reset); window.addEventListener('resize', reset);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('blur', reset); window.removeEventListener('resize', reset); document.removeEventListener('visibilitychange', visibility); input.x = 0; input.y = 0; input.sprint = false; input.crouch = false; };
  }, [input]);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const radius = r.width * 0.32, length = Math.hypot(x, y), scale = length > radius ? radius / length : 1;
    setKnob({ x: x * scale, y: y * scale });
    input.x = length < 7 ? 0 : x * scale / radius; input.y = length < 7 ? 0 : y * scale / radius;
  };
  const sprintOff = () => { input.sprint = false; setSprint(false); };
  return <div className="touch-controls">
    <div className="joystick-area">
      <div className="joystick" role="group" aria-label="Bewegungsjoystick" onPointerDown={e => { if (pointer.current !== null) return; pointer.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); move(e); }} onPointerMove={e => { if (pointer.current === e.pointerId) move(e); }} onPointerUp={e => { if (pointer.current === e.pointerId) release(); }} onPointerCancel={e => { if (pointer.current === e.pointerId) release(); }} onLostPointerCapture={e => { if (pointer.current === e.pointerId) release(); }}>
        <span className="joystick-arrow up">⌃</span><span className="joystick-arrow down">⌄</span><span className="joystick-arrow left">‹</span><span className="joystick-arrow right">›</span><span className="joystick-knob" style={{ transform: `translate(${knob.x}px,${knob.y}px)` }}><span /></span>
      </div>
    </div>
    <div className="action-area">
      <div className="movement-modes">
        <Button variant="ghost" className={`touch-mode ${sprint ? 'is-active' : ''}`} aria-label="Sprinten" aria-pressed={sprint} title="Sprinten · gedrückt halten"
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); input.sprint = true; input.crouch = false; setSprint(true); }}
          onPointerUp={sprintOff} onPointerCancel={sprintOff} onLostPointerCapture={sprintOff}><Footprints /></Button>
        <Button variant="ghost" className={`touch-mode ${crouching ? 'is-active' : ''}`} aria-label="Ducken" aria-pressed={crouching} title="Ducken ein/aus" onClick={() => { input.crouch = !crouching; sprintOff(); }}><MoveDown /></Button>
      </div>
      <Button variant="ghost" className="touch-mode" aria-label="Ziel anvisieren" title="Nächstes Tier anvisieren · Bola" disabled={inCave} onClick={() => { input.focus = true; }}><Target /></Button>
      <Button variant="ghost" className="touch-mode" aria-label="Speer werfen" title="Speer auf anvisiertes Tier werfen" disabled={!spear || inCave} onClick={() => { input.throwSpear = true; }}><Send /></Button>
      <Button variant="ghost" className="attack-button" aria-label="Angreifen" title="Angreifen / Finisher" onClick={() => { input.attack++; }}><Sword /></Button>
      <Button variant="ghost" className="gather-button" aria-label="Interagieren" title="Sammeln, schlafen, aufnehmen oder absetzen" onClick={() => { input.action++; }}><Hand /></Button>
    </div>
  </div>;
}
