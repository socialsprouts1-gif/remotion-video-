import { Readable } from "node:stream";
import { db } from "@/server/db";
import { getUser } from "@/server/auth/session";
import { storage } from "@/server/storage";
import { outputInfo } from "@/server/render/export-math";
import type { ExportSettings } from "@/lib/project/schema";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = await getUser();
  if (!u) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const j = await db.renderJob.findFirst({ where: { id, ownerId: u.id }, include: { project: { select: { name: true } } } });
  if (!j?.outputKey || j.status !== "SUCCEEDED") return new Response("Not found", { status: 404 });
  const size = await storage().size(j.outputKey);
  if (size === null) return new Response("File missing", { status: 404 });
  const info = outputInfo((j.settings as unknown as ExportSettings).format);
  const name = `${(j.project?.name ?? "export").replace(/[^\w\- ]+/g, "").trim() || "export"}.${info.ext}`;
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  const disposition = `${inline ? "inline" : "attachment"}; filename="${name}"`;
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range && range[1]) {
    const start = Number(range[1]);
    const end = range[2] ? Math.min(size - 1, Number(range[2])) : size - 1;
    return new Response(Readable.toWeb(await storage().read(j.outputKey, { start, end })) as ReadableStream, {
      status: 206,
      headers: { "content-type": info.mime, "content-length": String(end - start + 1), "content-range": `bytes ${start}-${end}/${size}`, "accept-ranges": "bytes", "content-disposition": disposition },
    });
  }
  return new Response(Readable.toWeb(await storage().read(j.outputKey)) as ReadableStream, {
    headers: { "content-type": info.mime, "content-length": String(size), "accept-ranges": "bytes", "content-disposition": disposition },
  });
}
