import { describe, expect, it } from 'vitest';
import { tickTask, nextTask, TASK_CHEST_CAP } from '@/game/tasks';
import { EMPTY_CHEST } from '@/game/storage';

describe('Stammesaufgaben', () => {
  it('Holzfäller legt pro Spielstunde 1 Holz in die Kiste', () => {
    const r = tickTask({ kind: 'wood', since: 0 }, EMPTY_CHEST, 180, true);
    expect(r.chest.wood).toBe(3);
    expect(r.task.since).toBe(180);
  });
  it('Steineklopfer bringt alle 2 Zyklen einen Feuerstein', () => {
    const r = tickTask({ kind: 'stone', since: 0 }, EMPTY_CHEST, 180, true);
    expect(r.chest.stone).toBe(2);
    expect(r.chest.flint).toBe(1);
  });
  it('wer dem Spieler folgt, arbeitet nicht', () => {
    const r = tickTask({ kind: 'forage', since: 0 }, EMPTY_CHEST, 600, false);
    expect(r.chest.berries).toBe(0);
    expect(r.task.since).toBe(600);
  });
  it('Produktion stoppt bei voller Kiste', () => {
    const r = tickTask({ kind: 'wood', since: 0 }, { ...EMPTY_CHEST, wood: TASK_CHEST_CAP - 1 }, 600, true);
    expect(r.chest.wood).toBe(TASK_CHEST_CAP);
  });
  it('Aufgaben wechseln reihum', () => {
    expect(nextTask('none')).toBe('wood');
    expect(nextTask('forage')).toBe('none');
  });
});
