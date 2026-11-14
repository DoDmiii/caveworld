import { Shield } from "lucide-react";
import { GUARD_POST_IDS, GUARD_POST_LABEL, type GuardPostId } from "./guards";
import type { CampGuard } from "./world";

/** Lagerverwaltung: jeder Lagerkrieger bekommt einen Wachposten. */
export function CampManager({ guards, canHere, onAssign }: { guards: CampGuard[]; canHere: boolean; onAssign: (id: string, post: GuardPostId) => void }) {
  return (
    <>
      <h2 className="lore-title"><Shield size={20} /> Lagerverwaltung</h2>
      <p className="camp-manage-hint">Lege fest, wo deine Krieger Wache stehen. Bei Alarm kämpfen sie und kehren danach auf ihren Posten zurück. Wer bei den Gefangenen steht, verhindert Fluchtversuche.</p>
      <div className="camp-manage-list">
        {guards.length === 0 && <p className="camp-manage-hint">Im Lager leben noch keine Krieger.</p>}
        {guards.map((g) => (
          <section key={g.id} className="camp-guard" aria-label={`Wachposten für ${g.name}`}>
            <header><strong>{g.name}</strong><em>{g.away ? "Folgt dir gerade" : g.label}</em></header>
            <div className="camp-guard-posts">
              {GUARD_POST_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`camp-post ${g.post === id ? "is-active" : ""}`}
                  aria-pressed={g.post === id}
                  disabled={id === "here" && !canHere}
                  title={id === "here" && !canHere ? "Nur innerhalb des Lagers" : undefined}
                  onClick={() => onAssign(g.id, id)}
                >
                  {GUARD_POST_LABEL[id]}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
