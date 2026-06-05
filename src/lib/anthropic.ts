import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

/** If a refusal happens, let the API re-run the request on a fallback model. */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";
