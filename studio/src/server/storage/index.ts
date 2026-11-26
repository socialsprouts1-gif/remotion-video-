/**
 * Object storage abstraction. "local" stores files under STORAGE_DIR (dev / single box);
 * "s3" targets any S3-compatible store (AWS S3, Cloudflare R2, MinIO, Backblaze...).
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { env } from "../env";

export interface Storage {
  putFile(key: string, localPath: string, mime: string): Promise<void>;
  putBuffer(key: string, data: Buffer, mime: string): Promise<void>;
  size(key: string): Promise<number | null>;
  read(key: string, range?: { start: number; end: number }): Promise<Readable>;
  remove(key: string): Promise<void>;
  /** Make the object available as a local file (downloads for remote stores). Call cleanup when done. */
  toLocalFile(key: string): Promise<{ path: string; cleanup: () => Promise<void> }>;
}

function safeKey(key: string) {
  if (key.includes("..") || path.isAbsolute(key)) throw new Error("bad storage key");
  return key;
}

class LocalStorage implements Storage {
  root = path.resolve(env.storageDir);
  p(key: string) {
    return path.join(this.root, safeKey(key));
  }
  async putFile(key: string, localPath: string) {
    await fsp.mkdir(path.dirname(this.p(key)), { recursive: true });
    await fsp.rename(localPath, this.p(key)).catch(async () => {
      await fsp.copyFile(localPath, this.p(key));
      await fsp.rm(localPath, { force: true });
    });
  }
  async putBuffer(key: string, data: Buffer) {
    await fsp.mkdir(path.dirname(this.p(key)), { recursive: true });
    await fsp.writeFile(this.p(key), data);
  }
  async size(key: string) {
    try {
      return (await fsp.stat(this.p(key))).size;
    } catch {
      return null;
    }
  }
  async read(key: string, range?: { start: number; end: number }) {
    return fs.createReadStream(this.p(key), range ? { start: range.start, end: range.end } : undefined);
  }
  async remove(key: string) {
    await fsp.rm(this.p(key), { force: true });
  }
  async toLocalFile(key: string) {
    return { path: this.p(key), cleanup: async () => undefined };
  }
}

class S3Storage implements Storage {
  private clientP = import("@aws-sdk/client-s3").then(
    (m) =>
      [
        m,
        new m.S3Client({
          region: process.env.S3_REGION || "auto",
          endpoint: process.env.S3_ENDPOINT || undefined,
          forcePathStyle: !!process.env.S3_ENDPOINT,
          credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "" },
        }),
      ] as const,
  );
  bucket = process.env.S3_BUCKET ?? "";
  async putFile(key: string, localPath: string, mime: string) {
    const [m, c] = await this.clientP;
    const stat = await fsp.stat(localPath);
    await c.send(new m.PutObjectCommand({ Bucket: this.bucket, Key: safeKey(key), Body: fs.createReadStream(localPath), ContentType: mime, ContentLength: stat.size }));
    await fsp.rm(localPath, { force: true });
  }
  async putBuffer(key: string, data: Buffer, mime: string) {
    const [m, c] = await this.clientP;
    await c.send(new m.PutObjectCommand({ Bucket: this.bucket, Key: safeKey(key), Body: data, ContentType: mime }));
  }
  async size(key: string) {
    const [m, c] = await this.clientP;
    try {
      const r = await c.send(new m.HeadObjectCommand({ Bucket: this.bucket, Key: safeKey(key) }));
      return r.ContentLength ?? null;
    } catch {
      return null;
    }
  }
  async read(key: string, range?: { start: number; end: number }) {
    const [m, c] = await this.clientP;
    const r = await c.send(new m.GetObjectCommand({ Bucket: this.bucket, Key: safeKey(key), Range: range ? `bytes=${range.start}-${range.end}` : undefined }));
    return r.Body as Readable;
  }
  async remove(key: string) {
    const [m, c] = await this.clientP;
    await c.send(new m.DeleteObjectCommand({ Bucket: this.bucket, Key: safeKey(key) }));
  }
  async toLocalFile(key: string) {
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "lumora-"));
    const file = path.join(dir, path.basename(key));
    await pipeline(await this.read(key), fs.createWriteStream(file));
    return { path: file, cleanup: () => fsp.rm(dir, { recursive: true, force: true }) };
  }
}

const g = globalThis as unknown as { storage?: Storage };
export function storage(): Storage {
  g.storage ??= env.storageDriver === "s3" ? new S3Storage() : new LocalStorage();
  return g.storage;
}

/** Scratch directory for uploads-in-progress and render outputs before they are stored. */
export function scratchDir(...parts: string[]) {
  const dir = path.resolve(env.storageDir, ".scratch", ...parts);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
