// Browser-only crossfading music player; call only from effects/handlers.
import valley from '@/assets/music/Roots_of_the_Canopy.mp3.asset.json';
import valleyNight from '@/assets/music/Moonlit_Canopy.mp3.asset.json';
import river from '@/assets/music/Clay_and_Current.mp3.asset.json';
import snow from '@/assets/music/Stone_and_Breath.mp3.asset.json';
import dragon from '@/assets/music/Bamboo_Above_the_Mist.mp3.asset.json';
import desert from '@/assets/music/Caravan_at_the_Gate.mp3.asset.json';
import jungle from '@/assets/music/Pulse_Beneath_the_Leaves.mp3.asset.json';
import battle from '@/assets/music/Stone_Bone_and_Blood.mp3.asset.json';
import death from '@/assets/music/The_Last_Hearth.mp3.asset.json';
import pause from '@/assets/music/Shadows_on_Stone.mp3.asset.json';
import riverNight from '@/assets/music/Beneath_the_Nocturnal_Bough.mp3.asset.json';
import snowNight from '@/assets/music/Beneath_the_Midnight_Ice.mp3.asset.json';
import dragonNight from '@/assets/music/Cold_Moon_Over_Crags.mp3.asset.json';
import desertNight from '@/assets/music/Where_the_Stones_Cool.mp3.asset.json';
import jungleNight from '@/assets/music/Where_the_Ferns_Breathe.mp3.asset.json';
import cave from '@/assets/music/The_Limestone_Throat.mp3.asset.json';
import hut from '@/assets/music/Hearth_in_the_Hollow.mp3.asset.json';
import { type Track, FADE_IN_MS, BATTLE_FADE_MS, RESTART_TRACKS } from './music';
const SRC: Record<Track, string> = { valley: valley.url, valleyNight: valleyNight.url, river: river.url, snow: snow.url, dragon: dragon.url, desert: desert.url, jungle: jungle.url, battle: battle.url, death: death.url, pause: pause.url, riverNight: riverNight.url, snowNight: snowNight.url, dragonNight: dragonNight.url, desertNight: desertNight.url, jungleNight: jungleNight.url, cave: cave.url, hut: hut.url };
export function createMusicPlayer() {
  const els = {} as Partial<Record<Track, HTMLAudioElement>>;
  let current: Track | null = null, volume = 0.5, muted = false, dim = 1, raf = 0, unlocked = false;
  const el = (t: Track) => els[t] ??= Object.assign(new Audio(SRC[t]), { loop: true, preload: 'auto', volume: 0 });
  const target = (t: Track) => (muted || t !== current ? 0 : volume * dim);
  const live = () => Object.keys(els) as Track[];
  let last = performance.now(), switched = 0;
  const step = (now: number) => {
    const dt = now - last; last = now;
    for (const t of live()) {
      const a = els[t]!, goal = target(t), ms = t === 'battle' || current === 'battle' ? BATTLE_FADE_MS : FADE_IN_MS;
      const d = (dt / ms) * Math.max(volume, 0.05);
      a.volume = goal > a.volume ? Math.min(goal, a.volume + d) : Math.max(goal, a.volume - d);
      if (goal === 0 && !a.paused && (a.volume === 0 || now - switched > ms + 300)) { a.volume = 0; a.pause(); }
    }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  const playCur = () => { if (current && unlocked && !muted) { const a = el(current); if (a.paused) { a.play().catch(() => {}); } } };
  return {
    get state() { return { current, unlocked, muted, playing: live().filter(t => !els[t]!.paused) }; },
    unlock() { if (!unlocked) { unlocked = true; playCur(); } },
    set(t: Track | null) { if (t === current) return; if (t && RESTART_TRACKS.includes(t) && els[t]) els[t].currentTime = 0; current = t; switched = performance.now(); playCur(); },
    setDim(v: number) { dim = v; },
    setVolume(v: number) { volume = Math.min(1, Math.max(0, v)); },
    setMuted(m: boolean) { muted = m; playCur(); },
    destroy() { cancelAnimationFrame(raf); for (const a of Object.values(els)) { a.pause(); a.src = ''; } },
  };
}
