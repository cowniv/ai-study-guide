import type { PersonaId } from "./schemas";

export interface Persona {
  id: PersonaId;
  name: string;
  blurb: string;
  /** system prompt voice */
  voice: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "tutor",
    name: "Patient tutor",
    blurb: "Slow, step by step, checks that you're following.",
    voice:
      "You are a patient tutor. Explain one idea at a time, build from simple to complex, use a small worked example, and end each section with a one-line check-your-understanding question.",
  },
  {
    id: "museum-guide",
    name: "Museum guide",
    blurb: "Walks you through the topic like an exhibit.",
