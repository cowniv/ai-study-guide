import { z } from "zod";

export const MAX_NOTES_CHARS = 20_000;
export const MIN_NOTES_CHARS = 40;

export const PERSONA_IDS = ["tutor", "museum-guide", "coach", "storyteller"] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

export const NotesInput = z.object({
  notes: z
    .string()
    .trim()
    .min(MIN_NOTES_CHARS, `Paste at least ${MIN_NOTES_CHARS} characters of notes.`)
    .max(MAX_NOTES_CHARS, `Notes are limited to ${MAX_NOTES_CHARS.toLocaleString()} characters.`),
});

export const ExplainInput = NotesInput.extend({
  persona: z.enum(PERSONA_IDS),
});
