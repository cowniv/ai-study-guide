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
    const all = sets.map((s) => (s.id === next.id ? next : s));
    setSets(all);
    saveSets(all);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!/\.(txt|md|markdown)$/i.test(file.name) && !file.type.startsWith("text/")) {
      setExplainError("Please upload a .txt or .md file.");
      return;
    }
    if (file.size > MAX_NOTES_CHARS * 4) {
      setExplainError("That file is too large.");
      return;
    }
    setNotes((await file.text()).slice(0, MAX_NOTES_CHARS));
  }

  async function explain() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTab("explain");
    setExplanation("");
    setExplainError("");
    setExplaining(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, persona }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        setExplainError(await readError(res));
        return;
      }
      setMock(res.headers.get("X-Mock-Mode") === "true");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setExplanation((t) => t + dec.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setExplainError("Connection lost while streaming. Try again.");
