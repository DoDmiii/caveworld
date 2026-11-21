import { describe, it, expect } from "vitest";
import {
  LORE,
  TRIBE_IDS,
  EMPTY_LORE,
  knowledgeOf,
  recordLore,
  entryView,
  tribeOfVillage,
  unlockHint,
  CONTACTS_FOR_FULL,
} from "@/game/lore";

describe("Notizbuch", () => {
  it("jeder Stamm hat Abschnitte auf jeder Stufe und Fakten", () => {
    for (const id of TRIBE_IDS) {
      const t = LORE[id];
      expect(t.sections.map((s) => s.level)).toContain(1);
      expect(t.sections.map((s) => s.level)).toContain(3);
      expect(t.facts.length).toBeGreaterThan(2);
      for (const s of t.sections) expect(s.text.length).toBeGreaterThan(40);
    }
  });
  it("die Wenja sind immer vollständig bekannt", () => {
    expect(knowledgeOf(EMPTY_LORE, "wenja")).toBe(3);
    expect(entryView(EMPTY_LORE, "wenja").hidden).toBe(0);
  });
  it("Fremde Völker beginnen bei null und zeigen nur das Gerücht", () => {
    expect(knowledgeOf(EMPTY_LORE, "nordics")).toBe(0);
    const v = entryView(EMPTY_LORE, "dragon");
    expect(v.sections).toEqual([]);
    expect(v.hidden).toBe(LORE.dragon.sections.length);
    expect(LORE.dragon.rumor.length).toBeGreaterThan(10);
  });
  it("sehen, Kontakt und viele Kontakte schalten Stufen frei", () => {
    let s = recordLore(EMPTY_LORE, "nordics", "met");
    expect([s.before, s.after]).toEqual([0, 1]);
    s = recordLore(s.state, "nordics", "contact");
    expect([s.before, s.after]).toEqual([1, 2]);
    for (let i = 1; i < CONTACTS_FOR_FULL; i++) s = recordLore(s.state, "nordics", "contact");
    expect(s.after).toBe(3);
  });
  it("Kontakt zählt auch als gesehen", () => {
    expect(recordLore(EMPTY_LORE, "dragon", "contact").after).toBe(2);
  });
  it("ein gefallener Champion macht ein Volk sofort gut bekannt", () => {
    expect(recordLore(EMPTY_LORE, "nordics", "champion").after).toBe(3);
  });
  it("wiederholtes Sehen ändert die Stufe nicht", () => {
    const a = recordLore(EMPTY_LORE, "nordics", "met"),
      b = recordLore(a.state, "nordics", "met");
    expect(b.before).toBe(b.after);
  });
  it("Stufe 2 zeigt mehr Abschnitte als Stufe 1", () => {
    const s1 = recordLore(EMPTY_LORE, "dragon", "met").state,
      s2 = recordLore(s1, "dragon", "contact").state;
    expect(entryView(s2, "dragon").sections.length).toBeGreaterThan(
      entryView(s1, "dragon").sections.length,
    );
  });
  it("Dorf zu Volk und Hinweise", () => {
    expect(tribeOfVillage(0)).toBe("nordics");
    expect(tribeOfVillage(2)).toBe("nordics");
    expect(tribeOfVillage(3)).toBe("dragon");
    expect(tribeOfVillage(4)).toBe("oshkora");
    expect(unlockHint(0)).not.toBe("");
    expect(unlockHint(3)).toBe("");
  });
  it("Drachenmenschen: Speerkunst, Klettern, Wolfspelz nur Kriegerinnen, Drache, Feste", () => {
    const all =
      LORE.dragon.sections.map((s) => s.text).join(" ") +
      LORE.dragon.facts.map((f) => f.value).join(" ");
    for (const w of ["Speer", "kletter", "Wolfsfell", "Drachen", "Feste"])
      expect(all.toLowerCase()).toContain(w.toLowerCase());
  });
  it("vier Völker, Oshkora fremd und zunächst unbekannt", () => {
    expect(TRIBE_IDS).toEqual(["wenja", "nordics", "dragon", "oshkora"]);
    expect(knowledgeOf(EMPTY_LORE, "oshkora")).toBe(0);
    expect(entryView(EMPTY_LORE, "oshkora").sections).toEqual([]);
  });
  it("Oshkora: schalten sich über Begegnung, Kontakt und viele Kontakte frei", () => {
    let s = recordLore(EMPTY_LORE, "oshkora", "met");
    expect([s.before, s.after]).toEqual([0, 1]);
    s = recordLore(s.state, "oshkora", "contact");
    expect(s.after).toBe(2);
    for (let i = 1; i < CONTACTS_FOR_FULL; i++) s = recordLore(s.state, "oshkora", "contact");
    expect(s.after).toBe(3);
    const view = entryView(s.state, "oshkora");
    expect(view.hidden).toBe(0);
    expect(view.sections.length).toBe(LORE.oshkora.sections.length);
  });
  it("Oshkora: Inhalte aus der Vorlage (Ziegen, Ocker, Meute, Gastrecht, Ahnenschädel, wenige Kriegerinnen)", () => {
    const all = LORE.oshkora.sections
      .map((s) => `${s.title} ${s.text}`)
      .join(" ")
      .toLowerCase();
    for (const w of [
      "ziegen",
      "ocker",
      "meute",
      "gastrecht",
      "schädel",
      "dünn gebaut",
      "dunkelbraun",
      "kriegerinnen",
      "selten",
    ]) {
      expect(all).toContain(w);
    }
  });
});
