// Einführung "Die ersten fünf Minuten": engine-freie Schrittlogik, die world.ts füttert und speichert.

export type TutorialStep = { title: string; hint: string; goal: number; xp: number };

export const TUTORIAL_STEPS: TutorialStep[] = [
  { title: 'Sieh dich um', hint: 'Lauf ein paar Schritte durchs Lager', goal: 160, xp: 5 },
  { title: 'Nahrung finden', hint: 'Sammle Beeren an einem Busch (E)', goal: 3, xp: 10 },
  { title: 'Wärme am Feuer', hint: 'Geh zum Lagerfeuer in der Mitte', goal: 1, xp: 5 },
  { title: 'Werkzeug fertigen', hint: 'Öffne den Rucksack und stelle etwas her', goal: 1, xp: 15 },
  { title: 'Ein Jagdtrupp', hint: 'Sprich ein Stammesmitglied an (T) und lass es folgen', goal: 1, xp: 20 },
];

export const TUTORIAL_DONE = TUTORIAL_STEPS.length;

export type TutorialState = { step: number; progress: number };

export type TutorialEvent =
  | { kind: 'move'; dist: number }
  | { kind: 'berry' }
  | { kind: 'fire' }
  | { kind: 'craft' }
  | { kind: 'recruit' };

const STEP_EVENT: TutorialEvent['kind'][] = ['move', 'berry', 'fire', 'craft', 'recruit'];

export function newTutorial(): TutorialState { return { step: 0, progress: 0 }; }

/** Wendet ein Ereignis an; meldet den abgeschlossenen Schritt (für EP und Meldung). */
export function tutorialEvent(s: TutorialState, ev: TutorialEvent): { state: TutorialState; completed?: TutorialStep } {
  if (s.step >= TUTORIAL_DONE || STEP_EVENT[s.step] !== ev.kind) return { state: s };
  const step = TUTORIAL_STEPS[s.step];
  if (!step) return { state: s };
  const progress = Math.min(step.goal, s.progress + (ev.kind === 'move' ? ev.dist : 1));
  if (progress < step.goal) return { state: { step: s.step, progress } };
  return { state: { step: s.step + 1, progress: 0 }, completed: step };
}

/** Anzeige-Fortschritt; Laufstrecke wird als Prozent gezeigt. */
export function tutorialLabel(s: TutorialState): string {
  const step = TUTORIAL_STEPS[s.step];
  if (!step) return '';
  if (step.goal === 1) return '';
  if (s.step === 0) return `${Math.floor((s.progress / step.goal) * 100)} %`;
  return `${s.progress}/${step.goal}`;
}
