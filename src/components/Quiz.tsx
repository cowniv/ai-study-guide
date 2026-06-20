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
                ? "border-emerald-500 bg-emerald-50"
                : chosen
                  ? "border-rose-400 bg-rose-50"
                  : "border-stone-200"
              : chosen
                ? "border-accent bg-accent-soft"
                : "border-stone-200 hover:border-stone-300";
            return (
              <label key={ci} className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm ${state}`}>
                <input
                  type="radio"
                  name={`q${qi}`}
                  className="mt-0.5 accent-accent"
                  checked={chosen}
                  disabled={submitted}
                  onChange={() => setAnswers((a) => a.map((x, i) => (i === qi ? ci : x)))}
                />
                {choice}
              </label>
            );
          })}
          {submitted && <p className="text-sm text-stone-600">{q.explanation}</p>}
        </fieldset>
      ))}
      {submitted ? (
        <div className="flex items-center gap-3" role="status">
          <p className="font-semibold">
            Score: {score}/{questions.length}
          </p>
          <button type="button" className="btn btn-ghost" onClick={retry}>
            Try again
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-primary self-start" onClick={submit} disabled={answers.some((a) => a === null)}>
          Check answers
        </button>
      )}
    </div>
  );
}
