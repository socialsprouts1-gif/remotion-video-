import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { chargeCredits, refundCredits } from "@/server/services/credits";
import { enqueueAi } from "@/server/queue/queues";
import { rateLimit } from "@/server/rate-limit";
import { AutoEditInput } from "@/server/ai/auto-edit-runner";

const COST = 15;

/** Start an Auto Edit job: raw footage + style/prompt/reference → editable project. */
export const POST = route(async (req: Request) => {
  const u = await requireUser();
  await rateLimit(`auto-edit:${u.id}`, 30, 3600);
  const input = AutoEditInput.parse(await req.json());
  const owned = await db.asset.count({ where: { id: { in: input.assetIds }, ownerId: u.id, kind: "VIDEO" } });
  if (owned !== input.assetIds.length) throw new HttpError(400, "Pick videos from your own Assets Library");
  const job = await db.aiJob.create({
    data: { ownerId: u.id, capability: "auto-edit", provider: "lumora", model: "auto-edit", input: input as unknown as Prisma.InputJsonValue, costCredits: COST, output: { stage: "Waiting for the worker" } },
  });
  try {
    await chargeCredits(u.id, COST, "Auto edit", job.id);
  } catch (e) {
    await db.aiJob.update({ where: { id: job.id }, data: { status: "FAILED", error: (e as Error).message } });
    throw e;
  }
  try {
    await enqueueAi(job.id);
  } catch {
    await db.aiJob.update({ where: { id: job.id }, data: { status: "FAILED", error: "Job queue unavailable" } });
    await refundCredits(u.id, COST, "Refund: queue unavailable", job.id);
    throw new HttpError(503, "Job queue unavailable. Make sure Redis and `npm run worker` are running.");
  }
  return json({ job }, 201);
});
