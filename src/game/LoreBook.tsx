import { useState } from "react";
import { BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRIBE_IDS, LORE, entryView, unlockHint, type LoreState, type TribeId } from "./lore";

const STAGE = ["Nur ein Gerücht", "Gesehen", "Kontakt gehabt", "Gut bekannt"] as const;

/** Notizbuch: ein Reiter pro Volk, Seiten schalten sich durch Begegnungen frei. */
export function LoreBook({ lore, onClose }: { lore: LoreState; onClose: () => void }) {
  const [tribe, setTribe] = useState<TribeId>("wenja");
  const view = entryView(lore, tribe);
  const t = view.tribe;
  return (
    <>
      <h2 className="lore-title">
        <BookOpen size={20} /> Notizbuch
      </h2>
      <div className="lore-tabs" role="tablist" aria-label="Völker">
        {TRIBE_IDS.map((id) => {
          const known = entryView(lore, id).knowledge;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={id === tribe}
              className={`lore-tab ${id === tribe ? "is-active" : ""}`}
              onClick={() => setTribe(id)}
            >
              {known === 0 ? <Lock size={11} /> : null}{" "}
              {known === 0 ? "???" : LORE[id].name.replace("Die ", "")}
            </button>
          );
        })}
      </div>
      <article className="lore-page">
        {view.knowledge === 0 ? (
          <>
            <h3>Unbekanntes Volk</h3>
            <p className="lore-rumor">{t.rumor}</p>
          </>
        ) : (
          <>
            <h3>{t.name}</h3>
            <p className="lore-sub">
              {t.subtitle} · {STAGE[view.knowledge]}
            </p>
            {view.sections.map((s) => (
              <section key={s.title}>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </section>
            ))}
            {view.facts.length > 0 && (
              <dl className="lore-facts" aria-label="Auf einen Blick">
                {view.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
        {view.hidden > 0 && (
          <p className="lore-hidden">
            <Lock size={11} /> {view.hidden} {view.hidden === 1 ? "Seite fehlt" : "Seiten fehlen"}{" "}
            noch. {unlockHint(view.knowledge)}
          </p>
        )}
      </article>
      <Button className="resume-button" onClick={onClose}>
        Zurück zum Spiel
      </Button>
    </>
  );
}
