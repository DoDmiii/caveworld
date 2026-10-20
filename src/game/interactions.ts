/** Declarative action registry used by the interaction wheel. Keep engine calls out of this file. */
import type { FolkRole } from './behavior';

export type InteractionTarget = 'villager' | 'captive' | 'ally' | 'guard';
export type InteractionId = 'greet' | 'gift' | 'trade' | 'intimidate' | 'attack' | 'bind' | 'carry' | 'release' | 'interrogate' | 'ransom' | 'follow' | 'feed' | 'assign' | 'banish';
export type Risk = 'low' | 'medium' | 'high';
export interface InteractionContext {
  target: InteractionTarget;
  targetRole: FolkRole;
  relationship: number;
  hasGift: boolean;
  hasTradeGoods: boolean;
  targetDefeated: boolean;
  targetBound: boolean;
  targetCarried: boolean;
  isOwnTribe: boolean;
  inRange: boolean;
}
export interface InteractionDefinition {
  id: InteractionId;
  label: string;
  icon: string;
  targets: InteractionTarget[];
  risk: Risk;
  description: string;
  disabledReason?: (ctx: InteractionContext) => string | null;
}

export const INTERACTIONS: InteractionDefinition[] = [
  { id: 'greet', label: 'Grüßen', icon: 'hand', targets: ['villager', 'guard'], risk: 'low', description: 'Eine freundliche Geste.', disabledReason: c => c.relationship <= -60 ? 'Die Person ist feindlich.' : null },
  { id: 'gift', label: 'Geschenk', icon: 'gift', targets: ['villager', 'guard'], risk: 'low', description: 'Gib Ressourcen ab, um Vertrauen aufzubauen.', disabledReason: c => !c.hasGift ? 'Du hast nichts zum Verschenken.' : null },
  { id: 'trade', label: 'Handeln', icon: 'arrows-left-right', targets: ['villager'], risk: 'low', description: 'Tausche verfügbare Waren.', disabledReason: c => !c.hasTradeGoods ? 'Du hast keine geeigneten Tauschgüter.' : c.relationship < -40 ? 'Die Beziehung ist zu schlecht.' : null },
  { id: 'intimidate', label: 'Einschüchtern', icon: 'shield-alert', targets: ['villager', 'guard'], risk: 'medium', description: 'Kann die Person zurückweichen lassen oder die Lage eskalieren.' },
  { id: 'attack', label: 'Angreifen', icon: 'swords', targets: ['villager', 'guard'], risk: 'high', description: 'Greift das Ziel an und kann Zeugen alarmieren.', disabledReason: c => c.targetRole === 'child' ? 'Kinder können nicht angegriffen werden.' : null },
  { id: 'bind', label: 'Fesseln', icon: 'link', targets: ['captive'], risk: 'medium', description: 'Sichere einen überwältigten Gegner.', disabledReason: c => !c.targetDefeated ? 'Das Ziel muss überwältigt sein.' : c.targetRole === 'child' ? 'Kinder können nicht gefangen werden.' : c.targetBound ? 'Das Ziel ist bereits gefesselt.' : null },
  { id: 'carry', label: 'Tragen', icon: 'user-round', targets: ['captive'], risk: 'medium', description: 'Trage die gefesselte Person; deine Bewegung wird langsamer.', disabledReason: c => !c.targetBound ? 'Das Ziel muss gefesselt sein.' : c.targetCarried ? 'Du trägst diese Person bereits.' : null },
  { id: 'release', label: 'Freilassen', icon: 'door-open', targets: ['captive'], risk: 'medium', description: 'Lass die Person frei; sie könnte Hilfe holen.' },
  { id: 'interrogate', label: 'Verhören', icon: 'message-circle', targets: ['captive'], risk: 'medium', description: 'Versuche, Informationen zu erhalten.', disabledReason: c => !c.targetBound ? 'Das Ziel muss gefesselt sein.' : null },
  { id: 'ransom', label: 'Lösegeld', icon: 'coins', targets: ['captive'], risk: 'medium', description: 'Fordere eine Zahlung für die Freilassung.', disabledReason: c => !c.targetBound ? 'Das Ziel muss gefesselt sein.' : null },
  { id: 'follow', label: 'Folgen', icon: 'footprints', targets: ['ally'], risk: 'low', description: 'Lass das Stammesmitglied dich begleiten.', disabledReason: c => !c.isOwnTribe ? 'Kein Mitglied deiner Sippe.' : null },
  { id: 'feed', label: 'Essen geben', icon: 'wheat', targets: ['ally'], risk: 'low', description: 'Versorge ein Mitglied deiner Sippe.', disabledReason: c => !c.isOwnTribe ? 'Kein Mitglied deiner Sippe.' : null },
  { id: 'assign', label: 'Aufgabe', icon: 'target', targets: ['ally'], risk: 'low', description: 'Weise eine unterstützte Lageraufgabe zu.', disabledReason: c => !c.isOwnTribe ? 'Kein Mitglied deiner Sippe.' : null },
  { id: 'banish', label: 'Verbannen', icon: 'ban', targets: ['ally'], risk: 'high', description: 'Entfernt das Mitglied aus deiner Gemeinschaft.', disabledReason: c => !c.isOwnTribe ? 'Kein Mitglied deiner Sippe.' : null },
];

export function getAvailableInteractions(ctx: InteractionContext) {
  return INTERACTIONS.filter(item => item.targets.includes(ctx.target)).map(item => {
    const reason = !ctx.inRange ? 'Außer Reichweite.' : item.disabledReason?.(ctx) ?? null;
    return { ...item, disabled: Boolean(reason), disabledReason: reason };
  });
}
