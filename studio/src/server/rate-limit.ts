import { redis } from "./queue/redis";
import { HttpError } from "./http";

/** Fixed-window rate limiter backed by Redis. Fails open if Redis is down. */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  try {
    const k = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`;
    const n = await redis().incr(k);
    if (n === 1) await redis().expire(k, windowSec);
    if (n > limit) throw new HttpError(429, "Too many requests — slow down a little.");
  } catch (e) {
    if (e instanceof HttpError) throw e;
  }
}
