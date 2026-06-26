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
    return json(429, { error: `Too many requests. Try again in ${limit.retryAfter}s.` }, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Expected a JSON body." });
  }
  const parsed = ExplainInput.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: parsed.error.issues[0]?.message ?? "Invalid input." });
