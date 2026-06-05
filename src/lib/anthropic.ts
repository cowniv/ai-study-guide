import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

/** If a refusal happens, let the API re-run the request on a fallback model. */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

const apiKey = () => process.env.ANTHROPIC_API_KEY?.trim();

export function isMockMode() {
  return !apiKey();
}

let client: Anthropic | null = null;
export function getClient() {
  const key = apiKey();
  if (!key) throw new Error("Anthropic client is unavailable in mock mode.");
  client ??= new Anthropic({ apiKey: key, maxRetries: 2 });
  return client;
}
