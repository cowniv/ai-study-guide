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

export const Flashcard = z.object({
  front: z.string().describe("A question or term, one line"),
  back: z.string().describe("The answer or definition, 1-3 sentences"),
});

export const QuizQuestion = z.object({
  question: z.string(),
  choices: z.array(z.string()).describe("Exactly 4 answer choices"),
  answerIndex: z.number().int().describe("0-based index of the correct choice"),
  explanation: z.string().describe("Why the answer is correct, 1-2 sentences"),
});

export const StudySet = z.object({
  title: z.string().describe("Short title for this study set"),
  flashcards: z.array(Flashcard).describe("8 to 12 flashcards"),
  quiz: z.array(QuizQuestion).describe("5 multiple-choice questions"),
});

export type Flashcard = z.infer<typeof Flashcard>;
export type QuizQuestion = z.infer<typeof QuizQuestion>;
export type StudySet = z.infer<typeof StudySet>;

/**
 * Structured outputs guarantee the shape, but not every rule (like "exactly 4
 * choices" or a valid answer index). This runs after parsing.
 */
export const StrictStudySet = StudySet.extend({
  flashcards: z.array(Flashcard).min(1).max(20),
