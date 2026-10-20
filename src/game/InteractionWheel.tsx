import { Ban, Coins, DoorOpen, Footprints, Gift, Hand, Link, MessageCircle, ShieldAlert, Swords, Target, Wheat, ArrowLeftRight, UserRound } from 'lucide-react';
import type { CSSProperties } from 'react';
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
  const options = getAvailableInteractions(context);
  const style: CSSProperties = { position: 'absolute', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(8,12,10,.72)', padding: 16 };
  return <div style={style} role="dialog" aria-modal="true" aria-label="Interaktionen" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
    <div style={{ width: 'min(560px, 100%)', background: '#171b17', color: '#f4f0df', border: '1px solid #62634f', borderRadius: 18, padding: 18, boxShadow: '0 16px 60px #0009' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div><div style={{ fontSize: 11, letterSpacing: 2, opacity: .7 }}>STAMMESINTERAKTION</div><h2 style={{ margin: '4px 0', fontSize: 22 }}>Was möchtest du tun?</h2></div>
        <button type="button" onClick={onClose} aria-label="Optionsrad schließen" style={closeStyle}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 9 }}>
        {options.map(option => {
          const Icon = ICONS[option.icon as keyof typeof ICONS];
          return <button key={option.id} type="button" disabled={option.disabled} title={option.disabledReason ?? option.description} onClick={() => onChoose(option.id)} style={{ ...optionStyle, opacity: option.disabled ? .42 : 1, cursor: option.disabled ? 'not-allowed' : 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon size={19}/><strong>{option.label}</strong></div>
            <div style={{ fontSize: 11, opacity: .75, marginTop: 8 }}>Risiko: {RISK_LABEL[option.risk]}</div>
            <div style={{ fontSize: 11, opacity: .8, marginTop: 5, lineHeight: 1.35 }}>{option.disabled ? option.disabledReason : option.description}</div>
          </button>;
        })}
      </div>
      <div style={{ fontSize: 11, opacity: .6, marginTop: 14 }}>ESC zum Schließen · Die tatsächliche Wirkung wird von der Spiel-Engine ausgeführt.</div>
    </div>
  </div>;
}

const closeStyle: CSSProperties = { background: 'transparent', color: 'inherit', border: '1px solid #55594a', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' };
const optionStyle: CSSProperties = { textAlign: 'left', minHeight: 94, background: '#242a22', color: 'inherit', border: '1px solid #4b5141', borderRadius: 12, padding: 12 };
