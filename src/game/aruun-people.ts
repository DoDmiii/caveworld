/** Stable people, not textures: each reused look has an independent identity and home. */
export type AruunPerson = {
  id: string; look: string; name: string; epithet: string; role: string;
  village: 5 | 6 | 7; hut: 1 | 2 | 3; female: boolean; captive: boolean;
  dx: number; dy: number; partner?: string;
  skills: readonly [number, number, number, number, number];
  background: string; strength: string; weakness: string;
};
export const ARUUN_PEOPLE: readonly AruunPerson[] = [
  { id: 'aruun-m0', look: 'aruun-m0', name: 'Torrun', epithet: 'Altarwacht', role: 'Schamane und Ältester', village: 5, hut: 1, female: false, captive: true, dx: -45, dy: -35, partner: 'aruun-w0', skills: [1,3,2,4,5],
    background: 'Der Alte der Furt deutet Strömungen und bewahrt die dunklen Rituale von Rabenhain. Seine Axt liegt selbst bei Gebeten griffbereit.', strength: 'Bewahrt Glut und kennt die Riten am Schwarzsee.', weakness: 'Hält an alten Zeichen fest, auch wenn der Fluss sich verändert.' },
  { id: 'aruun-w0', look: 'aruun-w0', name: 'Ilaanu', epithet: 'Moorlicht', role: 'Kräuter- und Knochensammlerin', village: 5, hut: 1, female: true, captive: true, dx: -100, dy: 5, partner: 'aruun-m0', skills: [1,2,5,3,4],
    background: 'Sie sammelt Wurzeln im schwarzen Ufersaum und ordnet die Knochen der Opfer. Torruns Schweigen versteht sie besser als seine Worte.', strength: 'Erkennt Heilpflanzen zwischen den dunklen Wurzeln.', weakness: 'Wagt sich ungern weit vom vertrauten Seeufer fort.' },
  { id: 'aruun-m1', look: 'aruun-m1', name: 'Keluun', epithet: 'Hirschkrone', role: 'Ritualwächter', village: 5, hut: 2, female: false, captive: false, dx: 44, dy: 5, skills: [3,5,1,5,1],
    background: 'Bewacht den Opferaltar mit einer Steinaxt. Er spricht wenig, aber merkt sich jeden Fremden, der den Schädeln den Rücken kehrt.', strength: 'Wacht ausdauernd am Altar und an den Zugängen.', weakness: 'Nimmt harmlose Neugier schnell als Entweihung wahr.' },
  { id: 'aruun-m2', look: 'aruun-m3', name: 'Ollan', epithet: 'Totemschnitzer', role: 'Knochen- und Holzhandwerker', village: 5, hut: 3, female: false, captive: true, dx: -75, dy: 104, partner: 'aruun-w1', skills: [2,3,4,2,3],
    background: 'Schnitzt Totempfähle aus gefallenen Tannen und arbeitet mit Amuuri an Schmuck für die Riten. Bei Gefahr greift er zu seiner Axt.', strength: 'Verbindet Holz und Knochen zu dauerhaften Kultstücken.', weakness: 'Vergisst beim Schnitzen, was um ihn herum geschieht.' },
  { id: 'aruun-w1', look: 'aruun-w1', name: 'Amuuri', epithet: 'Knochenweberin', role: 'Schmuck- und Kettensammlerin', village: 5, hut: 3, female: true, captive: true, dx: 74, dy: 104, partner: 'aruun-m2', skills: [1,2,4,3,3],
    background: 'Flicht Knochen, Federn und dunkle Fasern zu Ketten. Sie lebt mit Ollan, dessen schwere Holzarbeit ihre feinen Schmuckstücke trägt.', strength: 'Flicht feste Fasern und fertigt feinen Knochenschmuck.', weakness: 'Misstraut Fremden, die ihre Arbeit berühren.' },
  { id: 'aruun-m0-n', look: 'aruun-m4', name: 'Daruun', epithet: 'Fischspeer', role: 'Meister-Harpunier', village: 6, hut: 1, female: false, captive: true, dx: -110, dy: 8, partner: 'aruun-w0-n', skills: [5,3,2,4,1],
    background: 'Kennt die flachen Stellen des Nebelsees und wartet reglos mit dem Speer. Maelu bringt ihm Nachrichten aus dem Wasser, die kein Uferwächter hört.', strength: 'Liest die Strömung und führt den Fischspeer sicher.', weakness: 'Vertraut dem See mehr als den Menschen am Ufer.' },
  { id: 'aruun-w0-n', look: 'aruun-w2', name: 'Maelu', epithet: 'Tiefwasser', role: 'Muschel- und Obsidiantaucherin', village: 6, hut: 1, female: true, captive: true, dx: -68, dy: 36, partner: 'aruun-m0-n', skills: [2,3,5,2,1],
    background: 'Sucht Muscheln und dunkle Steine im flachen Wasser. Nach jedem Tauchgang legt Daruun ihr trockene Fasern am Feuer bereit.', strength: 'Findet brauchbare Muscheln und Steine am Seegrund.', weakness: 'Unterschätzt kalte Strömungen, wenn sie etwas entdeckt.' },
  { id: 'aruun-m1-n', look: 'aruun-m5', name: 'Lorrec', epithet: 'Flusswacht', role: 'Ufer- und Stegwächter', village: 6, hut: 2, female: false, captive: false, dx: 72, dy: 10, skills: [3,4,1,5,1],
    background: 'Hält den Speer quer, wenn sich jemand den Fischern nähert. Er prüft jeden Pfad von der Lichtung zum Nebelsee.', strength: 'Bemerkt Bewegung auf den Uferpfaden früh.', weakness: 'Hält an seinem Posten fest und reagiert auf Umwege spät.' },
  { id: 'aruun-m2-n', look: 'aruun-m2', name: 'Tamaan', epithet: 'Reusenleger', role: 'Fischer und Reusenbauer', village: 6, hut: 3, female: false, captive: true, dx: -72, dy: 106, partner: 'aruun-w1-n', skills: [4,3,4,2,1],
    background: 'Baut Reusen aus jungen Tannenzweigen und setzt sie mit Teluus Netzen ein. Seine Axt dient Holzarbeit und Verteidigung zugleich.', strength: 'Kennt die Stellen, an denen Fische im Schilf stehen.', weakness: 'Zögert, seine Reusen bei Gefahr zurückzulassen.' },
  { id: 'aruun-w1-n', look: 'aruun-w0', name: 'Teluu', epithet: 'Schilfgesang', role: 'Netzflechterin', village: 6, hut: 3, female: true, captive: true, dx: 65, dy: 102, partner: 'aruun-m2-n', skills: [1,2,5,2,3],
    background: 'Summt leise beim Flechten und flickt Tamaans Netze, bevor die Sonne den Nebel hebt. Jede Masche hat für sie ihren eigenen Rhythmus.', strength: 'Flicht und flickt Netze mit geduldigen Händen.', weakness: 'Scheut Streit und lässt andere oft für sich sprechen.' },
  { id: 'aruun-m0-k', look: 'aruun-m0', name: 'Haluun', epithet: 'Totenwacht', role: 'Grenzkrieger', village: 7, hut: 1, female: false, captive: true, dx: -66, dy: 13, partner: 'aruun-w0-k', skills: [3,5,1,4,1],
    background: 'Bewacht Knochenufer gegen Eindringlinge aus dem Wald. Neerus Seile halten seine Palisaden und die Gefangenen des Dorfes.', strength: 'Hält die Grenze auch bei Dunkelheit und Regen.', weakness: 'Wertet Rückzug als Schande und bleibt zu lange stehen.' },
  { id: 'aruun-w0-k', look: 'aruun-w1', name: 'Neeru', epithet: 'Schilfhand', role: 'Seilerin und Fesselmacherin', village: 7, hut: 1, female: true, captive: true, dx: -107, dy: 42, partner: 'aruun-m0-k', skills: [1,2,5,3,2],
    background: 'Verarbeitet Brennnesseln und Schilf zu reißfesten Stricken. Ohne Haluuns Begleitung verlässt sie den geschützten Dorfplatz nur ungern.', strength: 'Flicht belastbare Stricke aus Uferpflanzen.', weakness: 'Fürchtet wilde Tiere und sucht bei Gefahr Schutz.' },
  { id: 'aruun-m1-k', look: 'aruun-m1', name: 'Sevaan', epithet: 'Knochenbrecher', role: 'Palisadenbauer und Dorfwache', village: 7, hut: 2, female: false, captive: false, dx: 60, dy: 115, skills: [2,5,3,4,1],
    background: 'Hält die Pfähle am Südtor scharf und die Schädel fest verschnürt. Seine Axt schlägt Holz und schreckt unerwünschte Besucher ab.', strength: 'Kennt jede Schwachstelle der Palisaden.', weakness: 'Reizbar, wenn jemand seine Befestigung bemängelt.' },
  { id: 'aruun-m2-k', look: 'aruun-m4', name: 'Idrun', epithet: 'Schattenläufer', role: 'Späher und Speerträger', village: 7, hut: 3, female: false, captive: true, dx: 104, dy: 26, partner: 'aruun-w1-k', skills: [4,2,2,5,1],
    background: 'Liest Spuren unter den Tannen und kehrt mit Nachrichten zum Knochensee zurück. Ruvaa versorgt die Schrammen, über die er nie spricht.', strength: 'Bewegt sich aufmerksam zwischen den dunklen Stämmen.', weakness: 'Geht zu oft allein voraus und verschweigt Verletzungen.' },
  { id: 'aruun-w1-k', look: 'aruun-w2', name: 'Ruvaa', epithet: 'Fichtenharz', role: 'Wundheilerin', village: 7, hut: 3, female: true, captive: true, dx: -61, dy: 103, partner: 'aruun-m2-k', skills: [1,2,4,3,5],
    background: 'Sammelt Harz und Heilwurzeln für die Grenzkrieger. Sie kennt Idruns Ausreden und legt ihm trotzdem frische Wickel zurecht.', strength: 'Kennt Harze und Kräuter zur Wundversorgung.', weakness: 'Sorgt sich um andere, bis sie ihre eigene Ruhe vergisst.' },
];
const villageName = (v: AruunPerson['village']) => ({ 5: 'Rabenhain', 6: 'Nebelwacht', 7: 'Knochenufer' }[v]);
export const aruunOrigin = (p: AruunPerson) => villageName(p.village);
export const ARUUN_RESIDENT_HUTS: Record<string, string> = Object.fromEntries(ARUUN_PEOPLE.map(p => [p.id, `${villageName(p.village)}:${p.hut}`]));
export const ARUUN_COUPLES: Record<string, string> = Object.fromEntries(ARUUN_PEOPLE.flatMap(p => p.female && p.partner ? [[p.id, p.partner]] : []));
export const ARUUN_ADULT_WOMEN = ARUUN_PEOPLE.filter(p => p.female).map(p => p.id);