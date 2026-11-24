import { useState } from 'react';
import { Button } from '@/components/ui/button';
import bg from '@/assets/menu/menu-campfire.gif.asset.json';
import logo from '@/assets/menu/caveworld-logo.png.asset.json';

type Props = {
  ready: boolean; hasSave: boolean;
  volume: number; sfxVolume: number;
  onVolume: (v: number) => void; onSfxVolume: (v: number) => void;
  onContinue: () => void; onNewGame: () => void; onNotebook: () => void;
};

/** Title screen shown before the world; the game loads paused behind it. */
export function MainMenu(p: Props) {
  const [view, setView] = useState<'main' | 'options' | 'bye'>('main');
  const fullscreen = () => { const d = document; if (d.fullscreenElement) void d.exitFullscreen?.(); else void d.documentElement.requestFullscreen?.().catch(() => {}); };
  return <div className="main-menu" style={{ backgroundImage: `url(${bg.url})` }} role="dialog" aria-label="Hauptmenü">
    <div className="main-menu-veil" />
    <img className="main-menu-logo" src={logo.url} alt="Caveworld" />
    <Button variant="outline" className="main-menu-notebook" disabled={!p.ready} onClick={p.onNotebook}>Notizbuch</Button>
    <div className="main-menu-buttons">
      {view === 'main' && <>
        {p.hasSave && <Button className="main-menu-btn" disabled={!p.ready} onClick={p.onContinue}>{p.ready ? 'Fortsetzen' : 'Lädt …'}</Button>}
        <Button className="main-menu-btn" variant={p.hasSave ? 'outline' : 'default'} disabled={!p.ready && !p.hasSave} onClick={p.onNewGame}>Neues Spiel</Button>
        <Button className="main-menu-btn" variant="outline" onClick={() => setView('options')}>Optionen</Button>
        <Button className="main-menu-btn" variant="ghost" onClick={() => { setView('bye'); try { window.close(); } catch { /* ignore */ } }}>Verlassen</Button>
      </>}
      {view === 'options' && <div className="main-menu-options">
        <label>Musik <span>{Math.round(p.volume * 100)} %</span><input type="range" min={0} max={100} value={Math.round(p.volume * 100)} onChange={e => p.onVolume(Number(e.target.value) / 100)} aria-label="Musik-Lautstärke" /></label>
        <label>Geräusche <span>{Math.round(p.sfxVolume * 100)} %</span><input type="range" min={0} max={100} value={Math.round(p.sfxVolume * 100)} onChange={e => p.onSfxVolume(Number(e.target.value) / 100)} aria-label="Geräusch-Lautstärke" /></label>
        <Button variant="outline" onClick={fullscreen}>Vollbild ein/aus</Button>
        <Button onClick={() => setView('main')}>Zurück</Button>
      </div>}
      {view === 'bye' && <div className="main-menu-options"><p>Deine Reise endet hier vorerst. Bis zum nächsten Mal!</p><Button onClick={() => setView('main')}>Zurück</Button></div>}
    </div>
  </div>;
}
