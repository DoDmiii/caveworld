import { describe, it, expect } from 'vitest';
import { EMPTY_WARBANDS, scheduleRaid, launchDue, arrive, advanceRaid, fordPost, RAID_DELAY_MINUTES, ASSAULT_MINUTES, RAID_COOLDOWN_MINUTES } from '@/game/warbands';
import { VILLAGES, FORDS } from '@/game/biomes';

describe('warbands', () => {
  it('hostile village schedules a raid half a day later', () => {
    const s = scheduleRaid(EMPTY_WARBANDS, 0, true, 100, false);
    expect(s.pending['0']).toBe(100 + RAID_DELAY_MINUTES);
    expect(launchDue(s, 100 + RAID_DELAY_MINUTES - 1).active).toBeUndefined();
    expect(launchDue(s, 100 + RAID_DELAY_MINUTES).active?.phase).toBe('march');
  });
  it('liberated or calm villages never raid', () => {
    expect(scheduleRaid(EMPTY_WARBANDS, 0, true, 0, true).pending).toEqual({});
    expect(scheduleRaid(EMPTY_WARBANDS, 0, false, 0, false).pending).toEqual({});
  });
  it('assault ends in retreat, then cooldown blocks new raids', () => {
    let s = launchDue(scheduleRaid(EMPTY_WARBANDS, 1, true, 0, false), RAID_DELAY_MINUTES);
    s = arrive(s, 1000); expect(s.active?.phase).toBe('assault');
    s = advanceRaid(s, 1000 + ASSAULT_MINUTES, 2); expect(s.active?.phase).toBe('return');
    s = advanceRaid(s, 1000, 0); expect(s.active).toBeUndefined();
    expect(scheduleRaid(s, 1, true, 1000 + RAID_COOLDOWN_MINUTES - 1, false).pending).toEqual({});
    expect(scheduleRaid(s, 1, true, 1000 + RAID_COOLDOWN_MINUTES, false).pending['1']).toBeDefined();
  });
  it('ford posts sit on a ford', () => {
    for (const v of VILLAGES) expect(FORDS).toContain(fordPost(v).y);
  });
});

import { addRevenge, squadSize, burnTarget, raidGoalsDone, raidSpoils, torchCount, retreat, REVENGE_THRESHOLD, REVENGE_DELAY_MIN, REVENGE_DELAY_SPAN, MIN_SQUAD, MAX_RAIDERS } from '@/game/warbands';
import { campAlarmActive } from '@/game/signals';

describe('revenge squads', () => {
  it('a seen killing and a finisher make a village swear revenge 1–2 days later', () => {
    let r = addRevenge(EMPTY_WARBANDS, 2, 'kill', 0, false, () => 0.5);
    expect(r.sworn).toBe(false); expect(r.state.pending).toEqual({});
    r = addRevenge(r.state, 2, 'execution', 100, false, () => 0.5);
    expect(r.sworn).toBe(true);
    expect(r.state.pending['2']).toBe(100 + REVENGE_DELAY_MIN + REVENGE_DELAY_SPAN / 2);
    expect(r.state.pending['2']).toBeGreaterThanOrEqual(100 + 1440);
    expect(r.state.pending['2']).toBeLessThanOrEqual(100 + 2880);
    expect(r.state.fury?.['2']).toBe(0);
  });
  it('squads have three to five warriors', () => {
    expect(squadSize(REVENGE_THRESHOLD)).toBe(3);
    expect(squadSize(30)).toBe(5);
    expect(MIN_SQUAD).toBe(3); expect(MAX_RAIDERS).toBe(5);
    const s = launchDue(addRevenge(EMPTY_WARBANDS, 1, 'champion', 0, false, () => 0).state, REVENGE_DELAY_MIN);
    expect(addRevenge(EMPTY_WARBANDS, 1, 'arson', 0, false, () => 0).sworn).toBe(false);
    expect(s.active?.village).toBe(1); expect(s.active?.size).toBe(3);
  });
  it('mere attacks, liberated villages and running raids never swear a new squad', () => {
    expect(addRevenge(EMPTY_WARBANDS, 0, 'attack', 0, false, Math.random).state).toBe(EMPTY_WARBANDS);
    expect(addRevenge(EMPTY_WARBANDS, 0, 'champion', 0, true, Math.random).state).toBe(EMPTY_WARBANDS);
    const running = { ...EMPTY_WARBANDS, active: { village: 0, phase: 'march' as const, until: 999 } };
    const r = addRevenge(running, 0, 'execution', 0, false, Math.random); const r2 = addRevenge(r.state, 0, 'execution', 0, false, Math.random);
    expect(r2.sworn).toBe(false); expect(r2.state.pending).toEqual({}); expect(r2.state.fury?.['0']).toBe(8);
  });
});

describe('camp arson by raiders', () => {
  const huts = [{ id: 'camp:0', x: 0, y: 0 }, { id: 'camp:1', x: 100, y: 0 }, { id: 'camp:2', x: 300, y: 0 }];
  it('two torches from four warriors, one from three', () => {
    expect(torchCount(3)).toBe(1); expect(torchCount(4)).toBe(2); expect(torchCount(5)).toBe(2);
  });
  it('torchbearers pick the nearest intact hut nobody else is burning', () => {
    expect(burnTarget(huts, {}, { x: 90, y: 0 }, new Set())?.id).toBe('camp:1');
    expect(burnTarget(huts, {}, { x: 90, y: 0 }, new Set(['camp:1']))?.id).toBe('camp:0');
    expect(burnTarget(huts, { 'camp:1': { litAt: 0, owner: 'camp' } }, { x: 90, y: 0 }, new Set())?.id).toBe('camp:0');
    const all = Object.fromEntries(huts.map(h => [h.id, { litAt: 0, owner: 'camp' as const }]));
    expect(burnTarget(huts, all, { x: 0, y: 0 }, new Set())).toBeUndefined();
  });
  it('the squad leaves once its torches burned their share and no kin is left', () => {
    const a = { village: 0, phase: 'assault' as const, until: 500, size: 4, burned: 1 };
    expect(raidGoalsDone(a, false, huts, {})).toBe(false);
    expect(raidGoalsDone({ ...a, burned: 2 }, false, huts, {})).toBe(true);
    expect(raidGoalsDone({ ...a, burned: 2 }, true, huts, {})).toBe(false);
    expect(retreat({ ...EMPTY_WARBANDS, active: a }, 100).active?.phase).toBe('return');
  });
  it('a beaten squad leaves its goods', () => {
    expect(raidSpoils(3)).toEqual({ flint: 3, fiber: 6, cooked: 3, xp: 90 });
  });
  it('a raid at the camp raises the alarm even without a drum', () => {
    expect(campAlarmActive(0, false, 0, true)).toBe(true);
    expect(campAlarmActive(0, true, 3, false)).toBe(false);
    expect(campAlarmActive(1, false, 1, false)).toBe(true);
  });
});
