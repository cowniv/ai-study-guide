import type { PersonaId } from "./schemas";

export interface Persona {
  id: PersonaId;
  name: string;
  blurb: string;
  /** system prompt voice */
  voice: string;
