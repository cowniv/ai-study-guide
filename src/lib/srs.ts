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
