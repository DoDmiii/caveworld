/** Camp dialogue and pair relationships; no engine or UI dependencies. */
export type CampSocial = { bonds: Record<string, number>; resolved: Record<string, number> };
export type DialogueChoice = { id: string; label: string; reply: string; bond: number };
export type CampDialogue = { id: string; people: [string, string]; title: string; lines: { speaker: string; text: string }[]; choices: DialogueChoice[] };
export const emptyCampSocial = (): CampSocial => ({ bonds: {}, resolved: {} });
export const bondKey = (a: string, b: string) => [a, b].sort().join(':');
export const CAMP_DIALOGUES: CampDialogue[] = [
  { id: 'hunters-gatherers', people: ['tamo', 'nuka'], title: 'Wer ernährt die Sippe?', lines: [
    { speaker: 'tamo', text: 'Ohne meine Jagd würdet ihr nur Wurzeln kauen.' },
    { speaker: 'nuka', text: 'Und ohne meine Beeren würdest du hungrig auf deine Beute warten.' },
  ], choices: [
    { id: 'together', label: 'Wir brauchen Jagd und Sammlung.', reply: 'Nuka: Dann lass uns teilen. Tamo: Gut. Aber ich trage nicht alle Wurzeln!', bond: 15 },
    { id: 'hunter', label: 'Tamo bringt die wertvollere Beute.', reply: 'Nuka: Dann soll seine Beute euch morgen auch satt machen.', bond: -10 },
    { id: 'gatherer', label: 'Nukas Vorräte halten uns am Leben.', reply: 'Tamo: Dann sucht euch einen anderen Jäger.', bond: -10 },
  ] },
  { id: 'mother-warrior', people: ['orka', 'bruk'], title: 'Kein Junge mehr', lines: [
    { speaker: 'orka', text: 'Du nimmst Tamo nicht wieder unvorbereitet mit zu den großen Tieren.' },
    { speaker: 'bruk', text: 'Er lernt nicht zu jagen, wenn du ihn am Feuer festhältst.' },
  ], choices: [
    { id: 'prepare', label: 'Erst üben, dann gemeinsam jagen.', reply: 'Orka: Mit guter Vorbereitung. Bruk: Ich zeige ihm die sicheren Spuren.', bond: 15 },
    { id: 'risk', label: 'Bruk hat recht. Tamo muss sich beweisen.', reply: 'Orka: Sein Leben ist kein Beweis für deinen Stolz.', bond: -10 },
    { id: 'stay', label: 'Orka entscheidet. Tamo bleibt hier.', reply: 'Bruk: Angst führt keine Jagdtruppe.', bond: -10 },
  ] },
  { id: 'outsider', people: ['bruk', 'skorra'], title: 'Ein Platz an unserem Feuer', lines: [
    { speaker: 'bruk', text: 'Ich vergesse nicht, was die Nordics uns genommen haben.' },
    { speaker: 'skorra', text: 'Ich sitze hier, nicht dein alter Feind. Beurteile meine Taten.' },
  ], choices: [
    { id: 'respect', label: 'Hier zählen Taten, nicht Herkunft.', reply: 'Bruk: Ich werde hinsehen. Skorra: Mehr verlange ich nicht.', bond: 15 },
    { id: 'distrust', label: 'Bruks Vorsicht schützt uns.', reply: 'Skorra: Wenn ihr nur meine Herkunft seht, lernt ihr mich nie kennen.', bond: -10 },
  ] },
  { id: 'healer-brother', people: ['ura', 'bruk'], title: 'Ich kann selbst entscheiden', lines: [
    { speaker: 'ura', text: 'Bruk, ich brauche keine Wache bei jedem Schritt.' },
    { speaker: 'bruk', text: 'Ich will dich nicht auch noch verlieren.' },
  ], choices: [
    { id: 'listen', label: 'Beschütze sie, aber höre ihr zu.', reply: 'Ura: Das wäre ein Anfang. Bruk: Ich versuche es.', bond: 15 },
    { id: 'control', label: 'Ura sollte auf ihren Bruder hören.', reply: 'Ura: Meine Kräuter heilen Wunden, nicht seinen Dickkopf.', bond: -10 },
  ] },
  { id: 'fire-stories', people: ['kuruk', 'torvik'], title: 'Geschichten in der Glut', lines: [
    { speaker: 'kuruk', text: 'Als ich die Glut aus der alten Höhle trug, folgte mir der Winter.' },
    { speaker: 'torvik', text: 'Bei uns heißt es: Feuer erinnert sich an alle Hände, die es hüten.' },
  ], choices: [
    { id: 'share', label: 'Erzählt euch eure Geschichten.', reply: 'Kuruk: Dann höre ich heute zu. Torvik: Und morgen erzählst du weiter.', bond: 15 },
    { id: 'dismiss', label: 'Alte Geschichten helfen uns nicht.', reply: 'Kuruk: Wer keine Erinnerung hat, geht denselben Irrweg zweimal.', bond: -10 },
  ] },
];
export function pairBond(state: CampSocial, a: string, b: string): number {
  const initial = CAMP_DIALOGUES.some(d => bondKey(...d.people) === bondKey(a, b) && d.id !== 'fire-stories') ? -20 : 0;
  return state.bonds[bondKey(a, b)] ?? initial;
}
export const bondLabel = (bond: number) => bond < 0 ? 'Angespannt' : bond < 30 ? 'Verständigung' : 'Verbunden';
export function availableCampDialogues(state: CampSocial, person: string, present: readonly string[], day: number): CampDialogue[] {
  return CAMP_DIALOGUES.filter(d => d.people.includes(person) && d.people.every(p => present.includes(p)) && (state.resolved[d.id] ?? 0) < day);
}
export function resolveCampDialogue(state: CampSocial, id: string, choiceId: string, person: string, present: readonly string[], day: number): { state: CampSocial; reply: string } | null {
  const dialogue = availableCampDialogues(state, person, present, day).find(d => d.id === id);
  const choice = dialogue?.choices.find(c => c.id === choiceId);
  if (!dialogue || !choice) return null;
  const key = bondKey(...dialogue.people);
  return { state: { bonds: { ...state.bonds, [key]: Math.max(-100, Math.min(100, pairBond(state, ...dialogue.people) + choice.bond)) }, resolved: { ...state.resolved, [id]: day } }, reply: choice.reply };
}