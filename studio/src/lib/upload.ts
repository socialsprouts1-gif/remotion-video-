"use client";
/**
 * Chunked, resumable uploads. Chunks go up 3 at a time; the upload id is kept in
 * localStorage keyed by file fingerprint so an interrupted upload (refresh, lost
 * connection) resumes from the chunks the server already has.
 */
import { api, ApiError } from "./api";
import type { AssetDto } from "@/server/services/assets";

interface Session { uploadId: string; chunkSize: number; totalChunks: number; received: number[]; completed?: boolean }

const key = (f: File) => `lumora-upload:${f.name}:${f.size}:${f.lastModified}`;
const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string | null) => {
  try {
    v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
  } catch {
    /* storage unavailable: resume just won't work */
  }
};

export function mimeOf(file: File) {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = { mov: "video/quicktime", mp4: "video/mp4", webm: "video/webm", mkv: "video/x-matroska", mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml" };
  return map[ext ?? ""] ?? "application/octet-stream";
}

export async function uploadFile(file: File, onProgress: (p: number, stage: string) => void, signal?: AbortSignal): Promise<AssetDto> {
  const k = key(file);
  let s: Session | null = null;
  const existing = read(k);
  if (existing) {
    try {
      s = await api<Session>(`/api/uploads/${existing}`);
      if (s.completed) s = null;
    } catch {
      s = null;
    }
  }
  if (!s) {
    s = await api<Session>("/api/uploads", { method: "POST", body: { fileName: file.name, mimeType: mimeOf(file), size: file.size } });
    write(k, s.uploadId);
  }
  const session = s;
  const todo = Array.from({ length: session.totalChunks }, (_, i) => i).filter((i) => !session.received.includes(i));
  const chunkBytes = (i: number) => Math.min(file.size, (i + 1) * session.chunkSize) - i * session.chunkSize;
  let doneBytes = session.received.reduce((n, i) => n + chunkBytes(i), 0);
  const inFlight = new Map<number, number>();
  const mb = (b: number) => (b / 1048576).toFixed(1);
  const report = (label = "Uploading") => {
    const sent = Math.min(file.size, doneBytes + [...inFlight.values()].reduce((a, b) => a + b, 0));
    onProgress(sent / Math.max(1, file.size), `${label} · ${mb(sent)} of ${mb(file.size)} MB`);
  };
  report(doneBytes ? "Resuming" : "Uploading");
  const putChunk = (i: number, blob: Blob) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `/api/uploads/${session.uploadId}/chunk?index=${i}`);
      xhr.setRequestHeader("content-type", "application/octet-stream");
      xhr.upload.onprogress = (ev) => {
        inFlight.set(i, ev.loaded);
        report();
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) return resolve();
        let msg = `Chunk ${i} failed`;
        try {
          msg = JSON.parse(xhr.responseText).error ?? msg;
        } catch {
          /* non-JSON error body */
        }
        reject(new ApiError(xhr.status, msg));
      };
      xhr.onerror = () => reject(new Error(`Network error on chunk ${i}`));
      xhr.onabort = () => reject(new Error("Upload canceled"));
      signal?.addEventListener("abort", () => xhr.abort(), { once: true });
      xhr.send(blob);
    });
  const worker = async () => {
    while (todo.length) {
      if (signal?.aborted) throw new Error("Upload canceled");
      const i = todo.shift()!;
      const blob = file.slice(i * session.chunkSize, i * session.chunkSize + chunkBytes(i));
      let attempt = 0;
      for (;;) {
        try {
          await putChunk(i, blob);
          break;
        } catch (e) {
          inFlight.delete(i);
          report();
          if (signal?.aborted || ++attempt >= 4 || (e instanceof ApiError && e.status < 500)) throw e;
          await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
        }
      }
      inFlight.delete(i);
      doneBytes += chunkBytes(i);
      report();
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  onProgress(1, "Upload complete · processing");
  let { asset } = await api<{ asset: AssetDto }>(`/api/uploads/${session.uploadId}/complete`, { method: "POST" });
  write(k, null);
  // on hosted setups the worker processes the file (FFmpeg); wait for it
  const started = Date.now();
  while (asset.status === "processing") {
    if (Date.now() - started > 20 * 60_000) throw new Error("Processing is taking too long — is the worker running?");
    onProgress(1, "Uploaded · processing on the worker");
    await new Promise((r) => setTimeout(r, 2000));
    asset = (await api<{ asset: AssetDto }>(`/api/assets/${asset.id}`)).asset;
  }
  if (asset.status === "failed") throw new Error(asset.error ?? "Processing failed");
  onProgress(1, "Done");
  return asset;
}
