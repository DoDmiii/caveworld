// Engine-freies Notizbuch: Hintergrundgeschichte der Stämme, die sich durch Spielen freischaltet.
// Texte und Freischalt-Regeln stehen hier, damit sie ohne Phaser und React testbar bleiben.

export type TribeId = "wenja" | "nordics" | "dragon";
export const TRIBE_IDS: readonly TribeId[] = ["wenja", "nordics", "dragon"];

/** 0 = nur ein Gerücht, 1 = gesehen, 2 = Kontakt gehabt, 3 = gut bekannt. */
export type Knowledge = 0 | 1 | 2 | 3;

export type LoreSection = { level: 1 | 2 | 3; title: string; text: string };
export type LoreFact = { level: 1 | 2 | 3; label: string; value: string };
export type LoreTribe = {
  id: TribeId;
  name: string;
  subtitle: string;
  /** Was der Spieler über unbekannte Völker hört, bevor er sie getroffen hat. */
  rumor: string;
  sections: readonly LoreSection[];
  facts: readonly LoreFact[];
};

export const LORE: Record<TribeId, LoreTribe> = {
  wenja: {
    id: "wenja",
    name: "Die Wenja",
    subtitle: "Das Volk des grünen Tals",
    rumor: "",
    sections: [
      {
        level: 1,
        title: "Heimat und Aussehen",
        text: "Im Herzen des Landes, unterhalb des Nordgebirges, liegt das grüne Tal. Dort leben die Wenja, seit sich jemand erinnern kann. Sie sind groß, breit gebaut und von einer Kraft, die man ihnen schon beim Gehen ansieht. Ihr Haar reicht von hellem bis dunklem Braun, ihre Haut von hell bis leicht dunkel, und viele haben helle Augen, aber nicht alle. Die Kälte macht ihnen weniger zu schaffen als anderen Völkern, doch die Gipfel des Nordens meiden auch sie.",
      },
      {
        level: 2,
        title: "Jagd, Fleisch und Streit",
        text: "Das Leben der Wenja ist hart. Sie essen fast nur, was sie erlegen, und wer nicht kämpfen kann, wird nicht alt. Ihre Hütten sind klein und zweckmäßig, aus Mammut- oder Tigerleder und Fell gebaut. Wenn Nahrung knapp wird, entscheidet die Jagd, wer satt wird.",
      },
      {
        level: 3,
        title: "Das Gesetz der Starken",
        text: "Bei den Wenja zählt nur der Stärkste, und nur er soll seine Kinder in die Welt setzen. So hart sie untereinander sind, nach außen halten sie zusammen. Zwischen den Sippen fließt oft Blut, gegen Fremde stehen sie als ein Volk.",
      },
    ],
    facts: [
      { level: 1, label: "Heimat", value: "Das zentrale grüne Tal" },
      { level: 1, label: "Gestalt", value: "Groß, breit, sehr kräftig" },
      { level: 2, label: "Nahrung", value: "Fast nur Fleisch" },
      { level: 2, label: "Hütten", value: "Mammut- oder Tigerleder, Fell" },
      { level: 3, label: "Kultur", value: "Patriarchale Kriegerkultur" },
    ],
  },
  nordics: {
    id: "nordics",
    name: "Die Nordics",
    subtitle: "Das Volk der Tundra",
    rumor:
      "Aus dem Norden erzählt man sich von einem weißen Land hinter dem Gebirge, wo Fremde nicht willkommen sind.",
    sections: [
      {
        level: 1,
        title: "Das Land hinter dem Gebirge",
        text: "Hinter dem Nordgebirge liegt eine weiße, endlose Tundra. Der Boden dort ist reich an Erz, aber die Nächte sind lang, und in jedem Schatten lauern Raubtiere. Die Nordics sind mit den Wenja verwandt, doch die Sonne fehlt ihnen. Das Licht, das ihre Vorfahren nicht fanden, trägt jetzt ihr Haar: Sie sind blond, blauäugig und sehr hell, groß und von mächtigem Wuchs.",
      },
      {
        level: 2,
        title: "Ständige Bereitschaft",
        text: "Weil in der Tundra überall Gefahr droht, leben die Nordics in ständiger Bereitschaft. Fremde sind für sie keine Gäste, sondern Gefahr, und sie behandeln sie auch so. Ihre Hütten gleichen denen der Wenja, aber sie schmücken ihre Lager mit Mammuthörnern und Knochen. Wer ihr Dorf betritt, soll wissen, wessen Land es ist.",
      },
      {
        level: 3,
        title: "Der Champion",
        text: "Im Zentrum jeder Siedlung steht ihr Champion, ein Krieger von übermenschlicher Größe und Kraft, der wie ein Gott verehrt wird. Wer ihn fällt, trifft das ganze Dorf ins Herz.",
      },
    ],
    facts: [
      { level: 1, label: "Heimat", value: "Schneetundra hinter dem Nordgebirge" },
      { level: 1, label: "Gestalt", value: "Sehr groß, stark, blond, blauäugig" },
      { level: 2, label: "Haltung", value: "Gewaltbereit gegenüber Fremden" },
      { level: 2, label: "Lager", value: "Mammuthörner und Knochen" },
      { level: 3, label: "Anführer", value: "Ein verehrter Stammeschampion" },
    ],
  },
  dragon: {
    id: "dragon",
    name: "Die Drachenmenschen",
    subtitle: "Das Volk der Terrassen",
    rumor:
      "Reisende sprechen von Terrassen im fernen Nordosten, wo ein Volk einen Drachen anbetet.",
    sections: [
      {
        level: 1,
        title: "Die Terrassen",
        text: "Weit im Nordosten, wo die gelben Flüsse aus dem Ostgebirge strömen, haben die Drachenmenschen ihre Terrassen in den Fels gebaut. Sie sind klein und schmal gebaut, mit dunklen, schmalen Augen und schwarzem Haar. Ihre Haut ist meist etwas dunkler als die der Wenja, bei manchen aber heller.",
      },
      {
        level: 2,
        title: "Speer und Fels",
        text: "Ihre Kraft liegt nicht in der Muskelmasse. Die Drachenmenschen sind Meister des Speers und geborene Kletterer, die Felswände nehmen, an denen andere scheitern. Es gibt mehr Frauen als Männer im Volk, und viele von ihnen sind Kriegerinnen, gefürchtet und gut. Nur sie tragen das Wolfsfell über dem Kopf, ein Zeichen, dass sie Kriegerinnen sind.",
      },
      {
        level: 3,
        title: "Der Drache und die Feste",
        text: "Die Drachenmenschen verehren einen langgestreckten Drachen als Gott. Oft feiern sie bunte Feste ihm zu Ehren, mit Farben, Tanz und Gesang. Respekt und Ehre stehen bei ihnen über allem.",
      },
      {
        level: 3,
        title: "Ehre und Argwohn",
        text: "Die Männer der Drachenmenschen kämpfen weniger als anderswo und sind gerade deshalb auf der Hut. Die Männer der Wenja und der Nordics beeindrucken manche Frauen der Terrassen mehr, als diese offen zugeben. Die Männer des Clans sehen in solchen Fremden darum eine echte Bedrohung und behandeln sie mit offener Feindschaft.",
      },
    ],
    facts: [
      { level: 1, label: "Heimat", value: "Gebirgsterrassen im Ostgebirge, an den gelben Flüssen" },
      { level: 1, label: "Gestalt", value: "Klein, schmal, schwarzes Haar, dunkle Augen" },
      { level: 2, label: "Stärken", value: "Speerkunst, Klettern" },
      { level: 2, label: "Kriegerinnen", value: "Tragen als Einzige den Wolfspelz" },
      { level: 3, label: "Glaube", value: "Ein langgestreckter Drache" },
      { level: 3, label: "Bräuche", value: "Bunte Feste" },
    ],
  },
};

// ---------- Freischalten ----------
export type LoreCounter = { met: number; contact: number; champion?: boolean | undefined };
/** Gespeicherter Stand pro fremdem Volk. Die Wenja sind das eigene Volk und immer bekannt. */
export type LoreState = Partial<Record<Exclude<TribeId, "wenja">, LoreCounter>>;
export const EMPTY_LORE: LoreState = {};

export type LoreEvent = "met" | "contact" | "champion";
/** So viele Kontakte (Gespräche, Handel, Kämpfe) machen ein Volk gut bekannt. */
export const CONTACTS_FOR_FULL = 4;

/** Dorf-Index (FOLK_HOMES) -> Volk. 0 bis 2 sind Nordic-Dörfer, 3 die Drachenterrasse. */
export const tribeOfVillage = (village: number): Exclude<TribeId, "wenja"> =>
  village === 3 ? "dragon" : "nordics";

export function knowledgeOf(state: LoreState, tribe: TribeId): Knowledge {
  if (tribe === "wenja") return 3;
  const c = state[tribe];
  if (!c) return 0;
  if (c.champion || c.contact >= CONTACTS_FOR_FULL) return 3;
  if (c.contact >= 1) return 2;
  return c.met >= 1 ? 1 : 0;
}

export function recordLore(
  state: LoreState,
  tribe: Exclude<TribeId, "wenja">,
  event: LoreEvent,
): { state: LoreState; before: Knowledge; after: Knowledge } {
  const before = knowledgeOf(state, tribe);
  const c = state[tribe] ?? { met: 0, contact: 0 };
  const next: LoreCounter =
    event === "met"
      ? { ...c, met: Math.min(c.met + 1, 1000) }
      : event === "contact"
        ? { ...c, met: Math.max(c.met, 1), contact: Math.min(c.contact + 1, 1000) }
        : { ...c, met: Math.max(c.met, 1), contact: Math.max(c.contact, 1), champion: true };
  const out = { ...state, [tribe]: next };
  return { state: out, before, after: knowledgeOf(out, tribe) };
}

export type EntryView = {
  tribe: LoreTribe;
  knowledge: Knowledge;
  /** Sichtbare Abschnitte und Fakten. Bei Wissen 0 leer, nur das Gerücht zählt. */
  sections: LoreSection[];
  facts: LoreFact[];
  /** Wie viele Abschnitte noch verborgen sind, für den Hinweis "weitere Seiten fehlen". */
  hidden: number;
};

export function entryView(state: LoreState, tribe: TribeId): EntryView {
  const knowledge = knowledgeOf(state, tribe),
    t = LORE[tribe];
  const sections = t.sections.filter((s) => s.level <= knowledge);
  return {
    tribe: t,
    knowledge,
    sections,
    facts: t.facts.filter((f) => f.level <= knowledge),
    hidden: t.sections.length - sections.length,
  };
}

/** Kurzer Hinweis, was als Nächstes den Eintrag erweitert. */
export function unlockHint(knowledge: Knowledge): string {
  if (knowledge === 0) return "Begegne diesem Volk, um mehr zu erfahren.";
  if (knowledge === 1) return "Sprich mit ihnen, handle oder kämpfe, um mehr zu erfahren.";
  if (knowledge === 2) return "Mehr Begegnungen enthüllen ihre tiefsten Bräuche.";
  return "";
}
