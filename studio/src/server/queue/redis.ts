import IORedis from "ioredis";
import { env } from "../env";

const g = globalThis as unknown as { redis?: IORedis };

export function redis(): IORedis {
  if (!g.redis) {
    g.redis = new IORedis(env.redisUrl, { maxRetriesPerRequest: null, enableOfflineQueue: true });
    let warned = false;
    g.redis.on("error", (e) => {
      if (!warned) console.warn(`[redis] ${e.message} — queues and rate limits unavailable until it reconnects`);
      warned = true;
    });
    g.redis.on("ready", () => (warned = false));
  }
  return g.redis;
}
