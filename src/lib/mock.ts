import type { Persona } from "./personas";
import type { StudySet } from "./schemas";

/** Pull a few "key terms" out of the notes so the mock feels connected to them. */
function keyLines(notes: string, n = 6): string[] {
  return notes
    .split(/\n+|(?<=\.)\s+/)
    .map((l) => l.replace(/^[-*#\d.\s]+/, "").trim())
    .filter((l) => l.length > 12)
    .slice(0, n);
}

export function mockExplanation(notes: string, persona: Persona): string {
  const lines = keyLines(notes, 4);
  const intro: Record<string, string> = {
    tutor: "Let's take this one step at a time.",
    "museum-guide": "Welcome! Step this way, the first exhibit is right here.",
    coach: "Okay, here's what you actually need to know for the exam.",
    storyteller: "Once upon a time, in a set of lecture notes not so far away...",
  };
  const body = lines
    .map((l, i) => `**${i + 1}. ${l.slice(0, 60)}${l.length > 60 ? "…" : ""}**\n${l}\n`)
    .join("\n");
  return [
    `_(Mock mode: no API key is set, so this is a canned ${persona.name.toLowerCase()} response.)_\n`,
    intro[persona.id] ?? "",
    "",
    body || "Your notes are a bit short, but here's the idea in one line.",
    "",
    "**Quick check:** can you explain the first point in your own words?",
  ].join("\n");
}

export function mockStudySet(notes: string): StudySet {
  const lines = keyLines(notes, 8);
  const cards = lines.map((l, i) => ({
    front: `Key idea #${i + 1}: what do your notes say about "${l.split(" ").slice(0, 4).join(" ")}…"?`,
    back: l,
  }));
  const quiz = lines.slice(0, 5).map((l, i) => {
    const others = lines.filter((x) => x !== l).slice(0, 3);
