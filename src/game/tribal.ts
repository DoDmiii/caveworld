// Engine-free effects of the interaction wheel: what each choice costs, gives and changes.
import type { InteractionId } from './interactions';
import type { CaptiveState } from './captives';

export type Goods = { berries: number; cooked: number; flint: number; fiber: number };
export type Outcome = {
  /** Change of the village relationship. */
  rel: number;
  goods: Goods;
  state: CaptiveState;
  alarm: boolean;
  carry: boolean;
  message: string;
};
export type InteractionSubject = { state: CaptiveState; capturable: boolean; relationship: number; goods: Goods };

export const INTERACTION_RANGE = 36;
export const villageKey = (name: string) => name.toLowerCase();

export function resolveInteraction(id: InteractionId, s: InteractionSubject): Outcome {
  const g = { ...s.goods };
  const base: Outcome = { rel: 0, goods: g, state: s.state, alarm: false, carry: false, message: '' };
  switch (id) {
    case 'greet':
      return { ...base, rel: 3, message: s.relationship >= 25 ? 'Grüßt dich freundlich zurück' : 'Nickt dir knapp zu' };
    case 'gift':
      if (g.berries > 0) g.berries--; else if (g.flint > 0) g.flint--; else return { ...base, message: 'Du hast nichts zum Verschenken' };
      return { ...base, rel: 15, message: 'Nimmt dein Geschenk dankbar an · Ruf +15' };
    case 'trade':
      if (g.fiber >= 2) g.fiber -= 2; else if (g.flint > 0) g.flint--; else return { ...base, message: 'Du hast keine Tauschgüter' };
      g.cooked++;
      return { ...base, rel: 5, message: 'Tausch: 1 Gebratenes erhalten' };
    case 'intimidate':
      if (s.capturable && s.state === 'free') return { ...base, rel: -18, state: 'surrender', message: 'Weicht ängstlich zurück und ergibt sich' };
      return { ...base, rel: -18, alarm: true, message: 'Die Wache ruft das Dorf zusammen!' };
    case 'attack':
      if (s.capturable && s.state === 'free') return { ...base, rel: -35, alarm: true, state: 'surrender', message: 'Ergibt sich! Das Dorf ist alarmiert' };
      return { ...base, rel: -35, alarm: true, message: 'Die Wache wehrt ab und schlägt Alarm!' };
    case 'bind':
      return s.state === 'surrender' ? { ...base, state: 'bound', message: 'Gefesselt · jetzt kannst du sie tragen' } : base;
    case 'carry':
      return s.state === 'bound' ? { ...base, state: 'carried', carry: true, message: 'Auf den Schultern · bring sie ins Höhlenlager' } : base;
    case 'release':
      return { ...base, rel: 20, state: 'free', message: 'Freigelassen · das Dorf schätzt deine Gnade' };
    case 'interrogate':
      return { ...base, message: 'Verrät: In jedem Dorf lagert ein Haus Waffen' };
    case 'ransom':
      g.flint += 3; g.fiber += 2;
      return { ...base, rel: 5, state: 'free', message: 'Lösegeld: 3 Feuerstein und 2 Fasern' };
    case 'feed':
      if (g.berries > 0) g.berries--; else if (g.cooked > 0) g.cooked--; else return { ...base, message: 'Du hast nichts zu essen dabei' };
      return { ...base, message: 'Isst dankbar mit dir' };
    default:
      return { ...base, message: 'Das kommt bald' };
  }
}
