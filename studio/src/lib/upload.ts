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
  let done = session.totalChunks - todo.length;
  onProgress(done / session.totalChunks, done ? "Resuming upload" : "Uploading");
  const worker = async () => {
    while (todo.length) {
      if (signal?.aborted) throw new Error("Upload canceled");
      const i = todo.shift()!;
      const blob = file.slice(i * session.chunkSize, Math.min(file.size, (i + 1) * session.chunkSize));
      let attempt = 0;
      for (;;) {
        try {
          const res = await fetch(`/api/uploads/${session.uploadId}/chunk?index=${i}`, { method: "PUT", body: blob, signal, headers: { "content-type": "application/octet-stream" } });
          if (!res.ok) throw new ApiError(res.status, (await res.json().catch(() => ({}))).error ?? `Chunk ${i} failed`);
          break;
        } catch (e) {
          if (signal?.aborted || ++attempt >= 4 || (e instanceof ApiError && e.status < 500)) throw e;
          await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
        }
      }
      done++;
      onProgress((done / session.totalChunks) * 0.92, "Uploading");
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  onProgress(0.95, "Processing (probe, poster, waveform)");
  const r = await api<{ asset: AssetDto }>(`/api/uploads/${session.uploadId}/complete`, { method: "POST" });
  write(k, null);
  onProgress(1, "Done");
  return r.asset;
}
