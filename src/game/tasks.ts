// Engine-free camp jobs: tribe members who stay in camp produce goods into the storage chest.
import type { ChestGoods, Storable } from './storage';

export type TaskKind = 'none' | 'wood' | 'stone' | 'forage';
export const TASK_KINDS: TaskKind[] = ['none', 'wood', 'stone', 'forage'];
export interface TaskDef { label: string; minutes: number; yields: Partial<Record<Storable, number>> }
export const TASKS: Record<Exclude<TaskKind, 'none'>, TaskDef> = {
  wood: { label: 'Holz fällen', minutes: 60, yields: { wood: 1 } },
  stone: { label: 'Steine klopfen', minutes: 90, yields: { stone: 1, flint: 0.5 } },
  forage: { label: 'Sammeln', minutes: 60, yields: { berries: 1, fiber: 1 } },
};
/** Per-kind chest limit for camp production; the player can still deposit more by hand. */
export const TASK_CHEST_CAP = 40;
export type TaskState = { kind: TaskKind; since: number; carry?: Partial<Record<Storable, number>> };

export const taskLabel = (k: TaskKind) => (k === 'none' ? 'Keine' : TASKS[k].label);
export const nextTask = (k: TaskKind): TaskKind => TASK_KINDS[(TASK_KINDS.indexOf(k) + 1) % TASK_KINDS.length]!;

/** Advances one worker to `clock`. Workers who are away (following) make no progress. */
export function tickTask(task: TaskState, chest: ChestGoods, clock: number, working: boolean): { task: TaskState; chest: ChestGoods } {
  if (task.kind === 'none' || !working) return { task: { ...task, since: clock }, chest };
  const def = TASKS[task.kind];
  const cycles = Math.floor((clock - task.since) / def.minutes);
  if (cycles <= 0) return { task, chest };
  const next = { ...chest };
  const carry = { ...(task.carry ?? {}) };
  for (const [k, per] of Object.entries(def.yields) as [Storable, number][]) {
    const total = (carry[k] ?? 0) + per * cycles;
    const whole = Math.floor(total);
    carry[k] = total - whole;
    next[k] = Math.min(Math.max(next[k], TASK_CHEST_CAP), next[k] + whole) === next[k] + whole ? next[k] + whole : Math.max(next[k], TASK_CHEST_CAP);
  }
  return { task: { kind: task.kind, since: task.since + cycles * def.minutes, carry }, chest: next };
}
