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
