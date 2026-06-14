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
