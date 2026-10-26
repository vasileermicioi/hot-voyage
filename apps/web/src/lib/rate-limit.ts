/**
 * In-memory per-IP rate-limit stub for POST /api/inquiries.
 *
 * Documented stub: sufficient for local dev and abuse smoke-tests. A durable
 * (Workers KV / D1-backed) limiter is step 04 scope. The honeypot in
 * validation.ts already blocks naive bots.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function checkRateLimit(
  ip: string,
  now = Date.now(),
): { allowed: boolean; retryAfterMs: number } {
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    const oldest = list[0] ?? now;
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) };
  }
  list.push(now);
  hits.set(ip, list);
  return { allowed: true, retryAfterMs: 0 };
}

/** Test-only reset. */
export function resetRateLimit(): void {
  hits.clear();
}
