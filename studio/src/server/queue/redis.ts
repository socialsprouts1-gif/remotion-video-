import IORedis from "ioredis";
import { env } from "../env";

const g = globalThis as unknown as { redis?: IORedis };

export function redis(): IORedis {
  if (!g.redis) g.redis = new IORedis(env.redisUrl, { maxRetriesPerRequest: null, lazyConnect: false });
  return g.redis;
}
