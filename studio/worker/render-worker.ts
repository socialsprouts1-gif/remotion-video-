/**
 * Background worker: renders exports (Remotion) and runs AI generation jobs.
 * Run alongside the web app:  npm run worker
 * Scale horizontally by running more worker processes (BullMQ distributes jobs).
 */
import path from "node:path";
import fs from "node:fs";
import { Worker } from "bullmq";
import { db } from "../src/server/db";
import { redis } from "../src/server/queue/redis";
import { AI_QUEUE, RENDER_QUEUE } from "../src/server/queue/queues";
import { storage, scratchDir } from "../src/server/storage";
import { ensureBrowser } from "@remotion/renderer";
import { getBundle, renderProject } from "../src/server/render/render-doc";
import { resolveMediaForRender } from "../src/server/services/exports";
import { runAiJob } from "../src/server/ai/runner";
import { ExportSettings, ProjectDoc } from "../src/lib/project/schema";

async function processRender(renderJobId: string) {
  const job = await db.renderJob.findUnique({ where: { id: renderJobId } });
  if (!job || job.status === "CANCELED" || job.status === "SUCCEEDED") return;
  await db.renderJob.update({ where: { id: job.id }, data: { status: "RUNNING", startedAt: new Date(), attempts: { increment: 1 }, stage: "Bundling composition", progress: 0.01, error: null } });
  const settings = ExportSettings.parse(job.settings);
  const doc = resolveMediaForRender(ProjectDoc.parse(job.document));
  const outDir = scratchDir("renders", job.id);
  const info = { mp4: "mp4", webm: "webm", mov: "mov", gif: "gif" }[settings.format];
  const outFile = path.join(outDir, `out.${info}`);
  let canceled = false;
  let lastWrite = 0;
  const poll = setInterval(async () => {
    const s = await db.renderJob.findUnique({ where: { id: job.id }, select: { status: true } }).catch(() => null);
    if (s?.status === "CANCELED") canceled = true;
  }, 1500);
  try {
    const result = await renderProject({
      doc,
      settings,
      outFile,
      watermark: settings.watermark ? settings.watermarkText || "Made with Lumora" : null,
      shouldCancel: () => canceled,
      onProgress: ({ progress, stage }) => {
        const now = Date.now();
        if (now - lastWrite < 700 && progress < 0.99) return;
        lastWrite = now;
        db.renderJob.updateMany({ where: { id: job.id, status: "RUNNING" }, data: { progress, stage } }).catch(() => undefined);
      },
    });
    const key = `users/${job.ownerId}/renders/${job.id}.${result.ext}`;
    await storage().putFile(key, outFile, result.mime);
    await db.renderJob.update({ where: { id: job.id }, data: { status: "SUCCEEDED", progress: 1, stage: "Done", outputKey: key, outputBytes: BigInt(result.size), finishedAt: new Date() } });
    console.log(`[render] ${job.id} done (${(result.size / 1e6).toFixed(1)} MB)`);
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    if (canceled) {
      console.log(`[render] ${job.id} canceled`);
      return;
    }
    console.error(`[render] ${job.id} failed`, e);
    await db.renderJob.update({ where: { id: job.id }, data: { status: "FAILED", error: msg.slice(0, 1000), stage: "Failed", finishedAt: new Date() } });
    throw e;
  } finally {
    clearInterval(poll);
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

async function main() {
  if (!process.env.REMOTION_BROWSER_EXECUTABLE) {
    console.log("[worker] making sure Chrome Headless Shell is installed…");
    await ensureBrowser();
  }
  console.log("[worker] warming Remotion bundle…");
  await getBundle();
  console.log("[worker] bundle ready");
  const concurrency = Number(process.env.RENDER_JOBS_PER_WORKER || 1);
  const render = new Worker(RENDER_QUEUE, async (j) => processRender(j.data.renderJobId as string), { connection: redis(), concurrency, lockDuration: 120_000 });
  const ai = new Worker(AI_QUEUE, async (j) => runAiJob(j.data.aiJobId as string), { connection: redis(), concurrency: 4, lockDuration: 600_000 });
  for (const w of [render, ai]) w.on("failed", (j, err) => console.error(`[${w.name}] job ${j?.id} failed: ${err.message}`));
  // Recover jobs orphaned by a crashed worker: RUNNING in DB but not active in the queue.
  const stale = await db.renderJob.findMany({ where: { status: "RUNNING", startedAt: { lt: new Date(Date.now() - 30 * 60_000) } } });
  for (const s of stale) await db.renderJob.update({ where: { id: s.id }, data: { status: "FAILED", error: "Worker stopped while rendering. Please retry.", finishedAt: new Date() } });
  console.log(`[worker] listening on '${RENDER_QUEUE}' and '${AI_QUEUE}'`);
  const shutdown = async () => {
    await Promise.all([render.close(), ai.close()]);
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
