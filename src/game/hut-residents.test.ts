import { describe, it, expect } from 'vitest';
import { assignResidents, wantsIndoors } from './hut-residents';
const huts = [{ id: 'camp:0', owner: 'camp' as const, x: 0, y: 0 }, { id: 'camp:1', owner: 'camp' as const, x: 0, y: 0 }, { id: 'n1', owner: 'nordic' as const, village: 0, x: 0, y: 0 }];
describe('hut residents', () => {
  it('assigns camp people only to camp huts and villagers to their village', () => {
    const a = assignResidents(huts, [{ id: 'a', home: 'camp' }, { id: 'b', home: 'camp' }, { id: 'c', home: 0 }]);
    expect(a).toEqual({ a: 'camp:0', b: 'camp:1', c: 'n1' });
  });
  it('rests at night, shelters civilians from storms, alarm or fire sends all out', () => {
    const base = { night: false, weather: 'clear' as const, alarm: false, warrior: false, burning: false };
    expect(wantsIndoors({ ...base, night: true })).toBe(true);
    expect(wantsIndoors({ ...base, weather: 'blizzard' })).toBe(true);
    expect(wantsIndoors({ ...base, weather: 'blizzard', warrior: true })).toBe(false);
    expect(wantsIndoors({ ...base, night: true, alarm: true })).toBe(false);
    expect(wantsIndoors({ ...base, night: true, burning: true })).toBe(false);
  });
});
