/** Executes an AiJob in the worker: submit → poll → download → ingest as asset. Refunds on failure. */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { refundCredits } from "../services/credits";
import { assetDto, ingestFile } from "../services/assets";
import { findModel } from "./registry";
import { GenerationInput, ProviderError, providerFetch, type ProviderOutput } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MAX_WAIT_MS = 25 * 60_000;

async function saveOutputs(job: { id: string; ownerId: string; provider: string; input: unknown }, outputs: ProviderOutput[]) {
  const assets = [];
  let transcript: unknown = null;
  const prompt = (job.input as { prompt?: string }).prompt ?? "";
  for (const o of outputs) {
    if (o.json !== undefined) {
      transcript = o.json;
      continue;
    }
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lumora-ai-"));
    const file = path.join(dir, o.name.replace(/[^\w.-]/g, "_"));
    if (o.data) await fs.writeFile(file, o.data);
    else if (o.url) await fs.writeFile(file, Buffer.from(await (await providerFetch(o.url, { timeoutMs: 600_000 })).arrayBuffer()));
    const name = `${prompt.slice(0, 60) || o.name}`.trim();
    const asset = await ingestFile({ ownerId: job.ownerId, file, name, mime: o.mime, source: `ai:${job.provider}`, aiJobId: job.id, meta: { prompt } });
    await fs.rm(dir, { recursive: true, force: true });
    assets.push(assetDto(asset));
  }
  return { assets, transcript };
}

export async function runAiJob(aiJobId: string) {
  const job = await db.aiJob.findUnique({ where: { id: aiJobId } });
  if (!job || job.status === "SUCCEEDED" || job.status === "CANCELED") return;
  const found = findModel(job.provider, job.model ?? "");
  const fail = async (error: string) => {
    await db.aiJob.update({ where: { id: job.id }, data: { status: "FAILED", error: error.slice(0, 1000) } });
    await refundCredits(job.ownerId, job.costCredits, `Refund: ${job.capability} failed`, job.id);
  };
  if (!found) return fail(`Model ${job.provider}/${job.model} is not available`);
  if (!found.adapter.configured()) return fail(`${found.adapter.name} is not configured (missing ${found.adapter.envKeys.join(", ")})`);
  const { adapter, model } = found;
  const input = GenerationInput.parse(job.input);
  await db.aiJob.update({ where: { id: job.id }, data: { status: "RUNNING", attempts: { increment: 1 }, progress: 0.05 } });
  try {
    let externalId = job.externalId;
    let meta = ((job.output as { providerMeta?: Record<string, unknown> } | null)?.providerMeta ?? undefined) as Record<string, unknown> | undefined;
    let outputs: ProviderOutput[] | null = null;
    if (!externalId) {
      const sub = await adapter.submit(model, input);
      if (sub.kind === "done") outputs = sub.outputs;
      else {
        externalId = sub.externalId;
        meta = sub.meta;
        await db.aiJob.update({ where: { id: job.id }, data: { externalId, output: { providerMeta: meta ?? {} } as Prisma.InputJsonValue, progress: 0.1 } });
      }
    }
    const started = Date.now();
    while (!outputs) {
      const cur = await db.aiJob.findUnique({ where: { id: job.id }, select: { status: true } });
      if (cur?.status === "CANCELED") {
        await adapter.cancel?.(model, externalId!, meta);
        await refundCredits(job.ownerId, job.costCredits, `Refund: ${job.capability} canceled`, job.id);
        return;
      }
      if (Date.now() - started > MAX_WAIT_MS) throw new ProviderError("Provider did not finish within 25 minutes");
      const r = await adapter.poll(model, externalId!, meta);
      if (r.status === "failed") throw new ProviderError(r.error);
      if (r.status === "done") outputs = r.outputs;
      else {
        await db.aiJob.update({ where: { id: job.id }, data: { progress: Math.max(0.1, Math.min(0.9, r.progress ?? 0.3)) } });
        await sleep(3000);
      }
    }
    await db.aiJob.update({ where: { id: job.id }, data: { progress: 0.92 } });
    const saved = await saveOutputs(job, outputs);
    await db.aiJob.update({ where: { id: job.id }, data: { status: "SUCCEEDED", progress: 1, output: { ...saved, providerMeta: meta ?? {} } as unknown as Prisma.InputJsonValue } });
  } catch (e) {
    const err = e as Error;
    const retryable = e instanceof ProviderError && e.retryable && job.attempts < 2;
    if (retryable) {
      await db.aiJob.update({ where: { id: job.id }, data: { status: "QUEUED", error: err.message.slice(0, 500) } });
      throw e; // BullMQ retries with backoff
    }
    await fail(err.message);
  }
}
