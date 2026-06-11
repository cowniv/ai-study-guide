/**
 * Simple fixed-window rate limit per IP, kept in memory. Good enough for one
 * server process; a real deployment would use Redis or the platform's firewall.
 */
const WINDOW_MS = 60_000;
