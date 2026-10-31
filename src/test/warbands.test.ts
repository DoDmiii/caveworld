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
