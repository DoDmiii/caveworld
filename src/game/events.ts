// Engine-freies Ereignis- und Zeugensystem.
// Taten werden nicht mehr direkt an Furcht/Beziehung gemeldet, sondern als Ereignis beschrieben.
// Wer sie sieht oder hört, entscheidet, was daraus folgt. world.ts sammelt nur die Beobachter
// und wendet die Ergebnisse an; alle Regeln stehen hier.
import type { FearEvent } from "./fear";
import { FEAR_GAIN } from "./fear";

export type DeedKind =
  "attack" | "kill" | "finisher" | "steal" | "capture" | "execution" | "champion";

export type Deed = {
  kind: DeedKind;
  actorId: string;
  /** Dorf-Schlüssel (villageKey) der Gemeinschaft, die geschädigt wurde. */
  victimVillage?: string;
  x: number;
  y: number;
  /** Spielminuten seit Beginn (wie world.clock). */
  clock: number;
  night: boolean;
  crouching: boolean;
};

export type Observer = {
  id: string;
  x: number;
  y: number;
  village: string;
  role: "villager" | "guard" | "hunter" | "leader" | "child";
  asleep?: boolean;
  bound?: boolean;
};

// ---------- Wahrnehmung ----------
export const SIGHT_DAY = 260;
export const SIGHT_NIGHT = 110;
/** Geduckt wird man schwerer entdeckt. */
export const CROUCH_SIGHT = 0.6;
/** Wie weit eine Tat zu hören ist, auch ohne Sichtkontakt. */
export const NOISE: Record<DeedKind, number> = {
  attack: 160,
  kill: 120,
  finisher: 150,
  steal: 40,
  capture: 90,
  execution: 180,
  champion: 320,
};
/** Schlafende nehmen nur Lärm in diesem Anteil der Reichweite wahr. */
export const ASLEEP_HEARING = 0.4;

export const sightRange = (deed: Pick<Deed, "night" | "crouching">) =>
  (deed.night ? SIGHT_NIGHT : SIGHT_DAY) * (deed.crouching ? CROUCH_SIGHT : 1);

/** Optional: true, wenn Gelände oder Gebäude die Sicht zwischen zwei Punkten blockieren. */
export type Blocker = (ax: number, ay: number, bx: number, by: number) => boolean;

export type Witnesses = { saw: Observer[]; heard: Observer[] };

export function witnessesOf(
  deed: Deed,
  observers: readonly Observer[],
  blocked?: Blocker,
): Witnesses {
  const saw: Observer[] = [],
    heard: Observer[] = [];
  const sight = sightRange(deed);
  for (const o of observers) {
    if (o.bound) continue;
    const d = Math.hypot(o.x - deed.x, o.y - deed.y);
    const canSee = !o.asleep && d <= sight && !blocked?.(o.x, o.y, deed.x, deed.y);
    if (canSee) {
      saw.push(o);
      continue;
    }
    const noise = NOISE[deed.kind] * (o.asleep ? ASLEEP_HEARING : 1);
    if (d <= noise) heard.push(o);
  }
  return { saw, heard };
}

// ---------- Folgen ----------
const FEAR_OF: Record<DeedKind, FearEvent | null> = {
  attack: null,
  kill: "kill",
  finisher: "finisher",
  steal: null,
  capture: null,
  execution: "execution",
  champion: "champion",
};
export const REL_DELTA: Record<DeedKind, number> = {
  attack: -35,
  kill: -20,
  finisher: -35,
  steal: -25,
  capture: -40,
  execution: -45,
  champion: -30,
};
/** Wer die Tat nur hört, kennt den Täter nicht: nur Misstrauen, keine Furcht vor dem Spieler. */
export const HEARD_REL_DELTA = -5;

export type VillageOutcome = {
  village: string;
  fear: FearEvent | null;
  relationship: number;
  alarm: boolean;
  /** Dieser Beobachter kennt den Täter. */
  identified: boolean;
};

export type DeedOutcome = {
  /** Folgen je Dorf, sofort anzuwenden. */
  villages: VillageOutcome[];
  /** Zeugen, die die Nachricht weitertragen, wenn sie überleben und fliehen können. */
  carriers: string[];
  /** Niemand hat die Tat gesehen: nur eine gefundene Leiche kann sie noch verraten. */
  unwitnessed: boolean;
};

export function resolveDeed(deed: Deed, w: Witnesses): DeedOutcome {
  const byVillage = new Map<string, VillageOutcome>();
  const outcome = (v: string) => {
    let o = byVillage.get(v);
    if (!o) {
      o = { village: v, fear: null, relationship: 0, alarm: false, identified: false };
      byVillage.set(v, o);
    }
    return o;
  };
  for (const o of w.saw) {
    const r = outcome(o.village);
    r.identified = true;
    r.alarm = r.alarm || o.role !== "child";
    // Sehen nur die eigenen Leute die Tat, zählt sie voll. Fremde Zeugen bewerten nur halb.
    const own = deed.victimVillage === undefined || deed.victimVillage === o.village;
    r.relationship = Math.min(r.relationship, Math.round(REL_DELTA[deed.kind] * (own ? 1 : 0.5)));
    if (own) r.fear = FEAR_OF[deed.kind];
  }
  for (const o of w.heard) {
    const r = outcome(o.village);
    if (r.identified) continue;
    r.alarm = r.alarm || o.role !== "child";
    r.relationship = Math.min(r.relationship, HEARD_REL_DELTA);
  }
  return {
    villages: [...byVillage.values()],
    carriers: w.saw.map((o) => o.id),
    unwitnessed: w.saw.length === 0,
  };
}

/** Wird eine Leiche ohne Zeugen gefunden, kennt niemand den Täter: Alarm und leichtes Misstrauen. */
export function bodyFoundOutcome(village: string): VillageOutcome {
  return { village, fear: null, relationship: HEARD_REL_DELTA, alarm: true, identified: false };
}

// ---------- Gerüchte ----------
export type Rumor = {
  id: string;
  kind: DeedKind;
  origin: string;
  bornAt: number;
  reached: string[];
};
export type RumorState = { rumors: Rumor[] };
export const EMPTY_RUMORS: RumorState = { rumors: [] };
/** So viele Spielminuten braucht ein Gerücht bis zum nächsten Dorf. */
export const RUMOR_DELAY = 240;
export const MAX_RUMORS = 30;
/** Gerüchte wirken nur zu diesem Anteil wie eine selbst gesehene Tat. */
export const RUMOR_STRENGTH = 0.5;

/** Ein Überbringer kam davon: das Gerücht entsteht. Stirbt er vorher, ruft der Aufrufer das hier nicht auf. */
export function startRumor(s: RumorState, deed: Deed, origin: string): RumorState {
  const id = `${deed.kind}:${origin}:${Math.round(deed.clock)}`;
  if (s.rumors.some((r) => r.id === id)) return s;
  return {
    rumors: [
      ...s.rumors,
      { id, kind: deed.kind, origin, bornAt: deed.clock, reached: [origin] },
    ].slice(-MAX_RUMORS),
  };
}

export type RumorArrival = { village: string; kind: DeedKind; fear: number; relationship: number };

/** Verbreitet Gerüchte um einen Schritt weiter. neighbours: Dorf -> erreichbare Dörfer. */
export function spreadRumors(
  s: RumorState,
  clock: number,
  neighbours: Record<string, readonly string[]>,
): { state: RumorState; arrivals: RumorArrival[] } {
  const arrivals: RumorArrival[] = [];
  const rumors = s.rumors.map((r) => {
    const age = clock - r.bornAt;
    const hops = Math.floor(age / RUMOR_DELAY);
    if (hops < r.reached.length) return r;
    const next = r.reached
      .flatMap((v) => neighbours[v] ?? [])
      .filter((v, i, a) => !r.reached.includes(v) && a.indexOf(v) === i);
    for (const village of next) {
      const gain = FEAR_OF[r.kind] ? Math.round(FEAR_GAIN[FEAR_OF[r.kind]!] * RUMOR_STRENGTH) : 0;
      arrivals.push({
        village,
        kind: r.kind,
        fear: gain,
        relationship: Math.round(REL_DELTA[r.kind] * RUMOR_STRENGTH * 0.5),
      });
    }
    return { ...r, reached: [...r.reached, ...next] };
  });
  return { state: { rumors }, arrivals };
}
