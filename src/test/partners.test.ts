import { describe, it, expect } from 'vitest';
import { EMPTY_COUPLES, addLure, seductionRefusal, witnessReaction, discover, secretAffair, partnerOf, LURE_NEEDED } from '@/game/partners';

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
