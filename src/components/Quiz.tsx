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
    onChange({ ...set, quizScores: [...set.quizScores, { at: Date.now(), score, total: questions.length }] });
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  }

  const best = set.quizScores.reduce((m, s) => Math.max(m, s.score), 0);

  return (
    <div className="flex flex-col gap-4">
      {set.quizScores.length > 0 && (
        <p className="text-sm text-stone-600">
          Attempts: {set.quizScores.length} · Best: {best}/{questions.length}
        </p>
      )}
      {questions.map((q, qi) => (
        <fieldset key={qi} className="card flex flex-col gap-2">
          <legend className="sr-only">Question {qi + 1}</legend>
          <p className="font-semibold">
            {qi + 1}. {q.question}
          </p>
          {q.choices.map((choice, ci) => {
            const chosen = answers[qi] === ci;
            const correct = q.answerIndex === ci;
            const state = submitted
              ? correct
