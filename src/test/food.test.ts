import { describe, expect, it } from 'vitest';
import { eat, roast } from '../game/food';

const base = { health: 50, stamina: 30, hunger: 50, berries: 1, meat: 1, cooked: 1, jerky: 1 };
describe('healing food', () => {
  it('berries heal 15', () => expect(eat(base, 'berries')?.health).toBe(65));
  it('raw meat heals 20', () => expect(eat(base, 'meat')?.health).toBe(70));
  it('roasted meat heals 45 and refills stamina', () => {
    const r = eat(base, 'cooked');
    expect(r?.health).toBe(95); expect(r?.stamina).toBe(100);
  });
  it('healing caps at 100', () => expect(eat({ ...base, health: 95 }, 'cooked')?.health).toBe(100));
  it('food fills hunger', () => { expect(eat(base, 'berries')?.hunger).toBe(60); expect(eat(base, 'cooked')?.hunger).toBe(90); });
  it('hunger caps at 100', () => expect(eat({ ...base, hunger: 95 }, 'cooked')?.hunger).toBe(100));
  it('hungry players can eat at full health', () => expect(eat({ ...base, health: 100, stamina: 100 }, 'meat')?.hunger).toBe(70));
  it('no effect when health, stamina and hunger are full', () => expect(eat({ ...base, health: 100, stamina: 100, hunger: 100 }, 'cooked')).toBeUndefined());
  it('cannot eat without food', () => expect(eat({ ...base, berries: 0 }, 'berries')).toBeUndefined());
  it('roasting turns one raw meat into roasted meat', () => {
    const r = roast(base);
    expect(r?.meat).toBe(0); expect(r?.cooked).toBe(2);
  });
});
