// Felle als Bodenbeute: Wölfe und Säbelzahntiger lassen beim Erlegen ihr Fell liegen,
// das der Spieler durch Berühren aufsammelt. Engine-frei, damit Regeln testbar bleiben.
import type { Pelt } from './appearance';

export type GroundPelt = { id: string; kind: Pelt; x: number; y: number };

/** Abstand (px) zwischen Spielerfüßen und Fell, ab dem es eingesammelt wird. */
export const PELT_TOUCH = 18;
/** Obergrenze liegender Felle; darüber geht das Fell direkt in den Beutel, damit nichts verloren geht. */
export const MAX_GROUND_PELTS = 40;
/** Versatz vom Kadaver, damit Fell und Fleisch nicht übereinander liegen. */
export const PELT_OFFSET = { x: 10, y: 4 };

/** Legt ein Fell neben den Kadaver. `direct` = Boden voll, Fell sofort gutschreiben. */
export function dropPelt(list: GroundPelt[], kind: Pelt, x: number, y: number, id: string): { list: GroundPelt[]; direct: boolean } {
  if (list.length >= MAX_GROUND_PELTS) return { list, direct: true };
  return { list: [...list, { id, kind, x: Math.round(x + PELT_OFFSET.x), y: Math.round(y + PELT_OFFSET.y) }], direct: false };
}

/** Trennt berührte Felle von den liegen bleibenden. */
export function touchPelts(list: GroundPelt[], x: number, y: number, reach = PELT_TOUCH): { taken: GroundPelt[]; rest: GroundPelt[] } {
  const taken: GroundPelt[] = [];
  const rest: GroundPelt[] = [];
  for (const p of list) (Math.hypot(p.x - x, p.y - y) <= reach ? taken : rest).push(p);
  return { taken, rest };
}
