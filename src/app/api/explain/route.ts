import { ExplainInput } from "@/lib/schemas";
import { getPersona } from "@/lib/personas";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { FALLBACK_BETA, MODEL, friendlyError, getClient, isMockMode } from "@/lib/anthropic";
import { mockExplanation, streamText } from "@/lib/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (status: number, body: object, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers });

export async function POST(req: Request) {
  const limit = rateLimit(clientIp(req));
  if (!limit.ok) {
