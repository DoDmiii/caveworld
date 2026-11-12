/** Stable biographies, separate from mutable saves and from Phaser. Bonuses are descriptive until step 2. */
export const SKILLS = ['hunt', 'tough', 'gather', 'watch', 'fire'] as const;
export type Skill = typeof SKILLS[number];
export type Skills = Record<Skill, number>;
export const SKILL_LABEL: Record<Skill, string> = { hunt: 'Jagdgeschick', tough: 'Robustheit', gather: 'Sammlergespür', watch: 'Wachsamkeit', fire: 'Feuerkunst & Heilung' };
export type ProfileState = { trust: number; skills: Skills };
export type ProfileStates = Record<string, ProfileState>;
export type Profile = {
  id: string; name: string; epithet: string; role: string; origin: string; skills: Skills;
  strength: { label: string; effect: string }; quirk: { label: string; effect: string };
  background: string; relations: { with: string; note: string }[];
  trust?: { likes: string[]; dislikes: string[]; steps: string[] };
};
const skills = (hunt: number, tough: number, gather: number, watch: number, fire: number): Skills => ({ hunt, tough, gather, watch, fire });
export const PROFILES: Profile[] = [
  { id: 'orka', name: 'Orka', epithet: 'Steinhand', role: 'Grobschmiedin', origin: 'Deine Sippe', skills: skills(2,4,1,2,3),
    strength: { label: 'Grobschmiedin', effect: 'Axt, Speer und Keule kosten 1 Material weniger (mindestens 1).' }, quirk: { label: 'Großer Hunger', effect: 'Verbraucht 25 % mehr Nahrung.' },
    background: 'Unerschütterlich und wortkarg, sie zeigt Zuneigung durch Taten statt Worte. Sie schlägt Feuerstein, seit sie laufen kann; ihre Hände sind vernarbt von Funken.',
    relations: [{ with: 'tamo', note: 'Mutter von Tamo. Ihr Beschützerinstinkt hält ihn von großen Tieren fern.' }, { with: 'bruk', note: 'Streitet mit Bruk, wenn er Tamo zur Jagd mitnimmt.' }] },
  { id: 'tamo', name: 'Tamo', epithet: 'Fährtenauge', role: 'Späher und Jäger', origin: 'Deine Sippe', skills: skills(4,2,2,3,1),
    strength: { label: 'Fährtenauge', effect: 'Tiere und Spuren werden 30 % weiter angezeigt; erlegte Tiere geben 15 % mehr Fleisch.' }, quirk: { label: 'Zögert bei großen Tieren', effect: 'Wartet bei Mammut, Bär und Rudel statt anzugreifen; flieht bei 50 % Leben.' },
    background: 'Neugierig und ungeduldig, er redet gern dazwischen und will beweisen, dass er kein Junge mehr ist. Als Kind verlor er fast die Hand an einen Wolf.',
    relations: [{ with: 'orka', note: 'Sohn von Orka.' }, { with: 'bruk', note: 'Bewundert Bruk als Vorbild, zum Ärger seiner Mutter.' }, { with: 'nuka', note: 'Rivalität: Jäger gegen Sammler – wer ernährt den Stamm wirklich?' }] },
  { id: 'bruk', name: 'Bruk', epithet: 'Narbe', role: 'Wächter und Krieger', origin: 'Deine Sippe', skills: skills(2,5,1,3,1),
    strength: { label: 'Standhaft', effect: '+20 maximales Leben, hält Wuchtschläge länger aus und zieht Gegner auf sich.' }, quirk: { label: 'Sturer Stolz', effect: 'Verzögerter Rückzug; verbraucht 20 % mehr Nahrung. Misstraut gefangenen Nordics.' },
    background: 'Laut, loyal und Fremden gegenüber misstrauisch. Er führte die Jagdgruppe, bis ein Überfall der Nordics den Stamm verkleinerte. Die Narbe quer über dem Gesicht erinnert daran.',
    relations: [{ with: 'ura', note: 'Bruder von Ura. Beschützt und bevormundet sie übertrieben.' }, { with: 'kuruk', note: 'Schüler von Kuruk. Nur dessen Worte können ihn bremsen.' }, { with: 'skorra', note: 'Misstraut Skorra im Lager.' }] },
  { id: 'ura', name: 'Ura', epithet: 'Heilwurz', role: 'Kräuterkundige und Heilerin', origin: 'Deine Sippe', skills: skills(1,1,3,2,4),
    strength: { label: 'Heilkunde', effect: 'Heilwickel wirken 50 % stärker; Verwundete im Lager erholen sich langsam von selbst.' }, quirk: { label: 'Kälteempfindlich', effect: 'Verliert Wärme 30 % schneller und bleibt nachts am Feuer.' },
    background: 'Ruhig und aufmerksam mit trockenem Humor, sie sagt unbequeme Wahrheiten. Nach einer Seuche war sie die Einzige, die Kuruk als Kräuterfrau ausbilden konnte.',
    relations: [{ with: 'bruk', note: 'Schwester von Bruk. Leidet unter seiner Bevormundung und würde doch jederzeit sein Leben retten.' }] },
  { id: 'nuka', name: 'Nuka', epithet: 'Wurzelfinger', role: 'Sammlerin', origin: 'Deine Sippe', skills: skills(1,2,5,2,2),
    strength: { label: 'Gespür für Essbares', effect: '+40 % Beeren, findet Heilkräuter und Pilze und erkennt Giftiges.' }, quirk: { label: 'Naschkatze', effect: 'Nascht täglich eine Beere aus dem Vorrat; hält beim Warten nur kurz still.' },
    background: 'Verspielt und neugierig, sie summt beim Sammeln. Als Kind fand sie einen Beerenstrauch, der den Stamm durch einen harten Winter brachte. Seitdem heißt sie Wurzelfinger.',
    relations: [{ with: 'tamo', note: 'Rivalität um den besten Beitrag zur Ernährung. Gemeinsame Aufträge versöhnen sie.' }] },
  { id: 'kuruk', name: 'Kuruk', epithet: 'Aschenbart', role: 'Feuerhüter und Geschichtenerzähler', origin: 'Deine Sippe', skills: skills(1,1,3,3,5),
    strength: { label: 'Hüter der Glut', effect: 'Das Feuer wärmt 25 % weiter und brennt nie aus. Abendgeschichten stärken Moral und Wärme bis zum Morgen.' }, quirk: { label: 'Alter Krieger', effect: 'Erzählt im Kampf von alten Schlachten und weicht keinem Feind.' },
    background: 'Gelassen und redselig, er erzählt halbe Wahrheiten, die mit jedem Mal besser werden. Er trug die Glut aus der alten Höhle und kennt viele Geschichten über die Nordics.',
    relations: [{ with: 'bruk', note: 'Lehrmeister von Bruk, der ihm am Feuer zuhört.' }, { with: 'torvik', note: 'Eine gemeinsame Geschichte am Feuer könnte eine Freundschaft begründen.' }] },
  { id: 'ilvar', name: 'Ilvar', epithet: 'Rabenblick', role: 'Wächter-Späher', origin: 'Frostheim', skills: skills(3,3,1,5,1),
    strength: { label: 'Rabenblick', effect: 'Sieht nachts Gegner und Raubtiere 40 % weiter und kennt die Wachrhythmen von Frostheim.' }, quirk: { label: 'Fluchtneigung', effect: 'Versucht unter 50 Vertrauen nachts zu fliehen.' },
    background: 'Stolz, pflichtbewusst und wortkarg. Nach dem Tod seines Bruders bei einem Überfall schwor er, Frostheim zu schützen. Seine Schwester Tindra lebt dort.',
    relations: [{ with: 'tindra', note: 'Seine Schwester lebt in Frostheim.' }], trust: { likes: ['Respekt vor Stärke', 'Eine Waffe in der Hand', 'Wache halten', 'Ein offener Gruß'], dislikes: ['Fesseln länger als einen Tag', 'Verhöre', 'Überfälle auf Frostheim'], steps: ['Fesseln lösen und den Speer zurückgeben.', 'Eine Nacht gemeinsam Wache am Feuer halten oder ihn im Kampf verschonen.', 'Tindra und Frostheim in Frieden lassen (Dorfbeziehung mindestens 0).'] } },
  { id: 'ymra', name: 'Ymra', epithet: 'Salzhand', role: 'Händlerin und Fischerin', origin: 'Eisfurt', skills: skills(2,2,4,2,2),
    strength: { label: 'Marktsinn', effect: '25 % günstigere Tauschraten bei Nordic-Dörfern; kennt Furten und sichere Flusswege.' }, quirk: { label: 'Heimweh nach dem Fluss', effect: 'Trockene, heiße Gebiete drücken ihre Stimmung. Bleibt gern in Wassernähe.' },
    background: 'Pragmatisch und redegewandt, sie rechnet alles auf. Jahrelang tauschte sie Salz und Fisch zwischen den Dörfern und glaubt, dass jedes Ding seinen Preis hat.', relations: [],
    trust: { likes: ['Faire Tauschgeschäfte', 'Salz und Fisch', 'Geschenke mit Gegengeschenk'], dislikes: ['Gewalt vor ihren Augen', 'Betrug', 'Leere Versprechen'], steps: ['Zwei faire Tauschgeschäfte nacheinander, ohne etwas zu nehmen.', 'Lösegeld ausschlagen.', 'Den Handel mit Eisfurt drei Tage friedlich halten (Dorfbeziehung mindestens +10).'] } },
  { id: 'torvik', name: 'Torvik', epithet: 'Schneeleser', role: 'Heiler und Wetterdeuter', origin: 'Frostheim', skills: skills(1,1,3,4,4),
    strength: { label: 'Schneeleser', effect: 'Sagt Stürme voraus, senkt den Wärmeverlust bei Schnee um 15 % und heilt Erfrierungen.' }, quirk: { label: 'Gewaltlos', effect: 'Kämpft nie und verweigert Angriffsbefehle. Ein Tod in seiner Nähe senkt seine Stimmung.' },
    background: 'Sanft, beobachtend und unerschütterlich, er spricht in Bildern. Er deutete das Wetter für Frostheim und hat noch nie jemanden verletzt.', relations: [{ with: 'kuruk', note: 'Ein Abend mit Geschichten am Feuer könnte sie zu Freunden machen.' }],
    trust: { likes: ['Feuerrituale', 'Kräuter', 'Ruhige Abende', 'Geschichten'], dislikes: ['Blut vor seinen Augen', 'Finisher', 'Fesseln'], steps: ['Fesseln lösen; er flieht nicht.', 'Gemeinsam einen Verwundeten mit einem Heilwickel versorgen.', 'Einen Abend am Feuer Geschichten mit Kuruk tauschen.'] } },
  { id: 'skorra', name: 'Skorra', epithet: 'Wolfsflüsterin', role: 'Jägerin', origin: 'Gipfelwacht', skills: skills(5,3,1,3,1),
    strength: { label: 'Wolfsband', effect: '25 % mehr Fleisch und weniger Streuung bei Speer und Bola. Könnte später gezähmte Wölfe führen.' }, quirk: { label: 'Wild', effect: 'Folgt Befehlen erst ab 60 Vertrauen und flieht, wenn sie sich eingesperrt fühlt.' },
    background: 'Mutig, laut lachend und stolz. Sie zog einen Wolfswelpen groß, den ihr Dorf töten wollte. Seitdem befolgt sie keinen Befehl, den sie nicht versteht.', relations: [{ with: 'bruk', note: 'Bruk misstraut ihr.' }, { with: 'tamo', note: 'Stiller Wettstreit darum, wer der bessere Jäger ist.' }],
    trust: { likes: ['Gebratenes Fleisch', 'Bewegung', 'Gemeinsame Jagd', 'Respekt vor Tieren'], dislikes: ['Fesseln und Käfige', 'Spott', 'Tierquälerei'], steps: ['Gebratenes Fleisch teilen.', 'Gemeinsam jagen und die Beute teilen.', 'Drei Tage keine Wölfe jagen.'] } },
];
/** Identity is assigned to a person, never to a reused sprite texture. */
export const PROFILE_IDS: Record<string, string> = { 'ally-0': 'tamo', 'ally-1': 'bruk', 'ally-2': 'kuruk', 'ally-3': 'orka', 'ally-4': 'ura', 'ally-5': 'nuka', 'nordic-m0': 'ilvar', 'nordic-m2-f': 'torvik', 'nordic-w3': 'ymra', 'nordic-w3-g': 'skorra' };
const OTHER_NAMES: Record<string, string> = { 'nordic-w0': 'Tindra', 'nordic-w1': 'Frenja', 'nordic-m2': 'Eskir', 'nordic-w0-g': 'Hallvi', 'nordic-m0-g': 'Valdrik', 'nordic-w1-g': 'Isvane', 'nordic-m2-g': 'Hildar', 'nordic-m0-gw': 'Svenrik', 'nordic-w1-e': 'Nevra', 'nordic-m0-e': 'Felvir', 'nordic-w0-e': 'Silra', 'nordic-m2-e': 'Vindir' };
/** Dragon-people biographies: descriptive only, no gameplay bonuses. */
type DragonBio = { name: string; epithet: string; role: string; background: string; relations: { with: string; note: string }[]; skills: Skills };
const DRAGON_BIOS: Record<string, DragonBio> = {
  'dragon-m0': { name: 'Taro-Ka', epithet: 'Steinfaust', role: 'Krieger mit der Steinkeule', skills: skills(3,4,1,2,1),
    background: 'Schweigsam und stolz, er hütet die Terrassenfelder seiner Sippe. Wer den Hang heraufkommt, muss zuerst an ihm vorbei.',
    relations: [{ with: 'dragon-w0', note: 'Gefährte von Mei-Ra. Er wacht eifersüchtig über sie.' }, { with: 'dragon-m2', note: 'Folgt Gorun in jeden Kampf.' }] },
  'dragon-m1': { name: 'Bao', epithet: 'Bachspeer', role: 'Speerkämpfer und Fischer', skills: skills(4,2,2,3,1),
    background: 'Flink und gutgelaunt, er sticht Forellen aus den eisigen Bächen und prahlt gern damit. Fremden lächelt er zu, während seine Hand am Speer bleibt.',
    relations: [{ with: 'dragon-w1', note: 'Gefährte von Suli. Sie streiten oft und versöhnen sich laut.' }, { with: 'dragon-m3', note: 'Wettstreit mit Teng, wer die meisten Fische fängt.' }] },
  'dragon-m2': { name: 'Gorun', epithet: 'Felsaxt', role: 'Anführer der Terrassenwache', skills: skills(2,5,1,4,1),
    background: 'Breit und vernarbt, er hat die Drachenterrasse gegen Bären und Nordleute gehalten. Seine Axt ist älter als die meisten Hütten im Tal.',
    relations: [{ with: 'dragon-w2', note: 'Duldet Yuri und ihre Wölfe, aber nur knapp.' }] },
  'dragon-m3': { name: 'Teng', epithet: 'Nebelläufer', role: 'Speerkämpfer und Späher', skills: skills(3,2,2,4,1),
    background: 'Jung und rastlos, er klettert über die Grate, bevor der Nebel steigt. Er kennt jeden Pfad zwischen den Schieferhängen.',
    relations: [{ with: 'dragon-m1', note: 'Wettstreit mit Bao am Bach.' }, { with: 'dragon-w2', note: 'Bewundert Yuri heimlich.' }] },
  'dragon-w0': { name: 'Mei-Ra', epithet: 'Jadeblick', role: 'Sammlerin und Steinschleiferin', skills: skills(1,2,4,2,2),
    background: 'Ruhig und wachsam, sie schleift Jade zu kleinen Anhängern. Hinter ihrer Zurückhaltung steckt Neugier auf die Welt jenseits der Pässe.',
    relations: [{ with: 'dragon-m0', note: 'Gefährtin von Taro-Ka. Sie fühlt sich von ihm mehr bewacht als geliebt.' }] },
  'dragon-w1': { name: 'Suli', epithet: 'Rauchlied', role: 'Feuerhüterin und Kräutersammlerin', skills: skills(1,1,3,2,4),
    background: 'Laut lachend und schnell gereizt, sie singt beim Räuchern der Fische. Sie sagt jedem ins Gesicht, was sie denkt.',
    relations: [{ with: 'dragon-m1', note: 'Gefährtin von Bao. Sie streiten oft und versöhnen sich laut.' }] },
  'dragon-w2': { name: 'Yuri', epithet: 'das Wolfsmädchen', role: 'Wolfsjägerin', skills: skills(5,3,1,4,1),
    background: 'Wild, frei und an keinen Mann gebunden. Sie trägt das Fell des Wolfes, der sie als Kind fast tötete, und streift mit den Rudeln durch die Hochtäler. Im Dorf bleibt sie eine Fremde unter den eigenen Leuten.',
    relations: [{ with: 'dragon-m2', note: 'Gorun duldet sie nur knapp.' }, { with: 'dragon-m3', note: 'Teng bewundert sie heimlich, sie bemerkt es nicht.' }] },
};
export function getProfile(actorId: string): Profile | undefined {
  const detailed = PROFILES.find(p => p.id === PROFILE_IDS[actorId]);
  if (detailed) return detailed;
  const dragon = DRAGON_BIOS[actorId];
  if (dragon) return { id: actorId, ...dragon, origin: 'Drachenterrasse', strength: { label: 'Bergvolk', effect: 'Kennt die Pässe und Bäche der Drachenterrasse.' }, quirk: { label: 'Misstrauisch', effect: 'Begegnet Fremden aus dem Tal mit Vorsicht.' } };
  const name = OTHER_NAMES[actorId]; if (!name) return undefined;
  const origin = actorId.endsWith('-e') || actorId === 'nordic-m2' ? 'Eisfurt' : actorId.includes('-g') ? 'Gipfelwacht' : 'Frostheim';
  const guard = ['nordic-m2-g','nordic-m0-gw','nordic-m2-e'].includes(actorId);
  return { id: actorId, name, epithet: '', role: guard ? 'Dorfwache' : 'Dorfbewohner', origin, skills: skills(2,2,2,2,2), strength: { label: 'Heimatverbunden', effect: `Kennt die Umgebung von ${origin}.` }, quirk: { label: 'Zurückhaltend', effect: 'Begegnet Fremden vorsichtig.' }, background: `Gehört zur Gemeinschaft von ${origin}.`, relations: actorId === 'nordic-w0' ? [{ with: 'ilvar', note: 'Schwester von Ilvar.' }] : [] };
}
export function profileState(profile: Profile, saved?: ProfileState): ProfileState {
  return saved ? { trust: saved.trust, skills: { ...saved.skills } } : { trust: profile.origin === 'Deine Sippe' ? 100 : 0, skills: { ...profile.skills } };
}
export function trustLabel(value: number): string { return value <= 20 ? 'Feindlich' : value <= 50 ? 'Misstrauisch' : value <= 75 ? 'Geduldet' : 'Treu'; }
export function relationName(id: string): string { return PROFILES.find(p => p.id === id)?.name ?? DRAGON_BIOS[id]?.name ?? (id === 'tindra' ? 'Tindra' : id === 'couple' ? 'Partnerschaft' : id); }