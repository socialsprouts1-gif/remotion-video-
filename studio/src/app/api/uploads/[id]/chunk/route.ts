import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { partKey } from "@/server/services/assets";
import { explainStorageError, storage } from "@/server/storage";

export const PUT = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const index = Number(new URL(req.url).searchParams.get("index"));
  const s = await db.uploadSession.findFirst({ where: { id, ownerId: u.id } });
  if (!s) throw new HttpError(404, "Upload not found");
  if (s.completed) throw new HttpError(409, "Upload already completed");
  if (!Number.isInteger(index) || index < 0 || index >= s.totalChunks) throw new HttpError(400, "Bad chunk index");
  const buf = Buffer.from(await req.arrayBuffer());
  const expected = index === s.totalChunks - 1 ? Number(s.totalBytes) - index * s.chunkSize : s.chunkSize;
  if (buf.length !== expected) throw new HttpError(400, `Chunk ${index} should be ${expected} bytes, got ${buf.length}`);
  try {
    await storage().putBuffer(partKey(id, index), buf, "application/octet-stream");
  } catch (e) {
    // configuration problems won't fix themselves: report them instead of letting the client retry
    const hint = explainStorageError(e);
    if (hint) throw new HttpError(422, hint, "STORAGE_CONFIG");
    throw e;
  }
  await db.$executeRaw`UPDATE "UploadSession" SET "receivedChunks" = array_append("receivedChunks", ${index}), "updatedAt" = now() WHERE id = ${id} AND NOT (${index} = ANY("receivedChunks"))`;
  return json({ ok: true, index });
});
