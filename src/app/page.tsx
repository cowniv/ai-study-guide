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
    } finally {
      setExplaining(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setSetError("");
    try {
      const res = await fetch("/api/study-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        setSetError(await readError(res));
        return;
      }
      const data = (await res.json()) as { studySet: StudySet; mock: boolean };
      setMock(data.mock);
      const saved = createSavedSet(data.studySet);
      const all = [saved, ...sets];
      setSets(all);
      saveSets(all);
      setActiveId(saved.id);
      setTab("cards");
    } catch {
      setSetError("Couldn't reach the server. Check your connection.");
    } finally {
      setGenerating(false);
    }
  }

  function removeSet(id: string) {
    const all = sets.filter((s) => s.id !== id);
    setSets(all);
    saveSets(all);
    if (activeId === id) setActiveId(all[0]?.id ?? null);
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section className="flex flex-col gap-4">
        <header>
          <h1 className="font-serif text-3xl font-bold">Study Guide</h1>
          <p className="text-stone-600">Paste your notes, pick a guide, and get an explanation, flashcards and a quiz.</p>
        </header>

        <div className="card flex flex-col gap-3">
          <label htmlFor="notes" className="text-sm font-semibold">
            Your notes
          </label>
          <textarea
            id="notes"
            className="min-h-64 rounded-xl border border-stone-300 p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Paste lecture notes, a reviewer, or a chapter summary…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-describedby="notes-help"
          />
          <div id="notes-help" className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <span className={tooLong ? "font-semibold text-rose-600" : ""}>
              {notes.length.toLocaleString()} / {MAX_NOTES_CHARS.toLocaleString()} characters
            </span>
            <label className="btn btn-ghost cursor-pointer py-1 text-xs">
              Upload .txt / .md
              <input type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>
        </div>

        <fieldset className="card">
          <legend className="mb-2 text-sm font-semibold">Explain it like a…</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERSONAS.map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer rounded-xl border p-3 text-sm ${
                  persona === p.id ? "border-accent bg-accent-soft" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input type="radio" name="persona" value={p.id} className="sr-only" checked={persona === p.id} onChange={() => setPersona(p.id)} />
                <span className="block font-semibold">{p.name}</span>
                <span className="text-stone-600">{p.blurb}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={explain} disabled={tooShort || tooLong || explaining}>
            {explaining ? "Explaining…" : "Explain my notes"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={generate} disabled={tooShort || tooLong || generating}>
            {generating ? "Building study set…" : "Make flashcards + quiz"}
          </button>
          {explaining && (
            <button type="button" className="btn btn-ghost" onClick={() => abortRef.current?.abort()}>
              Stop
            </button>
          )}
        </div>
        {mock && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Running in mock mode (no API key on the server), so responses are canned.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div role="tablist" aria-label="Study views" className="flex gap-2">
          {(
            [
              ["explain", "Explanation"],
              ["cards", "Flashcards"],
              ["quiz", "Quiz"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={`btn ${tab === id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "explain" && (
          <div className="card min-h-64" aria-live="polite" aria-busy={explaining}>
            {explainError && <p className="text-sm text-rose-600">{explainError}</p>}
            {explanation ? (
              <Markdown text={explanation} />
            ) : (
              !explainError && (
                <p className="text-sm text-stone-500">{explaining ? "Thinking…" : "Your explanation will stream in here."}</p>
              )
            )}
          </div>
        )}

        {tab !== "explain" && (
          <>
            {setError && <p className="text-sm text-rose-600">{setError}</p>}
            {sets.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="set" className="text-sm font-semibold">
                  Study set
                </label>
                <select
                  id="set"
                  className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
                  value={activeId ?? ""}
                  onChange={(e) => setActiveId(e.target.value)}
                >
                  {sets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studySet.title} · {new Date(s.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {active && (
                  <button type="button" className="text-sm text-stone-500 underline hover:text-rose-600" onClick={() => removeSet(active.id)}>
                    Delete
                  </button>
                )}
              </div>
            )}
            {active ? (
              tab === "cards" ? (
                <Flashcards key={active.id} set={active} onChange={updateSet} />
              ) : (
                <Quiz key={active.id} set={active} onChange={updateSet} />
              )
            ) : (
              <div className="card text-sm text-stone-500">
                No study sets yet. Paste notes and click <strong>Make flashcards + quiz</strong>.
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
