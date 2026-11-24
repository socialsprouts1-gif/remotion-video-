import { Queue } from "bullmq";
import { redis } from "./redis";

export const RENDER_QUEUE = "render";
export const AI_QUEUE = "ai";

const g = globalThis as unknown as { renderQueue?: Queue; aiQueue?: Queue };

export function renderQueue() {
  g.renderQueue ??= new Queue(RENDER_QUEUE, { connection: redis() });
  return g.renderQueue;
}
export function aiQueue() {
  g.aiQueue ??= new Queue(AI_QUEUE, { connection: redis() });
  return g.aiQueue;
}

function assertRedis() {
  if (redis().status !== "ready") throw new Error("Redis is not connected");
}

export async function enqueueRender(renderJobId: string) {
  assertRedis();
  await renderQueue().add("render", { renderJobId }, { jobId: renderJobId, attempts: 2, backoff: { type: "exponential", delay: 5000 }, removeOnComplete: 500, removeOnFail: 1000 });
}
export async function enqueueAi(aiJobId: string) {
  assertRedis();
  await aiQueue().add("ai", { aiJobId }, { jobId: aiJobId, attempts: 3, backoff: { type: "exponential", delay: 4000 }, removeOnComplete: 500, removeOnFail: 1000 });
}

/** Number of live workers attached to a queue (for health checks / UI hints). */
export async function workerCount(name: string) {
  try {
    const q = name === RENDER_QUEUE ? renderQueue() : aiQueue();
    return (await q.getWorkers()).length;
  } catch {
    return -1;
  }
}
