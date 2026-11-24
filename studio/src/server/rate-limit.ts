import { redis } from "./queue/redis";
import { HttpError } from "./http";

/**
 * Fixed-window rate limiter backed by Redis. Fails open (never blocks a request)
 * when Redis is unavailable or slow, so auth keeps working during a Redis outage.
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const r = redis();
  if (r.status !== "ready") return;
  try {
    const k = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`;
    const n = await Promise.race([r.incr(k), new Promise<null>((res) => setTimeout(() => res(null), 300))]);
    if (n === null) return;
    if (n === 1) void r.expire(k, windowSec).catch(() => undefined);
    if (n > limit) throw new HttpError(429, "Too many requests — slow down a little.");
  } catch (e) {
    if (e instanceof HttpError) throw e;
  }
}
