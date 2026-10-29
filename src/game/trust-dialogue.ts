import type { CampDialogue } from './camp-dialogue';
import { trustSteps, type TrustProgress } from './trust';
export function personalDialogues(pid: string, trust: number, progress: TrustProgress | undefined): CampDialogue[] {
  const line = trust < 30 ? 'Ich bin hier, aber mein Vertrauen musst du dir verdienen.' : trust < 60 ? 'Deine Taten zählen. Noch kenne ich dich nicht gut genug.' : 'Du hast Wort gehalten. An deinem Feuer ist auch mein Platz.';
  const choices = [{ id: 'listen', label: 'Was ist dir wichtig?', reply: '', bond: 0 }];
  if (pid === 'skorra') {
    choices.push({ id: 'meal', label: 'Gebratenes Fleisch teilen', reply: '', bond: 0 });
    if (progress?.done.includes('meal') && !progress.done.includes('hunt')) choices.push({ id: 'hunt', label: 'Zur gemeinsamen Jagd einladen', reply: '', bond: 0 });
  }
  if (pid === 'ilvar' && !progress?.done.includes('weapon')) choices.push({ id: 'weapon', label: 'Meinen Speer zurückgeben', reply: '', bond: 0 });
  if (pid === 'torvik' && !progress?.done.includes('heal')) choices.push({ id: 'heal', label: 'Gemeinsam einen Verwundeten versorgen', reply: '', bond: 0 });
  if (pid === 'ymra' && !progress?.done.includes('mercy')) choices.push({ id: 'mercy', label: 'Du bist frei. Kein Lösegeld.', reply: '', bond: 0 });
  return [{ id: `trust-${pid}`, people: [pid, pid], title: 'Ein Platz in der Sippe', lines: [{ speaker: pid, text: line }, { speaker: pid, text: trustSteps(pid, progress).filter(s => !s.done).map(s => s.label).join(' · ') || 'Ich vertraue dir.' }], choices }];
}