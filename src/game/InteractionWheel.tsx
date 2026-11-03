import { Ban, Coins, DoorOpen, Footprints, Gift, Hand, Link, MessageCircle, ShieldAlert, Swords, Target, Wheat, ArrowLeftRight, UserRound, Skull, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAvailableInteractions, type InteractionContext, type InteractionId, type Risk } from './interactions';
import { useEffect, useRef, useState } from 'react';
import { ProfileDetails, type ProfileView } from './ProfileDetails';
import { relationName } from './profiles';
import type { CampDialogue } from './camp-dialogue';

const ICONS = {
  hand: Hand, gift: Gift, 'arrows-left-right': ArrowLeftRight, 'shield-alert': ShieldAlert,
  swords: Swords, link: Link, 'user-round': UserRound, 'door-open': DoorOpen,
  'message-circle': MessageCircle, coins: Coins, footprints: Footprints, wheat: Wheat,
  target: Target, ban: Ban, skull: Skull, 'user-plus': UserPlus,
} as const;
const RISK_LABEL: Record<Risk, string> = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' };

export interface InteractionWheelProps {
  context: InteractionContext;
  onChoose: (id: InteractionId) => void;
  onClose: () => void;
  name?: string;
  profile?: ProfileView | undefined;
  dialogues?: CampDialogue[] | undefined;
  onDialogueChoice?: (dialogue: string, choice: string) => void;
}

/** HUD overlay only. The parent must pause gameplay while it is open. */
export function InteractionWheel({ context, onChoose, onClose, name, profile, dialogues = [], onDialogueChoice }: InteractionWheelProps) {
  const [view, setView] = useState<'actions' | 'profile' | 'dialogue'>('actions');
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => { if (previous instanceof HTMLElement) previous.focus(); };
  }, []);
  const options = getAvailableInteractions(context).filter(o => o.id !== 'banish');
  return <div className="interaction-overlay" role="dialog" aria-modal="true" aria-label={name ? `Interaktionen mit ${name}` : 'Interaktionen'} onKeyDown={e => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    if (e.key === 'Tab') {
      const buttons = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      e.stopPropagation();
    }
  }}>
    <div className="interaction-panel" ref={panel}>
      <div className="interaction-heading">
        <div><div className="eyebrow">{context.isOwnTribe ? `JAGDTRUPP · ${context.companionCount ?? 0}/3` : 'STAMMESINTERAKTION'}</div><h2>{name ?? 'Was möchtest du tun?'}</h2></div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Optionsrad schließen">✕</Button>
      </div>
      {profile && <div className="profile-tabs" role="tablist" aria-label="Personenansicht">
        <Button variant="ghost" role="tab" id="npc-actions-tab" aria-controls="npc-actions-panel" aria-selected={view === 'actions'} onClick={() => setView('actions')}>Interaktionen</Button>
        <Button variant="ghost" role="tab" id="npc-profile-tab" aria-controls="npc-profile-panel" aria-selected={view === 'profile'} onClick={() => setView('profile')}>Steckbrief</Button>
         {dialogues.length > 0 && <Button variant="ghost" role="tab" id="npc-dialogue-tab" aria-controls="npc-dialogue-panel" aria-selected={view === 'dialogue'} onClick={() => setView('dialogue')}>Gespräche</Button>}
      </div>}
      {view === 'dialogue' ? <div role="tabpanel" id="npc-dialogue-panel" aria-labelledby="npc-dialogue-tab" className="camp-dialogues">
        {dialogues.map(d => <section key={d.id} className="camp-conversation"><h3>{d.title}</h3>{d.lines.map((line, i) => <p key={i}><strong>{relationName(line.speaker)}</strong><span>„{line.text}“</span></p>)}<div className="camp-choices">{d.choices.map(c => <Button key={c.id} variant="outline" onClick={() => onDialogueChoice?.(d.id, c.id)}>{c.label}</Button>)}</div></section>)}
      </div> : view === 'profile' && profile ? <ProfileDetails profile={profile}/> : <div className="interaction-options" role="tabpanel" id="npc-actions-panel" aria-labelledby="npc-actions-tab">
        {options.map(option => {
          const Icon = ICONS[option.icon as keyof typeof ICONS];
          return <Button key={option.id} type="button" variant="outline" className="interaction-option" disabled={option.disabled} title={option.disabledReason ?? option.description} onClick={() => onChoose(option.id)}>
            <span><Icon size={19}/><strong>{option.id === 'assign' ? `Aufgabe: ${context.task ?? 'Keine'}` : option.label}</strong></span>
            <small>Risiko: {RISK_LABEL[option.risk]}</small>
          </Button>;
        })}
      </div>}
    </div>
  </div>;
}

