import { describe, expect, it } from 'vitest';
import { getProfile, profileState, trustLabel, PROFILES } from '@/game/profiles';

describe('NPC profile rules', () => {
  it.each([
    ['orka', { hunt: 2, tough: 4, gather: 1, watch: 2, fire: 3 }],
    ['tamo', { hunt: 4, tough: 2, gather: 2, watch: 3, fire: 1 }],
    ['bruk', { hunt: 2, tough: 5, gather: 1, watch: 3, fire: 1 }],
    ['ura', { hunt: 1, tough: 1, gather: 3, watch: 2, fire: 4 }],
    ['nuka', { hunt: 1, tough: 2, gather: 5, watch: 2, fire: 2 }],
    ['kuruk', { hunt: 1, tough: 1, gather: 3, watch: 3, fire: 5 }],
    ['ilvar', { hunt: 3, tough: 3, gather: 1, watch: 5, fire: 1 }],
    ['ymra', { hunt: 2, tough: 2, gather: 4, watch: 2, fire: 2 }],
    ['torvik', { hunt: 1, tough: 1, gather: 3, watch: 4, fire: 4 }],
    ['skorra', { hunt: 5, tough: 3, gather: 1, watch: 3, fire: 1 }],
  ])('%s retains the five skill levels from the supplied document', (id, skills) => {
    expect(PROFILES.find(p => p.id === id)?.skills).toEqual(skills);
  });
  it.each([[0,'Feindlich'],[20,'Feindlich'],[21,'Misstrauisch'],[50,'Misstrauisch'],[51,'Geduldet'],[75,'Geduldet'],[76,'Treu'],[100,'Treu']])('trust %s is %s', (value, label) => {
    expect(trustLabel(Number(value))).toBe(label);
  });
  it('maps separate Nordic people to distinct identities while preserving home villages', () => {
    expect(getProfile('nordic-m0')).toMatchObject({ id: 'ilvar', origin: 'Frostheim' });
    expect(getProfile('nordic-m2-f')).toMatchObject({ id: 'torvik', origin: 'Frostheim' });
    expect(getProfile('nordic-w3')).toMatchObject({ id: 'ymra', origin: 'Eisfurt' });
    expect(getProfile('nordic-w3-g')).toMatchObject({ id: 'skorra', origin: 'Gipfelwacht' });
  });
  it('preserves saved skill and trust overrides without mutating biography defaults', () => {
    const p = getProfile('ally-0'); if (!p) throw new Error('Missing profile');
    const saved = { trust: 64, skills: { hunt: 5, tough: 2, gather: 2, watch: 3, fire: 1 } };
    expect(profileState(p, saved)).toEqual(saved);
    const copy = profileState(p); copy.skills.hunt = 1;
    expect(p.skills.hunt).toBe(4);
  });
});