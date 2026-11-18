// Browser-only crossfading music player; call only from effects/handlers.
import valley from '@/assets/music/Roots_of_the_Canopy.mp3.asset.json';
import snow from '@/assets/music/Stone_and_Breath.mp3.asset.json';
import battle from '@/assets/music/Stone_Bone_and_Blood.mp3.asset.json';
import { type Track, FADE_IN_MS, BATTLE_FADE_MS } from './music';
const SRC: Record<Track, string> = { valley: valley.url, snow: snow.url, battle: battle.url };
export function createMusicPlayer() {
  const els = {} as Record<Track, HTMLAudioElement>;
  let current: Track | null = null, volume = 0.5, muted = false, dim = 1, raf = 0, unlocked = false;
  const el = (t: Track) => els[t] ??= Object.assign(new Audio(SRC[t]), { loop: true, preload: 'auto', volume: 0 });
  const target = (t: Track) => (muted || t !== current ? 0 : volume * dim);
  let last = performance.now();
  const step = (now: number) => {
    const dt = now - last; last = now;
    for (const t of Object.keys(els) as Track[]) {
      const a = els[t], goal = target(t), ms = t === 'battle' || current === 'battle' ? BATTLE_FADE_MS : FADE_IN_MS;
      const d = (dt / ms) * Math.max(volume, 0.05);
      a.volume = goal > a.volume ? Math.min(goal, a.volume + d) : Math.max(goal, a.volume - d);
      if (a.volume === 0 && goal === 0 && !a.paused) a.pause();
    }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  const playCur = () => { if (current && unlocked && !muted) { const a = el(current); if (a.paused) { a.play().catch(() => {}); } } };
  return {
    get state() { return { current, unlocked, muted, playing: (Object.keys(els) as Track[]).filter(t => !els[t].paused) }; },
    unlock() { if (!unlocked) { unlocked = true; playCur(); } },
    set(t: Track | null) { if (t === current) return; if (t === 'battle' && els.battle) els.battle.currentTime = 0; current = t; playCur(); },
    setDim(v: number) { dim = v; },
    setMuted(m: boolean) { muted = m; playCur(); },
    destroy() { cancelAnimationFrame(raf); for (const a of Object.values(els)) { a.pause(); a.src = ''; } },
  };
}
