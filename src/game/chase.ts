// Engine-freie Zeugen-Verfolgung: Wer eine Tat gesehen hat, rennt los, um sie zu melden.
// Wird er vorher erschlagen, niedergeschlagen oder gefangen, bleibt die Tat geheim.
// Entkommt er, entsteht ein Gerücht (siehe events.ts).
import type { DeedKind } from "./events";

export type CarrierStatus = "fleeing" | "escaped" | "silenced";

export type Carrier = {
  id: string;
  village: string;
  kind: DeedKind;
  /** Spielminute der Tat; bestimmt die Gerüchte-ID. */
  deedClock: number;
  status: CarrierStatus;
  /** Sekunden, die der Zeuge schon außer Sichtweite des Spielers rennt. */
  lostFor: number;
  /** Fluchtziel: die Mitte des Heimatdorfes. */
  homeX: number;
  homeY: number;
  homeR: number;
};

export type CarrierState = { carriers: Carrier[] };
export const EMPTY_CARRIERS: CarrierState = { carriers: [] };

/** Erwachsene rennen schneller als der Spieler geht (65), aber langsamer als er rennt (105). */
export const CARRIER_SPEED = 85;
export const CHILD_CARRIER_SPEED = 68;
/** Weiter als das und lange genug aus den Augen: der Zeuge ist entkommen. */
export const LOSE_DISTANCE = 520;
export const LOSE_SECONDS = 6;
/** Erreicht er diesen Anteil des Dorfradius, ist er in Sicherheit. */
export const HOME_REACH = 0.8;
/** Gleichzeitig fliehende Zeugen werden begrenzt, damit die Szene nicht überläuft. */
export const MAX_CARRIERS = 12;

export type CarrierSeed = {
  id: string;
  village: string;
  homeX: number;
  homeY: number;
  homeR: number;
};

export function startCarriers(
  s: CarrierState,
  seeds: readonly CarrierSeed[],
  kind: DeedKind,
  deedClock: number,
): CarrierState {
  const have = new Set(s.carriers.filter((c) => c.status === "fleeing").map((c) => c.id));
  const fresh: Carrier[] = seeds
    .filter((x) => !have.has(x.id))
    .map((x) => ({ ...x, kind, deedClock, status: "fleeing" as const, lostFor: 0 }));
  const fleeing = s.carriers.filter((c) => c.status === "fleeing");
  const room = Math.max(0, MAX_CARRIERS - fleeing.length);
  return { carriers: [...fleeing, ...fresh.slice(0, room)] };
}

export type CarrierView = {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  free: boolean;
  child: boolean;
};
export type CarrierStep = { id: string; vx: number; vy: number };

/**
 * Ein Zeitschritt. views: aktuelle Lage jedes Zeugen, player: Position des Spielers.
 * Gibt neue Zustände, Fluchtgeschwindigkeiten und die gerade Entkommenen/Zum-Schweigen-Gebrachten zurück.
 */
export function stepCarriers(
  s: CarrierState,
  views: ReadonlyMap<string, CarrierView>,
  player: { x: number; y: number },
  dt: number,
): { state: CarrierState; steps: CarrierStep[]; escaped: Carrier[]; silenced: Carrier[] } {
  const steps: CarrierStep[] = [],
    escaped: Carrier[] = [],
    silenced: Carrier[] = [];
  const carriers = s.carriers.map((c) => {
    if (c.status !== "fleeing") return c;
    const v = views.get(c.id);
    if (!v || !v.alive || !v.free) {
      const n = { ...c, status: "silenced" as const };
      silenced.push(n);
      return n;
    }
    const toHome = Math.hypot(c.homeX - v.x, c.homeY - v.y);
    if (toHome <= c.homeR * HOME_REACH) {
      const n = { ...c, status: "escaped" as const };
      escaped.push(n);
      return n;
    }
    const away = Math.hypot(v.x - player.x, v.y - player.y);
    const lostFor = away > LOSE_DISTANCE ? c.lostFor + dt : 0;
    if (lostFor >= LOSE_SECONDS) {
      const n = { ...c, status: "escaped" as const, lostFor };
      escaped.push(n);
      return n;
    }
    // Läuft zum Heimatdorf. Steht der Spieler nah, weicht er seitlich und vom Spieler weg aus.
    const hx = (c.homeX - v.x) / Math.max(1, toHome),
      hy = (c.homeY - v.y) / Math.max(1, toHome);
    let dx = hx,
      dy = hy;
    if (away < 140) {
      const ax = (v.x - player.x) / Math.max(1, away),
        ay = (v.y - player.y) / Math.max(1, away);
      const left = hx * (player.y - v.y) - hy * (player.x - v.x) >= 0;
      const px = left ? hy : -hy,
        py = left ? -hx : hx;
      dx += ax * 0.8 + px * 0.8;
      dy += ay * 0.8 + py * 0.8;
    }
    const l = Math.max(0.001, Math.hypot(dx, dy)),
      sp = v.child ? CHILD_CARRIER_SPEED : CARRIER_SPEED;
    steps.push({ id: c.id, vx: (dx / l) * sp, vy: (dy / l) * sp });
    return { ...c, lostFor };
  });
  return { state: { carriers }, steps, escaped, silenced };
}

export const isCarrier = (s: CarrierState, id: string) =>
  s.carriers.some((c) => c.id === id && c.status === "fleeing");
/** Erledigte Einträge aufräumen, nachdem sie ausgewertet wurden. */
export const pruneCarriers = (s: CarrierState): CarrierState => ({
  carriers: s.carriers.filter((c) => c.status === "fleeing"),
});
