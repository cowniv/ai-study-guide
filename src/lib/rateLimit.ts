/**
 * Simple fixed-window rate limit per IP, kept in memory. Good enough for one
 * server process; a real deployment would use Redis or the platform's firewall.
 */
const WINDOW_MS = 60_000;
const LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 10);

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, now = Date.now()) {
