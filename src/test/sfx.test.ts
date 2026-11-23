import { describe, it, expect } from 'vitest';
import { surfaceAt, stepAdvance, STEP_PX, hitSound, finisherSound, distanceGain, riverLevel, rainLevel, pickVariant, parseSfxVolume, SFX_SPRITE, STEP_SOUND } from '@/game/sfx';
import { riverX, CAMP_POS, FORDS } from '@/game/biomes';
import { WATERHOLES } from '@/game/desert';

describe('footstep surfaces', () => {
  it('huts and caves sound like a house floor', () => {
    expect(surfaceAt(0, 0, 'hut')).toBe('house');
    expect(surfaceAt(0, 0, 'cave')).toBe('house');
  });
  it('wading the ford splashes', () => { const y = FORDS[1]; expect(surfaceAt(riverX(y), y, undefined)).toBe('water'); });
  it('a desert waterhole splashes', () => { const w = WATERHOLES[0]; expect(surfaceAt(w.x, w.y, undefined)).toBe('water'); });
  it('the camp meadow is grass', () => expect(surfaceAt(CAMP_POS.x, CAMP_POS.y + 60, undefined)).toBe('grass'));
  it('Frostheim is snow', () => expect(surfaceAt(250, -350, undefined)).toBe('snow'));
  it('sand reuses the grass steps deeper and softer', () => {
    expect(STEP_SOUND.sand.id).toBe('step_grass');
    expect(STEP_SOUND.sand.rate).toBeLessThan(1);
  });
});

describe('step cadence', () => {
  it('steps once every STEP_PX walked', () => {
    let acc = 0, steps = 0;
    for (let i = 0; i < 26; i++) { const r = stepAdvance(acc, 1); acc = r.acc; if (r.step) steps++; }
    expect(STEP_PX).toBe(26); expect(steps).toBe(1);
  });
  it('teleports through doors make no step', () => expect(stepAdvance(20, 300)).toEqual({ acc: 0, step: false }));
});

describe('combat sounds', () => {
  it('fists punch, weapons and the club hit flesh', () => {
    expect(hitSound('none', false)).toBe('punch');
    expect(hitSound('none', true)).toBe('hit');
    expect(hitSound('axe', false)).toBe('hit');
    expect(hitSound('wedge', false)).toBe('hit');
  });
  it('axe finisher beheads, others splatter', () => {
    expect(finisherSound(true)).toBe('behead');
    expect(finisherSound(false)).toBe('splat');
  });
  it('two punch and two weapon variants', () => { expect(SFX_SPRITE.punch).toHaveLength(2); expect(SFX_SPRITE.hit).toHaveLength(2); });
  it('variants never repeat back to back', () => { for (let r = 0; r < 1; r += 0.05) expect(pickVariant(2, 0, r)).toBe(1); });
});

describe('ambience', () => {
  it('river is loud at the bank and gone far away and indoors', () => {
    const y = 400;
    expect(riverLevel(riverX(y) + 60, y, undefined)).toBe(1);
    expect(riverLevel(riverX(y) + 600, y, undefined)).toBe(0);
    expect(riverLevel(riverX(y) + 60, y, 'hut')).toBe(0);
  });
  it('rain only plays in rain or thunder outdoors', () => {
    expect(rainLevel('rain', undefined)).toBeGreaterThan(0);
    expect(rainLevel('thunder', undefined)).toBe(1);
    expect(rainLevel('clear', undefined)).toBe(0);
    expect(rainLevel('snow', undefined)).toBe(0);
    expect(rainLevel('rain', 'cave')).toBe(0);
  });
  it('distant sounds fade out', () => { expect(distanceGain(50)).toBe(1); expect(distanceGain(500)).toBe(0); });
  it('sound volume defaults to 70 % and clamps', () => {
    expect(parseSfxVolume(null)).toBe(0.7);
    expect(parseSfxVolume('2')).toBe(1);
  });
});
