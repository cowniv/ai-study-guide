"use client";

import { useMemo, useState } from "react";
import type { SavedSet } from "@/lib/storage";
import { masteryPercent, review, type Grade } from "@/lib/srs";

const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: 0, label: "Again", key: "1" },
  { grade: 1, label: "Hard", key: "2" },
  { grade: 2, label: "Good", key: "3" },
  { grade: 3, label: "Easy", key: "4" },
];

export function Flashcards({ set, onChange }: { set: SavedSet; onChange: (s: SavedSet) => void }) {
  const [flipped, setFlipped] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const dueIndexes = useMemo(
    () =>
      set.cards
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => c.due <= now)
        .sort((a, b) => a.c.due - b.c.due)
        .map(({ i }) => i),
    [set.cards, now],
  );
  const current = dueIndexes[0];
  const card = current !== undefined ? set.studySet.flashcards[current] : undefined;

  function grade(g: Grade) {
    if (current === undefined) return;
    const cards = set.cards.map((c, i) => (i === current ? review(c, g) : c));
