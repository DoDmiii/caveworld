import { describe, it, expect } from 'vitest';
import { TREE_HP, ROCK_HP, TREE_DROP, ROCK_DROP, emptyStock, gain } from '@/game/harvest';

describe('Ernte-Regeln', () => {
  it('Baum braucht 3 Axtschläge', () => expect(TREE_HP).toBe(3));
  it('Fels braucht 3 Axtschläge', () => expect(ROCK_HP).toBe(3));
  it('Baum lässt 3 Holz und 1 Faser fallen', () => {
    expect(TREE_DROP.wood).toBe(3);
    expect(TREE_DROP.fiber).toBe(1);
  });
  it('Fels lässt 2 Stein und 1 Feuerstein fallen', () => {
    expect(ROCK_DROP.stone).toBe(2);
    expect(ROCK_DROP.flint).toBe(1);
  });
  it('gain zählt Ressourcen auf den Vorrat', () => {
    const s = gain(gain(emptyStock(), 'wood', 3), 'wood');
    expect(s.wood).toBe(4);
    expect(s.stone).toBe(0);
  });
});
