"use client";

import { useEffect, useRef, useState } from "react";
import { PERSONAS } from "@/lib/personas";
import { MAX_NOTES_CHARS, MIN_NOTES_CHARS, type PersonaId, type StudySet } from "@/lib/schemas";
import { createSavedSet, loadSets, saveSets, type SavedSet } from "@/lib/storage";
import { Markdown } from "@/components/Markdown";
import { Flashcards } from "@/components/Flashcards";
import { Quiz } from "@/components/Quiz";

type Tab = "explain" | "cards" | "quiz";

async function readError(res: Response) {
  try {
    const data = await res.json();
    return data.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export default function Home() {
  const [notes, setNotes] = useState("");
  const [persona, setPersona] = useState<PersonaId>("tutor");
  const [tab, setTab] = useState<Tab>("explain");

  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState("");
  const [mock, setMock] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const [sets, setSets] = useState<SavedSet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [setError, setSetError] = useState("");

  useEffect(() => {
    const loaded = loadSets();
    setSets(loaded);
    setActiveId(loaded[0]?.id ?? null);
  }, []);

  const active = sets.find((s) => s.id === activeId) ?? null;
  const tooShort = notes.trim().length < MIN_NOTES_CHARS;
  const tooLong = notes.length > MAX_NOTES_CHARS;

  function updateSet(next: SavedSet) {
