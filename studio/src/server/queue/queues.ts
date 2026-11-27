import { Queue } from "bullmq";
import { redis } from "./redis";

export const RENDER_QUEUE = "render";
export const AI_QUEUE = "ai";
export const INGEST_QUEUE = "ingest";

const g = globalThis as unknown as { renderQueue?: Queue; aiQueue?: Queue; ingestQueue?: Queue };

export function renderQueue() {
  g.renderQueue ??= new Queue(RENDER_QUEUE, { connection: redis() });
  return g.renderQueue;
}
export function aiQueue() {
  g.aiQueue ??= new Queue(AI_QUEUE, { connection: redis() });
  return g.aiQueue;
}

/** Serverless functions start cold: give a fresh Redis connection a few seconds to open before giving up. */
async function assertRedis(timeoutMs = 8000) {
  const r = redis();
  if (r.status === "ready") return;
  const ok = await new Promise<boolean>((resolve) => {
    const done = (v: boolean) => {
      clearTimeout(t);
      r.off("ready", onReady);
      resolve(v);
    };
    const onReady = () => done(true);
    const t = setTimeout(() => done(r.status === "ready"), timeoutMs);
    r.on("ready", onReady);
  });
  if (!ok) throw new Error("Redis is not connected");
}

export async function enqueueRender(renderJobId: string) {
  await assertRedis();
  await renderQueue().add("render", { renderJobId }, { jobId: renderJobId, attempts: 2, backoff: { type: "exponential", delay: 5000 }, removeOnComplete: 500, removeOnFail: 1000 });
}
export async function enqueueAi(aiJobId: string) {
  await assertRedis();
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

export async function enqueueIngest(uploadId: string) {
  await assertRedis();
  g.ingestQueue ??= new Queue(INGEST_QUEUE, { connection: redis() });
  await g.ingestQueue.add("ingest", { uploadId }, { jobId: `ingest-${uploadId}`, attempts: 2, backoff: { type: "exponential", delay: 3000 }, removeOnComplete: 500, removeOnFail: 500 });
}
