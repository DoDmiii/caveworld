import { describe, expect, it } from 'vitest';
import { availableCampDialogues, emptyCampSocial, pairBond, resolveCampDialogue } from '@/game/camp-dialogue';
describe('Sippenstreit und Lagergespräche', () => {
  const present = ['tamo', 'nuka'];
  it('Tamo und Nuka streiten nur, wenn beide anwesend sind', () => {
    expect(availableCampDialogues(emptyCampSocial(), 'tamo', ['tamo'], 1)).toHaveLength(0);
    expect(availableCampDialogues(emptyCampSocial(), 'tamo', present, 1).map(d => d.id)).toEqual(['hunters-gatherers']);
  });
  it('Vermittlung verbessert die gegenseitige Beziehung, Parteinahme verschlechtert sie', () => {
    const peace = resolveCampDialogue(emptyCampSocial(), 'hunters-gatherers', 'together', 'tamo', present, 1);
    const side = resolveCampDialogue(emptyCampSocial(), 'hunters-gatherers', 'hunter', 'tamo', present, 1);
    expect(peace && pairBond(peace.state, 'tamo', 'nuka')).toBe(-5);
    expect(side && pairBond(side.state, 'nuka', 'tamo')).toBe(-30);
  });
  it('ein Gespräch kann am selben Spieltag nicht mehrfach Beziehungen vergeben', () => {
    const first = resolveCampDialogue(emptyCampSocial(), 'hunters-gatherers', 'together', 'tamo', present, 1);
    if (!first) throw new Error('Missing dialogue');
    expect(resolveCampDialogue(first.state, 'hunters-gatherers', 'together', 'nuka', present, 1)).toBeNull();
    expect(availableCampDialogues(first.state, 'tamo', present, 2)).toHaveLength(1);
  });
  it('fremde Personen und ungültige Antworten können kein Gespräch auslösen', () => {
    expect(resolveCampDialogue(emptyCampSocial(), 'hunters-gatherers', 'together', 'bruk', present, 1)).toBeNull();
    expect(resolveCampDialogue(emptyCampSocial(), 'hunters-gatherers', 'invalid', 'tamo', present, 1)).toBeNull();
  });
});