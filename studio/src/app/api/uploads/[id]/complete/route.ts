import fsp from "node:fs/promises";
import path from "node:path";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { assembleChunks, assetDto, ingestFile } from "@/server/services/assets";
import { scratchDir } from "@/server/storage";

export const maxDuration = 300;

export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const s = await db.uploadSession.findFirst({ where: { id, ownerId: u.id } });
  if (!s) throw new HttpError(404, "Upload not found");
  if (s.completed && s.assetId) {
    const a = await db.asset.findUniqueOrThrow({ where: { id: s.assetId } });
    return json({ asset: assetDto(a) });
  }
  const missing = Array.from({ length: s.totalChunks }, (_, i) => i).filter((i) => !s.receivedChunks.includes(i));
  if (missing.length) throw new HttpError(409, `Missing ${missing.length} chunk(s)`, "missing_chunks");
  const dir = scratchDir("uploads", id);
  const assembled = path.join(dir, "assembled");
  await assembleChunks(id, s.totalChunks, assembled);
  try {
    const asset = await ingestFile({ ownerId: u.id, file: assembled, name: s.fileName, mime: s.mimeType });
    await db.uploadSession.update({ where: { id }, data: { completed: true, assetId: asset.id } });
    return json({ asset: assetDto(asset) });
  } finally {
    await fsp.rm(dir, { recursive: true, force: true });
  }
});
