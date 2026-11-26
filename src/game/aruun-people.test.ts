import { describe, expect, it } from 'vitest';
import { ARUUN_PEOPLE, ARUUN_RESIDENT_HUTS } from './aruun-people';
import { ARUUN_FOLK } from './aruun-folk';
import { ARUUN_HOUSES } from './aruun-villages';
import { getProfile, profileState } from './profiles';
import { assignResidents, wantsIndoors } from './hut-residents';
import { COUPLES } from './partners';
import { ADULT_WOMEN } from './bonding';
import { furnishHut, hutOptions } from './interiors';

describe('Aruun village inhabitants', () => {
  it.each([
    [5, ['Torrun', 'Ilaanu', 'Keluun', 'Ollan', 'Amuuri']],
    [6, ['Daruun', 'Maelu', 'Lorrec', 'Tamaan', 'Teluu']],
    [7, ['Haluun', 'Neeru', 'Sevaan', 'Idrun', 'Ruvaa']],
  ])('places five named residents in village %s', (village, names) => {
    expect(ARUUN_PEOPLE.filter(p => p.village === village).map(p => getProfile(p.id)?.name)).toEqual(names);
  });
  it('reuses nine looks for fifteen independent identities', () => {
    expect(ARUUN_FOLK).toHaveLength(15);
    expect(new Set(ARUUN_FOLK.map(p => p.tex)).size).toBe(9);
    expect(new Set(ARUUN_FOLK.map(p => p.id)).size).toBe(15);
    const torrun = getProfile('aruun-m0'), haluun = getProfile('aruun-m0-k');
    if (!torrun || !haluun) throw new Error('Missing shared-look people');
    const a = profileState(torrun), b = profileState(haluun);
    a.trust = 77;
    expect(b.trust).toBe(0);
    expect(torrun.name).toBe('Torrun');
    expect(haluun.name).toBe('Haluun');
  });
  it('assigns the two couples to huts 1 and 3 and the guard to hut 2', () => {
    const people = ARUUN_PEOPLE.map(p => ({ id: p.id, home: p.village, hut: ARUUN_RESIDENT_HUTS[p.id] ?? '' }));
    const assigned = assignResidents(ARUUN_HOUSES.map(h => ({ ...h, owner: 'aruun' as const })), people);
    expect(assigned).toEqual(ARUUN_RESIDENT_HUTS);
    expect(assigned['aruun-m0']).toBe('Rabenhain:1');
    expect(assigned['aruun-w0']).toBe('Rabenhain:1');
    expect(assigned['aruun-m1']).toBe('Rabenhain:2');
    expect(assigned['aruun-m2']).toBe('Rabenhain:3');
    expect(assigned['aruun-w1']).toBe('Rabenhain:3');
  });
  it.each([
    ['aruun-w0', 'aruun-m0'], ['aruun-w1', 'aruun-m2'],
    ['aruun-w0-n', 'aruun-m0-n'], ['aruun-w1-n', 'aruun-m2-n'],
    ['aruun-w0-k', 'aruun-m0-k'], ['aruun-w1-k', 'aruun-m2-k'],
  ])('keeps the approved couple %s and %s', (woman, man) => {
    expect(COUPLES[woman]).toBe(man);
    expect(ADULT_WOMEN.has(woman)).toBe(true);
  });
  it('uses four axe and two spear looks for men and keeps women unarmed', () => {
    expect(new Set(ARUUN_FOLK.filter(p => 'warrior' in p).map(p => p.tex))).toEqual(new Set(['aruun-m0','aruun-m1','aruun-m2','aruun-m3','aruun-m4','aruun-m5']));
    expect(ARUUN_FOLK.filter(p => 'death' in p)).toHaveLength(6);
  });
  it('provides two real beds for every occupied hut and night rest for warriors too', () => {
    for (const hut of new Set(Object.values(ARUUN_RESIDENT_HUTS))) {
      const items = furnishHut(hut, 'wenja', hutOptions(hut, 'aruun', false));
      expect(items.filter(i => i.kind === 'bed')).toHaveLength(2);
    }
    expect(wantsIndoors({ night: true, weather: 'clear', alarm: false, warrior: true, burning: false })).toBe(true);
  });
});