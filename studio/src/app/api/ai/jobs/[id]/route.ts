import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";

export const GET = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const job = await db.aiJob.findFirst({ where: { id, ownerId: u.id } });
  if (!job) throw new HttpError(404, "Job not found");
  return json({ job });
});
