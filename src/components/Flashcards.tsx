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
