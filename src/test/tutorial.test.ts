import { describe, it, expect } from 'vitest';
import { newTutorial, tutorialEvent, TUTORIAL_DONE } from '@/game/tutorial';

describe('Einführung', () => {
  it('Laufen schließt Schritt 1 erst nach 160 px ab', () => {
    let s = tutorialEvent(newTutorial(), { kind: 'move', dist: 150 }).state;
    expect(s.step).toBe(0);
    const r = tutorialEvent(s, { kind: 'move', dist: 15 });
    expect(r.state.step).toBe(1); expect(r.completed?.xp).toBe(5);
  });
  it('braucht 3 Beeren und ignoriert Ereignisse anderer Schritte', () => {
    let s = { step: 1, progress: 0 };
    s = tutorialEvent(s, { kind: 'craft' }).state; expect(s).toEqual({ step: 1, progress: 0 });
    s = tutorialEvent(s, { kind: 'berry' }).state; s = tutorialEvent(s, { kind: 'berry' }).state;
    expect(s.step).toBe(1);
    expect(tutorialEvent(s, { kind: 'berry' }).state.step).toBe(2);
  });
  it('endet nach Rekrutieren', () => {
    const r = tutorialEvent({ step: 4, progress: 0 }, { kind: 'recruit' });
    expect(r.state.step).toBe(TUTORIAL_DONE);
    expect(tutorialEvent(r.state, { kind: 'recruit' }).completed).toBeUndefined();
  });
});
