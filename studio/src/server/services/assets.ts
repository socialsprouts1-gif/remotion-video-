import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type { AssetKind } from "@prisma/client";
import { db } from "../db";
import { storage, scratchDir } from "../storage";
import { makePoster, probe, waveform } from "../media/probe";

export const MAX_UPLOAD_BYTES = 4 * 1024 ** 3;
export const CHUNK_SIZE = 8 * 1024 * 1024;

export function kindForMime(mime: string): AssetKind | null {
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("font/") || mime === "application/font-woff") return "FONT";
  return null;
}

export function extFor(name: string, mime: string) {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, "");
  if (ext) return ext;
  return "." + (mime.split("/")[1] ?? "bin").replace(/[^a-z0-9]/g, "");
}

/**
 * Ingest a local file as an asset: probe metadata, poster frame, waveform, then move to storage.
 * Used by uploads, AI generations and render outputs.
 */
export async function ingestFile(opts: { ownerId: string; file: string; name: string; mime: string; source?: string; aiJobId?: string; meta?: Record<string, unknown> }) {
  const kind = kindForMime(opts.mime) ?? "OTHER";
  const size = (await fsp.stat(opts.file)).size;
  let meta: Record<string, unknown> = { ...(opts.meta ?? {}) };
  let p = { durationSec: null as number | null, width: null as number | null, height: null as number | null, fps: null as number | null, hasAudio: false };
  if (kind === "VIDEO" || kind === "AUDIO" || kind === "IMAGE") {
    try {
      p = await probe(opts.file);
    } catch (e) {
      if (kind !== "IMAGE") throw new Error(`Could not read media file: ${(e as Error).message.slice(0, 200)}`);
    }
  }
  const asset = await db.asset.create({
    data: {
      ownerId: opts.ownerId,
      kind,
      name: opts.name.slice(0, 200),
      mimeType: opts.mime,
      sizeBytes: BigInt(size),
      storageKey: `pending/${Date.now()}-${Math.random()}`,
      width: p.width,
      height: p.height,
      durationSec: kind === "IMAGE" ? null : p.durationSec,
      fps: p.fps,
      hasAudio: kind === "VIDEO" ? p.hasAudio : kind === "AUDIO" ? true : null,
      source: opts.source ?? "upload",
      aiJobId: opts.aiJobId,
    },
  });
  const key = `users/${opts.ownerId}/assets/${asset.id}${extFor(opts.name, opts.mime)}`;
  let posterKey: string | null = null;
  const tmpDir = scratchDir("ingest", asset.id);
  try {
    if (kind === "VIDEO" || kind === "IMAGE") {
      const poster = path.join(tmpDir, "poster.jpg");
      try {
        await makePoster(opts.file, poster, kind === "VIDEO" ? Math.min(0.5, (p.durationSec ?? 1) / 2) : 0);
        posterKey = `users/${opts.ownerId}/assets/${asset.id}.poster.jpg`;
        await storage().putFile(posterKey, poster, "image/jpeg");
      } catch {
        posterKey = null;
      }
    }
    if ((kind === "AUDIO" || (kind === "VIDEO" && p.hasAudio)) && (p.durationSec ?? 0) < 3 * 3600) {
      try {
        meta.waveform = await waveform(opts.file);
      } catch {
        /* waveform is optional */
      }
    }
    await storage().putFile(key, opts.file, opts.mime);
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  }
  const updated = await db.asset.update({ where: { id: asset.id }, data: { storageKey: key, posterKey, meta: meta as object } });
  await db.user.update({ where: { id: opts.ownerId }, data: { storageBytes: { increment: BigInt(size) } } });
  return updated;
}

export function assetDto(a: { id: string; kind: string; name: string; mimeType: string; sizeBytes: bigint; width: number | null; height: number | null; durationSec: number | null; fps: number | null; hasAudio: boolean | null; posterKey: string | null; source: string; createdAt: Date; meta?: unknown }) {
  return {
    id: a.id,
    kind: a.kind,
    name: a.name,
    mimeType: a.mimeType,
    sizeBytes: Number(a.sizeBytes),
    width: a.width,
    height: a.height,
    durationSec: a.durationSec,
    fps: a.fps,
    hasAudio: a.hasAudio,
    src: `/api/media/${a.id}`,
    poster: a.posterKey ? `/api/media/${a.id}?poster=1` : null,
    source: a.source,
    createdAt: a.createdAt,
    waveform: (a.meta as { waveform?: number[] } | null)?.waveform ?? null,
  };
}
export type AssetDto = ReturnType<typeof assetDto>;

export function chunkPath(uploadId: string, index: number) {
  return path.join(scratchDir("uploads", uploadId), `${index}.part`);
}

export async function assembleChunks(uploadId: string, totalChunks: number, outFile: string) {
  const out = fs.createWriteStream(outFile);
  for (let i = 0; i < totalChunks; i++) {
    await new Promise<void>((resolve, reject) => {
      const r = fs.createReadStream(chunkPath(uploadId, i));
      r.on("error", reject);
      r.on("end", resolve);
      r.pipe(out, { end: false });
    });
  }
  await new Promise<void>((resolve, reject) => out.end((e?: Error | null) => (e ? reject(e) : resolve())));
}
