import { Readable } from "node:stream";
import { db } from "@/server/db";
import { getUser } from "@/server/auth/session";
import { storage } from "@/server/storage";
import { verifySignature } from "@/server/storage/sign";

/**
 * Streams an asset with HTTP range support (needed for video seeking).
 * Access: the owner's session, a collaborator on any of the owner's shared projects,
 * or a short-lived HMAC signature (render workers / AI providers).
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const poster = url.searchParams.get("poster") === "1";
  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) return new Response("Not found", { status: 404 });

  const signed = verifySignature(`/api/media/${id}`, url.searchParams.get("exp"), url.searchParams.get("sig"));
  if (!signed) {
    const user = await getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
    if (user.id !== asset.ownerId && user.role !== "ADMIN") {
      const shared = await db.projectMember.findFirst({ where: { userId: user.id, project: { ownerId: asset.ownerId } } });
      if (!shared) return new Response("Forbidden", { status: 403 });
    }
  }

  const key = poster ? asset.posterKey : asset.storageKey;
  if (!key) return new Response("Not found", { status: 404 });
  const size = await storage().size(key);
  if (size === null) return new Response("File missing", { status: 404 });
  const type = poster ? "image/jpeg" : asset.mimeType;
  const common = { "content-type": type, "accept-ranges": "bytes", "cache-control": "private, max-age=3600", "access-control-allow-origin": "*" };

  const range = req.headers.get("range");
  const m = range?.match(/bytes=(\d*)-(\d*)/);
  if (m && size > 0) {
    let start = m[1] ? Number(m[1]) : size - Number(m[2]);
    let end = m[1] && m[2] ? Number(m[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(size - 1, end);
    if (start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    const stream = await storage().read(key, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: { ...common, "content-length": String(end - start + 1), "content-range": `bytes ${start}-${end}/${size}` },
    });
  }
  const stream = await storage().read(key);
  return new Response(Readable.toWeb(stream) as ReadableStream, { headers: { ...common, "content-length": String(size) } });
}
