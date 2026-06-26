import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NotesInput, StrictStudySet, StudySet } from "@/lib/schemas";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { FALLBACK_BETA, MODEL, friendlyError, getClient, isMockMode } from "@/lib/anthropic";
import { mockStudySet } from "@/lib/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = rateLimit(clientIp(req));
  if (!limit.ok) {
    return Response.json(
      { error: `Too many requests. Try again in ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }
  const parsed = NotesInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { notes } = parsed.data;

  if (isMockMode()) {
    return Response.json({ studySet: mockStudySet(notes), mock: true });
