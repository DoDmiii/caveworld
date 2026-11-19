import { describe, it, expect } from 'vitest';
import { EMPTY_COUPLES, addLure, seductionRefusal, witnessReaction, discover, secretAffair, partnerOf, LURE_NEEDED, DRAGON_LURE_NEEDED, lureNeeded, lureGain, GIFT_LURE } from '@/game/partners';

describe('partners', () => {
  it('a partnered woman refuses until seduced to 40', () => {
    expect(seductionRefusal(EMPTY_COUPLES, 'nordic-w1', 'Eskir')).toContain('Eskir');
    const s = addLure(EMPTY_COUPLES, 'nordic-w1', LURE_NEEDED);
    expect(seductionRefusal(s, 'nordic-w1', 'Eskir')).toBeNull();
  });
  it('single women and widows need no seduction', () => {
    expect(seductionRefusal(EMPTY_COUPLES, 'nordic-w0', undefined)).toBeNull();
    expect(seductionRefusal(EMPTY_COUPLES, 'nordic-w1', 'Eskir', () => false)).toBeNull();
  });
  it('the partner rages and the couple breaks', () => {
    expect(witnessReaction(EMPTY_COUPLES, 'nordic-w1', 'nordic-m2')).toBe('rage');
    const r = discover(EMPTY_COUPLES, 'nordic-w1', ['rage']);
    expect(r.rage).toBe(true); expect(r.confront).toBe('nordic-m2');
    expect(partnerOf(r.state, 'nordic-w1')).toBeUndefined();
  });
  it('three gossiping witnesses make the partner confront', () => {
    const one = discover(EMPTY_COUPLES, 'nordic-w1', ['gossip']);
    expect(one.state.suspicion['nordic-m2']).toBe(35); expect(one.confront).toBeUndefined();
    const three = discover(one.state, 'nordic-w1', ['gossip', 'gossip']);
    expect(three.confront).toBe('nordic-m2');
  });
  it('a secret affair counts and adds 10 suspicion', () => {
    const r = secretAffair(EMPTY_COUPLES, 'nordic-w1');
    expect(r.state.affairs['nordic-w1']).toBe(1); expect(r.state.suspicion['nordic-m2']).toBe(10);
  });
});

import { getProfile } from '@/game/profiles';
describe('dragon profiles', () => {
  it('the three wolf hunters are Yozora, Yuki and Kasumi, all single', () => {
    expect(['dragon-w2', 'dragon-w3', 'dragon-w4'].map(id => getProfile(id)?.name)).toEqual(['Yozora', 'Yuki', 'Kasumi']);
    for (const id of ['dragon-w2', 'dragon-w3', 'dragon-w4']) expect(partnerOf(EMPTY_COUPLES, id)).toBeUndefined();
  });
  it('Taro-Ka is gone', () => expect(getProfile('dragon-m0')).toBeUndefined());
  it('dragon couples are Mei-Ra & Gorun and Suli & Bao', () => {
    expect(getProfile(partnerOf(EMPTY_COUPLES, 'dragon-w0')!)?.name).toBe('Gorun');
    expect(getProfile(partnerOf(EMPTY_COUPLES, 'dragon-w1')!)?.name).toBe('Bao');
  });
  it('Drachenfrauen sind schneller zu gewinnen (Lore): halbe Schwelle, doppelter Zuwachs', () => {
    expect(lureNeeded('dragon-w0')).toBe(DRAGON_LURE_NEEDED);
    expect(lureNeeded('nordic-w1')).toBe(LURE_NEEDED);
    expect(lureGain('dragon-w0', GIFT_LURE)).toBe(GIFT_LURE * 2);
    expect(lureGain('nordic-w1', GIFT_LURE)).toBe(GIFT_LURE);
    expect(seductionRefusal({ ...EMPTY_COUPLES, lure: { 'dragon-w0': DRAGON_LURE_NEEDED } }, 'dragon-w0', 'Gorun')).toBeNull();
    expect(seductionRefusal({ ...EMPTY_COUPLES, lure: { 'dragon-w0': DRAGON_LURE_NEEDED - 1 } }, 'dragon-w0', 'Gorun')).toContain('/20');
  });
});

