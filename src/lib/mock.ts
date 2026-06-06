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
