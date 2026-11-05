import { describe, expect, it } from 'vitest';
import { ATTACK_START, folkDeathFrame } from '../game/folk-animation';

describe('inhabitant atlas actions', () => {
  it('keeps all eight dragon death directions separate from the nine-frame attacks', () => {
    expect(Array.from({ length: 8 }, (_, d) => folkDeathFrame(d, true))).toEqual([144, 151, 158, 165, 172, 179, 186, 193]);
    expect(ATTACK_START + 7 * 9 + 8).toBe(143);
  });
  it('retains the Nordic four-direction death layout', () => {
    expect(Array.from({ length: 8 }, (_, d) => folkDeathFrame(d, false))).toEqual([144, 151, 151, 158, 158, 165, 165, 144]);
  });
});