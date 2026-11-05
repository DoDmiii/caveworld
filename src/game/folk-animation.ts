/** Fixed atlas slots shared by the inhabitants; death follows attack, never overlaps it. */
export const ATTACK_START = 72;
export const DEATH_START = 144;

export function folkDeathDirection(facing: number, eightDirections: boolean): number {
  const direction = ((Math.round(facing) % 8) + 8) % 8;
  return eightDirections ? direction : ([0, 1, 1, 2, 2, 3, 3, 0][direction] ?? 1);
}

export function folkDeathFrame(facing: number, eightDirections: boolean): number {
  return DEATH_START + folkDeathDirection(facing, eightDirections) * 7;
}