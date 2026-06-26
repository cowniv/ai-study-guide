import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NotesInput, StrictStudySet, StudySet } from "@/lib/schemas";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { FALLBACK_BETA, MODEL, friendlyError, getClient, isMockMode } from "@/lib/anthropic";
import { mockStudySet } from "@/lib/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = rateLimit(clientIp(req));
