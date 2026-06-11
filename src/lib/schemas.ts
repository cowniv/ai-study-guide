import { z } from "zod";

export const MAX_NOTES_CHARS = 20_000;
export const MIN_NOTES_CHARS = 40;

export const PERSONA_IDS = ["tutor", "museum-guide", "coach", "storyteller"] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

export const NotesInput = z.object({
  notes: z
