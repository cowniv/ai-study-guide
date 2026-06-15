"use client";

import type { StudySet } from "./schemas";
import { newCardState, type CardState } from "./srs";

export interface SavedSet {
  id: string;
  createdAt: number;
  studySet: StudySet;
  cards: CardState[];
  quizScores: { at: number; score: number; total: number }[];
}

const KEY = "study-guide:sets:v1";
