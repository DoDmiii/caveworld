import { describe, expect, it } from 'vitest';
import { advanceTrust, newTrustProgress } from '@/game/trust';
describe('Persönliches Vertrauen', () => {
  it('Skorra braucht geteiltes Fleisch vor der gemeinsamen Jagd', () => {
    expect(advanceTrust('skorra', undefined, 0, 'hunt', 0).trust).toBe(0);
    const meal = advanceTrust('skorra', undefined, 0, 'meal', 0);
    expect(advanceTrust('skorra', meal.state, meal.trust, 'hunt', 10).trust).toBe(60);
    expect(advanceTrust('skorra', meal.state, meal.trust, 'meal', 10).trust).toBe(30);
  });
  it('drei volle Tage ohne Wolfsjagd; ein Wolf setzt die Frist zurück', () => {
    const initial = newTrustProgress(500);
    expect(advanceTrust('skorra', initial, 0, 'day', 4819).trust).toBe(0);
    expect(advanceTrust('skorra', initial, 0, 'day', 4820).trust).toBe(30);
    const wolf = advanceTrust('skorra', initial, 30, 'wolf', 1000);
    expect(wolf.trust).toBe(15);
    expect(advanceTrust('skorra', wolf.state, 15, 'day', 4820).trust).toBe(15);
  });
  it('Ilvars Nachtwache braucht den zurückgegebenen Speer und vier Nachtstunden', () => {
    expect(advanceTrust('ilvar', undefined, 0, 'watch', 0, { minutes: 240 }).trust).toBe(0);
    const weapon = advanceTrust('ilvar', undefined, 0, 'weapon', 0);
    expect(advanceTrust('ilvar', weapon.state, 30, 'watch', 239, { minutes: 239 }).trust).toBe(30);
    const watch = advanceTrust('ilvar', weapon.state, 30, 'watch', 240, { minutes: 240 });
    expect(watch.trust).toBe(60);
    expect(advanceTrust('ilvar', watch.state, 60, 'day', 241, { peace: false }).trust).toBe(60);
    expect(advanceTrust('ilvar', watch.state, 60, 'day', 241, { peace: true }).trust).toBe(90);
  });
  it('Torviks Geschichten sind einmalig; ein beobachteter Finisher schadet', () => {
    const first = advanceTrust('torvik', undefined, 0, 'stories', 0);
    expect(advanceTrust('torvik', first.state, 30, 'stories', 1).trust).toBe(30);
    expect(advanceTrust('torvik', first.state, 30, 'finisher', 1).trust).toBe(0);
  });
  it('Ymra braucht zwei faire Geschäfte ohne Gewalt und drei Tage Frieden', () => {
    const one = advanceTrust('ymra', undefined, 0, 'trade', 0);
    expect(one.trust).toBe(0);
    expect(advanceTrust('ymra', one.state, 0, 'trade', 1).trust).toBe(30);
    const reset = advanceTrust('ymra', one.state, 0, 'violence', 1);
    expect(advanceTrust('ymra', reset.state, 0, 'trade', 2).trust).toBe(0);
    expect(advanceTrust('ymra', reset.state, 0, 'day', 4321, { peace: true }).trust).toBe(30);
    expect(advanceTrust('ymra', reset.state, 0, 'day', 4321, { peace: false }).trust).toBe(0);
  });
});