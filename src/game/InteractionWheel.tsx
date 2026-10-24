import { Ban, Coins, DoorOpen, Footprints, Gift, Hand, Link, MessageCircle, ShieldAlert, Swords, Target, Wheat, ArrowLeftRight, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAvailableInteractions, type InteractionContext, type InteractionId, type Risk } from './interactions';

const ICONS = {
  hand: Hand, gift: Gift, 'arrows-left-right': ArrowLeftRight, 'shield-alert': ShieldAlert,
  swords: Swords, link: Link, 'user-round': UserRound, 'door-open': DoorOpen,
  'message-circle': MessageCircle, coins: Coins, footprints: Footprints, wheat: Wheat,
  target: Target, ban: Ban,
} as const;
const RISK_LABEL: Record<Risk, string> = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' };

export interface InteractionWheelProps {
  context: InteractionContext;
  onChoose: (id: InteractionId) => void;
  onClose: () => void;
}

/** HUD overlay only. The parent must pause gameplay while it is open. */
export function InteractionWheel({ context, onChoose, onClose }: InteractionWheelProps) {
  const options = getAvailableInteractions(context).filter(o => o.id !== 'assign' && o.id !== 'banish');
  return <div className="interaction-overlay" role="dialog" aria-modal="true" aria-label="Interaktionen" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
    <div className="interaction-panel">
      <div className="interaction-heading">
        <div><div className="eyebrow">{context.isOwnTribe ? `JAGDTRUPP · ${context.companionCount ?? 0}/3` : 'STAMMESINTERAKTION'}</div><h2>Was möchtest du tun?</h2></div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Optionsrad schließen">✕</Button>
      </div>
      <div className="interaction-options">
        {options.map(option => {
          const Icon = ICONS[option.icon as keyof typeof ICONS];
          return <Button key={option.id} type="button" variant="outline" className="interaction-option" disabled={option.disabled} title={option.disabledReason ?? option.description} onClick={() => onChoose(option.id)}>
            <span><Icon size={19}/><strong>{option.label}</strong></span>
            <small>Risiko: {RISK_LABEL[option.risk]}</small>
          </Button>;
        })}
      </div>
    </div>
  </div>;
}

