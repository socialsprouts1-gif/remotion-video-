import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { chargeCredits } from "@/server/services/credits";
import { requireProject } from "@/server/services/projects";
import { enqueueAi } from "@/server/queue/queues";
import { rateLimit } from "@/server/rate-limit";
import { absoluteSigned } from "@/server/storage/sign";
import { findModel } from "@/server/ai/registry";
import { CAPABILITIES, CAPABILITY_INFO, GenerationInput } from "@/server/ai/types";

const Body = z.object({
  provider: z.string(),
  model: z.string(),
  capability: z.enum(CAPABILITIES),
  projectId: z.string().optional(),
  input: GenerationInput.omit({ imageUrl: true, lastFrameUrl: true, videoUrl: true, audioUrl: true }).extend({
    imageAssetId: z.string().optional(),
    lastFrameAssetId: z.string().optional(),
    videoAssetId: z.string().optional(),
    audioAssetId: z.string().optional(),
  }),
  /** opaque client context (e.g. which storyboard scene this fills) */
  context: z.record(z.string(), z.unknown()).optional(),
});

export const GET = route(async (req: Request) => {
  const u = await requireUser();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const capability = url.searchParams.get("capability") ?? undefined;
  const jobs = await db.aiJob.findMany({ where: { ownerId: u.id, ...(projectId ? { projectId } : {}), ...(capability ? { capability } : {}) }, orderBy: { createdAt: "desc" }, take: 60 });
  return json({ jobs });
});

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  await rateLimit(`ai:${u.id}`, 60, 3600);
  const b = Body.parse(await req.json());
  const found = findModel(b.provider, b.model);
  if (!found) throw new HttpError(404, "Unknown provider/model");
  const { adapter, model } = found;
  if (!adapter.configured()) throw new HttpError(412, `${adapter.name} is not connected. Add ${adapter.envKeys.join(", ")} to the server environment.`, "integration_required");
  if (model.capability !== b.capability) throw new HttpError(400, `${model.label} does not support ${b.capability}`);
  const i = b.input;
  // reject options the model doesn't support instead of silently ignoring them
  const unsupported: string[] = [];
  if (i.negativePrompt && !model.negativePrompt) unsupported.push("negative prompt");
  if (i.seed !== undefined && !model.seed) unsupported.push("seed");
  if (i.lastFrameAssetId && !model.lastFrame) unsupported.push("last frame");
  if (i.durationSec && model.durations && !model.durations.includes(i.durationSec)) unsupported.push(`duration ${i.durationSec}s (allowed: ${model.durations.join(", ")})`);
  if (i.aspectRatio && model.aspectRatios && !model.aspectRatios.includes(i.aspectRatio)) unsupported.push(`aspect ${i.aspectRatio}`);
  if (unsupported.length) throw new HttpError(400, `${model.label} does not support: ${unsupported.join(", ")}`);
  if (b.capability === "image-to-video" && !i.imageAssetId) throw new HttpError(400, "Choose a start image");
  if (b.projectId) await requireProject(b.projectId, u.id, "edit");

  const signAsset = async (id?: string) => {
    if (!id) return undefined;
    const a = await db.asset.findFirst({ where: { id, ownerId: u.id } });
    if (!a) throw new HttpError(404, "Reference asset not found");
    return absoluteSigned(`/api/media/${a.id}`, 24 * 3600);
  };
  const input = GenerationInput.parse({
    ...i,
    imageUrl: await signAsset(i.imageAssetId),
    lastFrameUrl: await signAsset(i.lastFrameAssetId),
    videoUrl: await signAsset(i.videoAssetId),
    audioUrl: await signAsset(i.audioAssetId),
  });
  const base = model.credits ?? CAPABILITY_INFO[b.capability].credits;
  const cost = adapter.isMock ? 0 : model.perSecond ? Math.ceil(base * (i.durationSec ?? model.durations?.[0] ?? 5)) : base;
  const job = await db.aiJob.create({
    data: { ownerId: u.id, projectId: b.projectId, capability: b.capability, provider: adapter.id, model: model.id, input: { ...input, context: b.context ?? null } as unknown as Prisma.InputJsonValue, costCredits: cost },
  });
  try {
    await chargeCredits(u.id, cost, `${CAPABILITY_INFO[b.capability].label} (${model.label})`, job.id);
  } catch (e) {
    await db.aiJob.update({ where: { id: job.id }, data: { status: "FAILED", error: (e as Error).message } });
    throw e;
  }
  try {
    await enqueueAi(job.id);
  } catch {
    await db.aiJob.update({ where: { id: job.id }, data: { status: "FAILED", error: "Job queue unavailable" } });
    const { refundCredits } = await import("@/server/services/credits");
    await refundCredits(u.id, cost, "Refund: queue unavailable", job.id);
    throw new HttpError(503, "Job queue unavailable. Check REDIS_URL and that the worker is running.");
  }
  return json({ job }, 201);
});
