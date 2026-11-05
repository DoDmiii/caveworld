import { describe, it, expect } from "vitest";
import {
  witnessesOf,
  resolveDeed,
  bodyFoundOutcome,
  startRumor,
  spreadRumors,
  sightRange,
  EMPTY_RUMORS,
  SIGHT_DAY,
  SIGHT_NIGHT,
  type Deed,
  type Observer,
} from "@/game/events";

const deed = (o: Partial<Deed> = {}): Deed => ({
  kind: "kill",
  actorId: "player",
  victimVillage: "frostheim",
  x: 0,
  y: 0,
  clock: 600,
  night: false,
  crouching: false,
  ...o,
});
const obs = (id: string, x: number, o: Partial<Observer> = {}): Observer => ({
  id,
  x,
  y: 0,
  village: "frostheim",
  role: "villager",
  ...o,
});

describe("Zeugen", () => {
  it("sieht bei Tag weiter als in der Nacht, geduckt weniger", () => {
    expect(sightRange(deed())).toBe(SIGHT_DAY);
    expect(sightRange(deed({ night: true }))).toBe(SIGHT_NIGHT);
    expect(sightRange(deed({ crouching: true }))).toBeLessThan(SIGHT_DAY);
  });
  it("sieht nahe Beobachter, nicht ferne", () => {
    const w = witnessesOf(deed(), [obs("a", 100), obs("b", 2000)]);
    expect(w.saw.map((o) => o.id)).toEqual(["a"]);
    expect(w.heard).toEqual([]);
  });
  it("Sichtblocker verwandeln Sehen in Hören", () => {
    const w = witnessesOf(deed(), [obs("a", 100)], () => true);
    expect(w.saw).toEqual([]);
    expect(w.heard.map((o) => o.id)).toEqual(["a"]);
  });
  it("Schlafende sehen nichts und hören nur nah", () => {
    const w = witnessesOf(deed(), [
      obs("a", 40, { asleep: true }),
      obs("b", 110, { asleep: true }),
    ]);
    expect(w.saw).toEqual([]);
    expect(w.heard.map((o) => o.id)).toEqual(["a"]);
  });
  it("Gefesselte zählen nicht", () => {
    expect(witnessesOf(deed(), [obs("a", 10, { bound: true })])).toEqual({ saw: [], heard: [] });
  });
});

describe("Folgen", () => {
  it("Mord ohne Zeugen hat keine sofortigen Folgen", () => {
    const r = resolveDeed(deed(), witnessesOf(deed(), []));
    expect(r.unwitnessed).toBe(true);
    expect(r.villages).toEqual([]);
    expect(r.carriers).toEqual([]);
  });
  it("gesehener Mord: Furcht, Beziehung, Alarm und Überbringer", () => {
    const d = deed();
    const r = resolveDeed(d, witnessesOf(d, [obs("a", 100)]));
    expect(r.villages[0]).toMatchObject({
      village: "frostheim",
      fear: "kill",
      alarm: true,
      identified: true,
    });
    expect(r.villages[0]!.relationship).toBeLessThan(0);
    expect(r.carriers).toEqual(["a"]);
  });
  it("nur gehört: Alarm und Misstrauen, aber keine Furcht und kein Täter", () => {
    const d = deed();
    const r = resolveDeed(
      d,
      witnessesOf(d, [obs("a", 100)], () => true),
    );
    expect(r.villages[0]).toMatchObject({ fear: null, alarm: true, identified: false });
    expect(r.unwitnessed).toBe(true);
  });
  it("Kinder sehen und tragen weiter, schlagen aber keinen Alarm", () => {
    const d = deed();
    const r = resolveDeed(d, witnessesOf(d, [obs("k", 100, { role: "child" })]));
    expect(r.villages[0]!.alarm).toBe(false);
    expect(r.carriers).toEqual(["k"]);
  });
  it("fremde Zeugen bewerten eine Tat nur halb und fürchten sich nicht", () => {
    const d = deed();
    const own = resolveDeed(d, witnessesOf(d, [obs("a", 100)])).villages[0]!;
    const foreign = resolveDeed(d, witnessesOf(d, [obs("b", 100, { village: "eisfurt" })]))
      .villages[0]!;
    expect(foreign.fear).toBeNull();
    expect(Math.abs(foreign.relationship)).toBeLessThan(Math.abs(own.relationship));
  });
  it("gefundene Leiche löst anonymen Alarm aus", () => {
    expect(bodyFoundOutcome("frostheim")).toMatchObject({
      alarm: true,
      identified: false,
      fear: null,
    });
  });
});

describe("Gerüchte", () => {
  const map = {
    frostheim: ["gipfelwacht"],
    gipfelwacht: ["frostheim", "eisfurt"],
    eisfurt: ["gipfelwacht"],
  };
  it("erreicht das nächste Dorf erst nach der Verzögerung, dann das übernächste", () => {
    const s = startRumor(EMPTY_RUMORS, deed(), "frostheim");
    expect(spreadRumors(s, 700, map).arrivals).toEqual([]);
    const a = spreadRumors(s, 600 + 240, map);
    expect(a.arrivals.map((x) => x.village)).toEqual(["gipfelwacht"]);
    expect(a.arrivals[0]!.fear).toBeGreaterThan(0);
    const b = spreadRumors(a.state, 600 + 480, map);
    expect(b.arrivals.map((x) => x.village)).toEqual(["eisfurt"]);
    expect(spreadRumors(b.state, 600 + 960, map).arrivals).toEqual([]);
  });
  it("dasselbe Gerücht entsteht nicht doppelt", () => {
    const s = startRumor(EMPTY_RUMORS, deed(), "frostheim");
    expect(startRumor(s, deed(), "frostheim").rumors).toHaveLength(1);
  });
});
