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

export function loadSets(): SavedSet[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedSet[]) : [];
  } catch {
    return [];
  }
}

export function saveSets(sets: SavedSet[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sets.slice(0, 20)));
  } catch {
    // storage full or blocked; the session still works in memory
  }
}

export function createSavedSet(studySet: StudySet): SavedSet {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    studySet,
    cards: studySet.flashcards.map(() => newCardState()),
    quizScores: [],
  };
}
