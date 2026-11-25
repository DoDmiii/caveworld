import { describe, expect, it } from 'vitest';
import { restAction, SCAVENGERS, hasAction } from './wildlife';

describe('wildlife actions', () => {
  it('bears sleep at night but not by day', () => {
    expect(restAction('bear', true, 0.9)).toBe('sleep');
    expect(restAction('bear', false, 0.1)).toBe(null);
  });
  it('gazelles and buffalo graze on about half their pauses', () => {
    expect(restAction('gazelle', false, 0.2)).toBe('graze');
    expect(restAction('buffalo', true, 0.2)).toBe('graze');
    expect(restAction('gazelle', false, 0.8)).toBe(null);
  });
  it('tigers scavenge like wolves; bear, dhole and buffalo have run animations', () => {
    expect(SCAVENGERS).toContain('tiger');
    expect(['bear', 'dhole', 'buffalo'].every(k => hasAction(k as 'bear', 'run'))).toBe(true);
  });
});
