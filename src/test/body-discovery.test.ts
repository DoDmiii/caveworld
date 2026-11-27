import { describe, it, expect } from 'vitest';
import { discoverBodies, type BodyObserver } from '@/game/body-discovery';
import { bodyFoundOutcome } from '@/game/events';
const body = { id: 'victim', hut: 'Rabenhain:1', x: 240, y: 172, found: false };
const observer: BodyObserver = { id: 'finder', hut: body.hut, x: 240, y: 200, alive: true, awake: true, free: true };
describe('unbeobachtete Morde im Haus', () => {
  it('bleibt ohne weitere Person im Haus unbekannt', () => { expect(discoverBodies([body], []).state[0]?.found).toBe(false); });
  it('wird nicht von Personen draußen oder in einer anderen Hütte entdeckt', () => {
    expect(discoverBodies([body], [{ ...observer, hut: null }, { ...observer, hut: 'Rabenhain:2' }]).found).toHaveLength(0);
  });
  it('wird erst beim tatsächlichen Fund im selben Haus bekannt', () => { expect(discoverBodies([body], [observer]).state[0]?.found).toBe(true); });
  it('wird nicht von schlafenden, toten oder gefesselten Personen gemeldet', () => {
    for (const o of [{ ...observer, awake: false }, { ...observer, alive: false }, { ...observer, free: false }]) expect(discoverBodies([body], [o]).found).toHaveLength(0);
  });
  it('meldet denselben Fund nur einmal', () => { const first = discoverBodies([body], [observer]); expect(discoverBodies(first.state, [observer]).found).toHaveLength(0); });
  it('kennt durch den Fund allein nicht den Täter', () => { expect(bodyFoundOutcome('rabenhain').identified).toBe(false); expect(bodyFoundOutcome('rabenhain').alarm).toBe(true); expect(bodyFoundOutcome('rabenhain').fear).toBeNull(); });
});