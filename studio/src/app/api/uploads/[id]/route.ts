import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";

/** Resume support: report which chunks the server already has. */
export const GET = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const s = await db.uploadSession.findFirst({ where: { id, ownerId: u.id } });
  if (!s) throw new HttpError(404, "Upload not found");
  return json({ uploadId: s.id, chunkSize: s.chunkSize, totalChunks: s.totalChunks, received: s.receivedChunks, completed: s.completed, assetId: s.assetId });
});
