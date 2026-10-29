import { Crosshair, Flame, Heart, Leaf, Shield } from 'lucide-react';
import { SKILLS, SKILL_LABEL, relationName, trustLabel, type Profile, type ProfileState } from './profiles';

const ICONS = { hunt: Crosshair, tough: Heart, gather: Leaf, watch: Shield, fire: Flame };
export type ProfileView = { biography: Profile; state: ProfileState; portrait: string; bonds?: { with: string; value: number; label: string }[] };

export function ProfileDetails({ profile }: { profile: ProfileView }) {
  const { biography: p, state } = profile;
  return <div className="profile-details" role="tabpanel" id="npc-profile-panel" aria-labelledby="npc-profile-tab">
    <section className="profile-intro">
      <div className="profile-portrait"><img src={profile.portrait} alt={`${p.name} ${p.epithet}`} /></div>
      <div><span className="eyebrow">{p.origin}</span><h3>{p.epithet || p.name}</h3><p>{p.role}</p></div>
    </section>
    <div className="profile-trust"><span>Vertrauen</span><strong>{state.trust}/100 · {trustLabel(state.trust)}</strong></div>
    <section className="profile-section"><h3>Fähigkeiten</h3><div className="profile-skills">{SKILLS.map(skill => {
      const Icon = ICONS[skill];
      return <div key={skill} className="profile-skill"><span><Icon size={15}/>{SKILL_LABEL[skill]}</span><span className="skill-pips" aria-label={`${SKILL_LABEL[skill]}: ${state.skills[skill]} von 5`}>{[1,2,3,4,5].map(n => <i key={n} className={n <= state.skills[skill] ? 'is-filled' : ''}/>)}</span><strong>{state.skills[skill]}/5</strong></div>;
    })}</div></section>
    <section className="profile-section"><h3>Persönlichkeit</h3><p>{p.background}</p><dl className="profile-traits"><dt>Stärke · {p.strength.label}</dt><dd>{p.strength.effect}</dd><dt>Schwäche · {p.quirk.label}</dt><dd>{p.quirk.effect}</dd></dl></section>
    {p.relations.length > 0 && <section className="profile-section"><h3>Beziehungen</h3>{p.relations.map((r,i) => { const bond = profile.bonds?.find(b => b.with === r.with); return <p className="profile-relation" key={`${r.with}-${i}`}><strong>{relationName(r.with)}{bond ? ` · ${bond.label} (${bond.value > 0 ? '+' : ''}${bond.value})` : ''}</strong><span>{r.note}</span></p>; })}</section>}
    {p.trust && <section className="profile-section"><h3>Vertrauen gewinnen</h3><p><strong>Mag:</strong> {p.trust.likes.join(' · ')}</p><p><strong>Meidet:</strong> {p.trust.dislikes.join(' · ')}</p><ol>{p.trust.steps.map(step => <li key={step}>{step}</li>)}</ol></section>}
  </div>;
}