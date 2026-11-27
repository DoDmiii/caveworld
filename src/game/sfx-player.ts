// Browser-only Web Audio player for sound effects and ambience loops; import dynamically from GameView.
import sprite from '@/assets/sfx/sfx-sprite.mp3.asset.json';
import riverLoop from '@/assets/sfx/river-loop.mp3.asset.json';
import rainLoop from '@/assets/sfx/rain-loop.mp3.asset.json';
import { SFX_SPRITE, pickVariant, type SoundEvent, type SoundId } from './sfx';

type Loop = { url: string; buf?: AudioBuffer; loading?: boolean; gain?: GainNode; level: number };
export function createSfxPlayer() {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  const ctx = Ctx ? new Ctx() : null;
  const master = ctx?.createGain();
  if (ctx && master) master.connect(ctx.destination);
  let volume = 0.7, buf: AudioBuffer | undefined, ambienceOn = true;
  const last = {} as Partial<Record<SoundId, number>>;
  const load = async (url: string) => { if (!ctx) throw new Error('no audio'); const r = await fetch(url); return ctx.decodeAudioData(await r.arrayBuffer()); };
  load(sprite.url).then(b => { buf = b; }).catch(() => {});
  const loops: Record<'river' | 'rain', Loop> = { river: { url: riverLoop.url, level: 0 }, rain: { url: rainLoop.url, level: 0 } };
  let windGain: GainNode | undefined, waterGain: GainNode | undefined, forestWind = 0, forestWater = 0, forestOn = false;
  const startForest = () => {
    if (!ctx || !master || windGain) return;
    // Filtered noise and slow gusts: no extra recording/download required.
    const noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), data = noise.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) { brown = (brown + (Math.random() * 2 - 1) * 0.035) / 1.02; data[i] = brown * 3; }
    const source = ctx.createBufferSource(); source.buffer = noise; source.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 620;
    const gust = ctx.createGain(); gust.gain.value = 0.65;
    const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 0.13; depth.gain.value = 0.25; lfo.connect(depth); depth.connect(gust.gain);
    windGain = ctx.createGain(); windGain.gain.value = 0;
    source.connect(filter); filter.connect(gust); gust.connect(windGain); windGain.connect(master); source.start(); lfo.start();
    // Quiet bubbling beneath the existing river recording, with an irregular wet pulse.
    waterGain = ctx.createGain(); waterGain.gain.value = 0;
    const water = ctx.createOscillator(), bubble = ctx.createOscillator(), pitch = ctx.createGain();
    water.frequency.value = 155; bubble.frequency.value = 3.7; pitch.gain.value = 95;
    bubble.connect(pitch); pitch.connect(water.frequency);
    const pulse = ctx.createGain(); pulse.gain.value = 0.035;
    water.connect(pulse); pulse.connect(waterGain); waterGain.connect(master); water.start(); bubble.start();
  };
  const startLoop = (l: Loop) => {
    if (!ctx || !master || !l.buf || l.gain) return;
    const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
    const s = ctx.createBufferSource(); s.buffer = l.buf; s.loop = true;
    // Skip possible decoder padding so the pre-crossfaded loop wraps without a gap.
    s.loopStart = Math.min(0.03, l.buf.duration / 4); s.loopEnd = Math.max(s.loopStart + 0.1, l.buf.duration - 0.03);
    s.connect(g); s.start(0, s.loopStart); l.gain = g;
  };
  const applyLoops = () => {
    if (!ctx) return;
    for (const l of Object.values(loops)) {
      if (l.level > 0 && !l.buf && !l.loading) { l.loading = true; load(l.url).then(b => { l.buf = b; startLoop(l); applyLoops(); }).catch(() => { l.loading = false; }); }
      if (l.gain) l.gain.gain.setTargetAtTime(ambienceOn ? l.level * 0.55 : 0, ctx.currentTime, 0.6);
    }
  };
  return {
    unlock() { if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {}); },
    setVolume(v: number) { volume = Math.min(1, Math.max(0, v)); if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05); },
    play(e: SoundEvent) {
      if (!ctx || !master || !buf || ctx.state !== 'running' || volume <= 0 || e.gain <= 0) return;
      const clips = SFX_SPRITE[e.id]; const i = pickVariant(clips.length, last[e.id] ?? -1, Math.random()); last[e.id] = i;
      const [off, dur] = clips[i]!;
      const g = ctx.createGain(); g.gain.value = Math.min(1.5, e.gain); g.connect(master);
      const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = (e.rate ?? 1) * (0.95 + Math.random() * 0.1);
      s.connect(g); s.start(0, off, dur); s.onended = () => g.disconnect();
    },
    /** Ambience levels 0..1 for the river and rain loops (already scaled by the master volume). */
    setAmbience(river: number, rain: number, on = true) { loops.river.level = river; loops.rain.level = rain; ambienceOn = on; applyLoops(); },
    setForest(wind: number, water: number, on = true) {
      forestWind = wind; forestWater = water; forestOn = on;
      if (on && wind > 0) startForest();
      if (!ctx) return;
      windGain?.gain.setTargetAtTime(on ? wind * 0.23 : 0, ctx.currentTime, 1.2);
      waterGain?.gain.setTargetAtTime(on ? water : 0, ctx.currentTime, 0.7);
    },
    get state() { return { ready: !!buf, running: ctx?.state === 'running', volume, river: loops.river.level, rain: loops.rain.level, riverPlaying: !!loops.river.gain, rainPlaying: !!loops.rain.gain, forestWind, forestWater, forestOn, forestPlaying: !!windGain }; },
    destroy() { ctx?.close().catch(() => {}); },
  };
}
