import { describe, expect, it } from 'vitest';
import { DUEL_DAMAGE, DUEL_EFFECTS, DUEL_HP, EMPTY_DUELS, PLAYER_SUBMIT_AT, RING_ESCAPE, SHAME_MINUTES, acceptChance, claimsWoman, duelThink, duelTribute, duelVelocity, hitDuelist, isDodging, isShamed, leftRing, newDuelAi, onCooldown, opponentDamage, playerDuelDamage, playerYields, recordOutcome, rollRules, staggerAi } from '@/game/duel';
import { getAvailableInteractions, type InteractionContext } from '@/game/interactions';

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]!; };

describe('Ehren-Zweikampf', () => {
  it('halbiert jeden Schaden im Duell', () => {
    expect(DUEL_DAMAGE).toBe(0.5);
    expect(playerDuelDamage(18)).toBe(9);
    expect(opponentDamage('fists')).toBe(5);
    expect(opponentDamage('weapons')).toBe(8);
  });
  it('würfelt Ziel und Waffenart zufällig', () => {
    expect(rollRules(seq(0.1, 0.1))).toEqual({ goal: 'death', arms: 'fists' });
    expect(rollRules(seq(0.9, 0.9))).toEqual({ goal: 'submit', arms: 'weapons' });
  });
  it('bis zur Unterwerfung: er gibt bei 15 % Leben auf, der Spieler bei 15 Leben', () => {
    const f = { hp: 20, phase: 'ready' as const, downUntil: 0, max: DUEL_HP };
    expect(hitDuelist(f, 9, 0, 'submit').result).toBe('submitted');
    expect(hitDuelist({ ...f, hp: 40 }, 9, 0, 'submit').result).toBe('hit');
    expect(playerYields(PLAYER_SUBMIT_AT, 'submit')).toBe(true);
    expect(playerYields(PLAYER_SUBMIT_AT, 'death')).toBe(false);
  });
  it('bis zum Tod: bei 0 Leben geht er zu Boden und braucht einen Finisher', () => {
    const r = hitDuelist({ hp: 5, phase: 'ready', downUntil: 0, max: DUEL_HP }, 9, 1000, 'death');
    expect(r.result).toBe('downed');
    expect(r.fighter.phase).toBe('downed');
  });
  it('Annahme sinkt mit Furcht, ein betrogener Mann nimmt fast immer an', () => {
    expect(acceptChance({ fear: 0, relationship: 0, wronged: false })).toBeCloseTo(0.75);
    expect(acceptChance({ fear: 60, relationship: 0, wronged: false })).toBeCloseTo(0.27);
    expect(acceptChance({ fear: 100, relationship: 0, wronged: true })).toBe(0.95);
  });
  it('Sieg: die Frau schließt sich an, wenn es um sie ging oder sie dir zugeneigt ist', () => {
    expect(claimsWoman('jealousy', 0, 0, 40)).toBe(true);
    expect(claimsWoman('player', 0, 10, 40)).toBe(false);
    expect(claimsWoman('player', 1, 0, 40)).toBe(true);
  });
  it('Sieg bringt Respekt und Furcht, Flucht kostet massiv Respekt, Niederlage kostet Tribut', () => {
    expect(DUEL_EFFECTS.win).toMatchObject({ rel: 30, fear: 25, shame: false });
    expect(DUEL_EFFECTS.fled).toMatchObject({ rel: -35, tribute: false, shame: true });
    expect(DUEL_EFFECTS.lose).toMatchObject({ tribute: true, shame: true });
  });
  it('Tribut: die Hälfte der Nahrung und ein Drittel der Materialien', () => {
    const t = duelTribute({ berries: 5, meat: 2, cooked: 0, jerky: 1, wood: 10, stone: 3, flint: 0, fiber: 4 });
    expect(t.taken).toEqual({ berries: 3, meat: 1, cooked: 0, jerky: 1, wood: 4, stone: 1, flint: 0, fiber: 2 });
    expect(t.left.wood).toBe(6);
  });
  it('Flucht und Niederlage starten anderthalb Tage Spott, ein Sieg beendet ihn', () => {
    const lost = recordOutcome(EMPTY_DUELS, 'lose', 'frostheim', 'nordic-m2', 1000);
    expect(isShamed(lost, 'frostheim', 1000 + SHAME_MINUTES - 1)).toBe(true);
    expect(isShamed(lost, 'frostheim', 1000 + SHAME_MINUTES)).toBe(false);
    expect(onCooldown(lost, 'nordic-m2', 1000 + 1439)).toBe(true);
    expect(isShamed(recordOutcome(lost, 'win', 'frostheim', 'nordic-m2', 1200), 'frostheim', 1300)).toBe(false);
  });
  it('wer den Kreis verlässt, flieht', () => {
    expect(leftRing({ x: 0, y: 0 }, { x: RING_ESCAPE + 1, y: 0 })).toBe(true);
    expect(leftRing({ x: 0, y: 0 }, { x: RING_ESCAPE - 1, y: 0 })).toBe(false);
  });
});

describe('Duell-Kämpfer', () => {
  it('umkreist, stürmt vor, schlägt zu und springt zurück', () => {
    let ai = newDuelAi(0);
    let t = duelThink(ai, { now: 1300, dist: 50, playerSwing: false, rng: seq(0.5) });
    expect(t.ai.state).toBe('lunge');
    t = duelThink(t.ai, { now: 1400, dist: 20, playerSwing: false, rng: seq(0.5) });
    expect(t.ai.state).toBe('strike'); expect(t.strikeStarted).toBe(true);
    t = duelThink(t.ai, { now: 1650, dist: 20, playerSwing: false, rng: seq(0.5) });
    expect(t.landHit).toBe(true);
    t = duelThink(t.ai, { now: 1900, dist: 20, playerSwing: false, rng: seq(0.5) });
    expect(t.ai.state).toBe('backstep'); expect(t.move.mode).toBe('retreat');
    ai = t.ai;
  });
  it('täuscht an und weicht zurück, ohne zu schlagen', () => {
    const t = duelThink(newDuelAi(0), { now: 1300, dist: 50, playerSwing: false, rng: seq(0.1) });
    expect(t.ai.state).toBe('feint');
    const back = duelThink(t.ai, { now: 1600, dist: 30, playerSwing: false, rng: seq(0.1) });
    expect(back.ai.state).toBe('backstep'); expect(back.landHit).toBe(false);
  });
  it('weicht einem Schlag aus, aber nur im ersten Moment des Rücksprungs', () => {
    const t = duelThink(newDuelAi(0), { now: 100, dist: 30, playerSwing: true, rng: seq(0.1, 0.9) });
    expect(t.ai.state).toBe('backstep');
    expect(isDodging(t.ai, 150)).toBe(true);
    expect(isDodging(t.ai, 400)).toBe(false);
  });
  it('ein Treffer unterbricht seinen Angriff', () => {
    expect(staggerAi({ state: 'strike', since: 0, until: 440, dir: 1, hit: false }, 100).state).toBe('stagger');
  });
  it('hält beim Umkreisen Abstand und bleibt im Ring', () => {
    const v = duelVelocity({ mode: 'orbit', speed: 46 }, { x: 54, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 1);
    expect(Math.abs(v.x)).toBeLessThan(1); expect(Math.hypot(v.x, v.y)).toBeCloseTo(46);
    const out = duelVelocity({ mode: 'retreat', speed: 150 }, { x: 90, y: 0 }, { x: 60, y: 0 }, { x: 0, y: 0 }, 1);
    expect(out.x).toBeLessThan(150);
  });
});

describe('Herausfordern im Optionsrad', () => {
  const base: InteractionContext = { target: 'guard', targetRole: 'guard', relationship: 0, hasGift: false, hasTradeGoods: false, targetDefeated: false, targetBound: false, targetCarried: false, isOwnTribe: false, inRange: true };
  it('erscheint nur bei Kriegern und zeigt den Grund, warum es nicht geht', () => {
    expect(getAvailableInteractions(base).some(o => o.id === 'challenge')).toBe(false);
    expect(getAvailableInteractions({ ...base, challenge: null }).find(o => o.id === 'challenge')?.disabled).toBe(false);
    expect(getAvailableInteractions({ ...base, challenge: 'Er hat sich heute schon gestellt.' }).find(o => o.id === 'challenge')?.disabledReason).toBe('Er hat sich heute schon gestellt.');
  });
});
