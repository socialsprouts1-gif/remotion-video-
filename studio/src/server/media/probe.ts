import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

/** Binary paths (override with FFMPEG_PATH / FFPROBE_PATH, e.g. in containers). */
export const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
export const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

export interface ProbeResult {
  durationSec: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
}

export async function probe(file: string): Promise<ProbeResult> {
  const { stdout } = await run(FFPROBE, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], { maxBuffer: 10 * 1024 * 1024 });
  const j = JSON.parse(stdout) as { format?: { duration?: string }; streams?: { codec_type: string; width?: number; height?: number; avg_frame_rate?: string; duration?: string; disposition?: { attached_pic?: number }; tags?: { rotate?: string }; side_data_list?: { rotation?: number }[] }[] };
  const v = j.streams?.find((s) => s.codec_type === "video" && !s.disposition?.attached_pic);
  const a = j.streams?.find((s) => s.codec_type === "audio");
  let fps: number | null = null;
  if (v?.avg_frame_rate && v.avg_frame_rate !== "0/0") {
    const [n, d] = v.avg_frame_rate.split("/").map(Number);
    fps = d ? n / d : n;
  }
  let w = v?.width ?? null;
  let h = v?.height ?? null;
  const rot = Math.abs(Number(v?.tags?.rotate ?? v?.side_data_list?.find((s) => s.rotation !== undefined)?.rotation ?? 0));
  if (rot === 90 || rot === 270) [w, h] = [h, w];
  const dur = Number(j.format?.duration ?? v?.duration ?? a?.duration);
  return { durationSec: Number.isFinite(dur) ? dur : null, width: w, height: h, fps, hasAudio: !!a, hasVideo: !!v };
}

/** Extract a poster frame (jpeg) for video, or a resized copy for images. */
export async function makePoster(input: string, output: string, atSec = 0.5) {
  const args = atSec > 0 ? ["-ss", String(atSec)] : [];
  await run(FFMPEG, ["-v", "error", "-y", ...args, "-i", input, "-frames:v", "1", "-vf", "scale='min(640,iw)':-2", "-q:v", "4", output]);
}

/** Normalized peak waveform for timeline display. */
export async function waveform(input: string, points = 600): Promise<number[]> {
  const { stdout } = await run(FFMPEG, ["-v", "error", "-i", input, "-ac", "1", "-ar", "2000", "-f", "s16le", "-"], { encoding: "buffer", maxBuffer: 400 * 1024 * 1024 });
  const samples = new Int16Array(stdout.buffer, stdout.byteOffset, Math.floor(stdout.byteLength / 2));
  const per = Math.max(1, Math.floor(samples.length / points));
  const out: number[] = [];
  for (let i = 0; i < samples.length; i += per) {
    let m = 0;
    for (let j = i; j < Math.min(samples.length, i + per); j++) m = Math.max(m, Math.abs(samples[j]));
    out.push(Math.round((m / 32768) * 1000) / 1000);
  }
  return out;
}
