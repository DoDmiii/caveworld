/** Engine-free village warning levels, border patrol routes and speech-bubble lines. */
export type WarningLevel = 0 | 1 | 2 | 3;
export const WARNING_NAME: Record<WarningLevel, string> = { 0: 'Ruhig', 1: 'Wachsam', 2: 'Angespannt', 3: 'Feindselig' };

/** Village mood derived from its relationship; an active alarm always means hostile. */
export function warningLevel(relationship: number, alarmActive: boolean): WarningLevel {
  if (alarmActive || relationship <= -60) return 3;
  if (relationship <= -25) return 2;
  if (relationship < 0) return 1;
  return 0;
}
/** Guards leave the village to walk the border from "Angespannt" on. */
export const patrolsActive = (level: WarningLevel) => level >= 2;
/** Distance at which a patrol spots the player; hostile patrols attack on sight. */
export const PATROL_SIGHT = 120;
export const patrolAttacks = (level: WarningLevel, distance: number) => level >= 3 && distance <= PATROL_SIGHT;

/** Six waypoints on a ring around the village, outside the fence. Each guard starts at a different one. */
export function patrolRoute(village: { x: number; y: number; r: number }, offset = 0): { x: number; y: number }[] {
  const ring = village.r + 110;
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((i + offset) % 6) / 6 * Math.PI * 2;
    return { x: Math.round(village.x + Math.cos(a) * ring), y: Math.round(village.y + Math.sin(a) * ring) };
  });
}

export type BarkKind = 'spotted' | 'warn' | 'attack' | 'greet' | 'alarm' | 'flee' | 'patrol';
export const BARKS: Record<BarkKind, string[]> = {
  spotted: ['Da! Ein Fremder!', 'Wer schleicht da?', 'Halt! Bleib stehen!'],
  warn: ['Geh weiter, Höhlenmensch.', 'Leg die Waffe weg!', 'Wir beobachten dich.'],
  attack: ['Für das Dorf!', 'Du wirst bluten!', 'Schlagt ihn nieder!'],
  greet: ['Sei gegrüßt, Freund.', 'Gute Jagd dir!', 'Das Feuer ist warm heute.'],
  alarm: ['Alarm! Zu den Waffen!', 'Ein Angriff! Hilfe!'],
  flee: ['Lass mich!', 'Hilfe!', 'Nicht schlagen!'],
  patrol: ['Augen offen.', 'Die Furt ist ruhig.', 'Kalt heute Nacht.'],
};
export const BARK_MS = 2600;
/** Minimum pause before the same person speaks again. */
export const BARK_COOLDOWN_MS = 6000;
export const pickBark = (kind: BarkKind, seed: number) => BARKS[kind][Math.abs(Math.floor(seed)) % BARKS[kind].length]!;
