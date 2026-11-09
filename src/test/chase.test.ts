import { describe, it, expect } from "vitest";
import {
  EMPTY_CARRIERS,
  startCarriers,
  stepCarriers,
  isCarrier,
  pruneCarriers,
  MAX_CARRIERS,
  CARRIER_SPEED,
  LOSE_DISTANCE,
  LOSE_SECONDS,
  type CarrierSeed,
  type CarrierView,
} from "@/game/chase";

const seed = (id: string, o: Partial<CarrierSeed> = {}): CarrierSeed => ({
  id,
  village: "frostheim",
  homeX: 1000,
  homeY: 0,
  homeR: 100,
  ...o,
});
const view = (x: number, o: Partial<CarrierView> = {}): CarrierView => ({
  id: "a",
  x,
  y: 0,
  alive: true,
  free: true,
  child: false,
  ...o,
});
const views = (v: CarrierView) => new Map([[v.id, v]]);
const start = () => startCarriers(EMPTY_CARRIERS, [seed("a")], "kill", 600);

describe("Verfolgung", () => {
  it("Zeuge rennt zum Heimatdorf, schneller als man geht", () => {
    const r = stepCarriers(start(), views(view(0)), { x: -50, y: 0 }, 0.1);
    expect(r.steps[0]!.vx).toBeGreaterThan(65);
    expect(r.steps[0]!.vx).toBeLessThanOrEqual(CARRIER_SPEED + 0.001);
  });
  it("erreicht das Dorf: entkommen", () => {
    const r = stepCarriers(start(), views(view(950)), { x: 0, y: 0 }, 0.1);
    expect(r.escaped.map((c) => c.id)).toEqual(["a"]);
    expect(r.state.carriers[0]!.status).toBe("escaped");
  });
  it("tot, niedergeschlagen oder gefangen: zum Schweigen gebracht", () => {
    for (const o of [{ alive: false }, { free: false }]) {
      const r = stepCarriers(start(), views(view(300, o)), { x: 280, y: 0 }, 0.1);
      expect(r.silenced.map((c) => c.id)).toEqual(["a"]);
      expect(r.escaped).toEqual([]);
    }
  });
  it("lange genug weit weg: ebenfalls entkommen", () => {
    let s = start(),
      out = false;
    for (let t = 0; t < LOSE_SECONDS * 10 + 5; t++) {
      const r = stepCarriers(s, views(view(300)), { x: 300 - LOSE_DISTANCE - 10, y: 0 }, 0.1);
      s = r.state;
      if (r.escaped.length) out = true;
    }
    expect(out).toBe(true);
  });
  it("wer in Sichtweite bleibt, verliert den Verfolger nicht", () => {
    let s = start();
    for (let t = 0; t < 200; t++)
      s = stepCarriers(s, views(view(300)), { x: 250, y: 0 }, 0.1).state;
    expect(s.carriers[0]!.status).toBe("fleeing");
  });
  it("Spieler zwischen Zeuge und Dorf: er weicht aus statt direkt zu laufen", () => {
    const r = stepCarriers(start(), views(view(0)), { x: 60, y: 0 }, 0.1);
    expect(Math.abs(r.steps[0]!.vx)).toBeLessThan(CARRIER_SPEED);
  });
  it("Kinder sind langsamer", () => {
    const r = stepCarriers(start(), views(view(0, { child: true })), { x: -400, y: 0 }, 0.1);
    expect(r.steps[0]!.vx).toBeLessThan(CARRIER_SPEED);
  });
  it("doppelt gemeldete Zeugen und Obergrenze", () => {
    const s = startCarriers(start(), [seed("a")], "kill", 600);
    expect(s.carriers).toHaveLength(1);
    const many = startCarriers(
      EMPTY_CARRIERS,
      Array.from({ length: 30 }, (_, i) => seed(`w${i}`)),
      "kill",
      600,
    );
    expect(many.carriers).toHaveLength(MAX_CARRIERS);
  });
  it("isCarrier und prune", () => {
    const s = start();
    expect(isCarrier(s, "a")).toBe(true);
    const done = stepCarriers(s, views(view(950)), { x: 0, y: 0 }, 0.1).state;
    expect(isCarrier(done, "a")).toBe(false);
    expect(pruneCarriers(done).carriers).toEqual([]);
  });
});
