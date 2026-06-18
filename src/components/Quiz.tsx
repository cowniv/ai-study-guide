"use client";

import { useState } from "react";
import type { SavedSet } from "@/lib/storage";

export function Quiz({ set, onChange }: { set: SavedSet; onChange: (s: SavedSet) => void }) {
  const questions = set.studySet.quiz;
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const score = answers.filter((a, i) => a === questions[i].answerIndex).length;

  function submit() {
    setSubmitted(true);
