/**
 * A small SM-2 style scheduler. Each card has an ease factor and an interval
 * in days; grading a card moves its next due date.
 */
export type Grade = 0 | 1 | 2 | 3; // again, hard, good, easy

export interface CardState {
  ease: number;
  interval: number; // days
  reps: number;
  due: number; // epoch ms
  lapses: number;
}

const DAY = 86_400_000;

export const newCardState = (now = Date.now()): CardState => ({
  ease: 2.5,
  interval: 0,
  reps: 0,
  due: now,
  lapses: 0,
});

export function review(state: CardState, grade: Grade, now = Date.now()): CardState {
  if (grade === 0) {
    return {
      ...state,
      reps: 0,
      interval: 0,
      lapses: state.lapses + 1,
      ease: Math.max(1.3, state.ease - 0.2),
      due: now + 60_000, // see it again in a minute
    };
  }
  const reps = state.reps + 1;
  let interval: number;
  if (reps === 1) interval = grade === 3 ? 3 : 1;
  else if (reps === 2) interval = grade === 1 ? 3 : 6;
  else interval = Math.round(state.interval * state.ease * (grade === 1 ? 0.6 : grade === 3 ? 1.3 : 1));

  const ease = Math.max(1.3, state.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
  return { ...state, reps, interval, ease, due: now + interval * DAY };
}

export function masteryPercent(states: CardState[]): number {
  if (!states.length) return 0;
  const learned = states.filter((s) => s.interval >= 6).length;
  return Math.round((learned / states.length) * 100);
}
