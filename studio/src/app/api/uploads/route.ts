import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { CHUNK_SIZE, MAX_UPLOAD_BYTES, kindForMime } from "@/server/services/assets";
import { PLAN_LIMITS } from "@/server/services/credits";

const Body = z.object({ fileName: z.string().min(1).max(255), mimeType: z.string().min(3).max(120), size: z.number().int().positive() });

/** Start (or resume) a chunked upload session. */
export const POST = route(async (req: Request) => {
  const u = await requireUser();
  const b = Body.parse(await req.json());
  if (!kindForMime(b.mimeType)) throw new HttpError(415, `Unsupported file type ${b.mimeType}`);
  if (b.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Files are limited to 4 GB");
  const user = await db.user.findUniqueOrThrow({ where: { id: u.id }, select: { storageBytes: true, plan: true } });
  const quota = BigInt(PLAN_LIMITS[user.plan].storageGb) * BigInt(1024 ** 3);
  if (user.storageBytes + BigInt(b.size) > quota) throw new HttpError(413, `Storage quota reached (${PLAN_LIMITS[user.plan].storageGb} GB on your plan)`);
  const s = await db.uploadSession.create({
    data: { ownerId: u.id, fileName: b.fileName, mimeType: b.mimeType, totalBytes: BigInt(b.size), chunkSize: CHUNK_SIZE, totalChunks: Math.ceil(b.size / CHUNK_SIZE) },
  });
  return json({ uploadId: s.id, chunkSize: s.chunkSize, totalChunks: s.totalChunks, received: [] }, 201);
});
