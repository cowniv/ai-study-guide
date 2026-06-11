/**
 * Simple fixed-window rate limit per IP, kept in memory. Good enough for one
 * server process; a real deployment would use Redis or the platform's firewall.
 */
const WINDOW_MS = 60_000;
const LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 10);

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, now = Date.now()) {
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) {
      for (const [key, v] of hits) if (v.resetAt <= now) hits.delete(key);
    }
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  if (entry.count > LIMIT) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
