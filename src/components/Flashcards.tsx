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
    onChange({ ...set, cards });
    setFlipped(false);
    setNow(Date.now());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-600">
        <span>
          {dueIndexes.length} due · {set.cards.length} cards
        </span>
        <span>Mastery {masteryPercent(set.cards)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden>
        <div className="h-full bg-accent transition-all" style={{ width: `${masteryPercent(set.cards)}%` }} />
      </div>

      {card ? (
        <>
          <button
            type="button"
            className="flip h-56 w-full text-left"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Show question" : "Show answer"}
            onKeyDown={(e) => {
              const g = GRADES.find((x) => x.key === e.key);
              if (g && flipped) grade(g.grade);
            }}
          >
            <div className={`flip-inner relative h-full ${flipped ? "flipped" : ""}`}>
              <div className="flip-face card absolute inset-0 grid place-items-center text-center font-serif text-xl">
                {card.front}
              </div>
              <div className="flip-face flip-back card absolute inset-0 grid place-items-center bg-accent-soft text-center">
                {card.back}
              </div>
            </div>
          </button>
          <p className="text-center text-xs text-stone-500">
            {flipped ? "How well did you know it? (keys 1–4)" : "Click the card to reveal the answer"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <button type="button" key={g.grade} className="btn btn-ghost" disabled={!flipped} onClick={() => grade(g.grade)}>
                {g.label}
              </button>
            ))}
          </div>
