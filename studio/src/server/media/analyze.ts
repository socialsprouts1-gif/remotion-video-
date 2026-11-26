/**
 * Footage analysis for Auto Edit — runs locally with FFmpeg (no API cost):
 *  - scene changes (shot boundaries)
 *  - silences (for removing dead air)
 *  - audio energy + beat/onset detection (for cutting on the beat)
 *  - sampled frames (JPEG) that Claude can look at
 */
import { execFile, spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { FFMPEG, probe } from "./probe";

const run = promisify(execFile);

export interface FootageAnalysis {
  durationSec: number;
  width: number | null;
  height: number | null;
  fps: number | null;
  hasAudio: boolean;
  /** shot boundaries in seconds (excluding 0) */
  scenes: number[];
  /** silent ranges in seconds */
  silences: { start: number; end: number }[];
  /** beat/onset times in seconds (strong transients) */
  beats: number[];
  /** estimated tempo from beat spacing (null when not rhythmic) */
  bpm: number | null;
  /** average shot length in seconds */
  avgShotSec: number;
  /** sampled frames, ready to send to a vision model */
  frames: { t: number; file: string }[];
}

/** Run ffmpeg and return its stderr (where filters print their info). */
function ffmpegStderr(args: string[], timeoutMs = 10 * 60_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ["-hide_banner", "-nostats", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => {
      err += d.toString();
      if (err.length > 20_000_000) err = err.slice(-10_000_000);
    });
    const t = setTimeout(() => p.kill("SIGKILL"), timeoutMs);
    p.on("error", reject);
    p.on("close", () => {
      clearTimeout(t);
      resolve(err);
    });
  });
}

export async function detectScenes(file: string, threshold = 0.32): Promise<number[]> {
  // analyse at reduced size/fps for speed
  const err = await ffmpegStderr(["-i", file, "-an", "-vf", `fps=12,scale=320:-2,select='gt(scene,${threshold})',showinfo`, "-f", "null", "-"]);
  const out: number[] = [];
  for (const m of err.matchAll(/pts_time:([\d.]+)/g)) {
    const t = Number(m[1]);
    if (Number.isFinite(t) && (out.length === 0 || t - out[out.length - 1] > 0.4)) out.push(Math.round(t * 100) / 100);
  }
  return out;
}

export async function detectSilences(file: string, noiseDb = -35, minSec = 0.45): Promise<{ start: number; end: number }[]> {
  const err = await ffmpegStderr(["-i", file, "-vn", "-af", `silencedetect=noise=${noiseDb}dB:d=${minSec}`, "-f", "null", "-"]);
  const out: { start: number; end: number }[] = [];
  let start: number | null = null;
  for (const line of err.split("\n")) {
    const s = line.match(/silence_start: ([\d.]+)/);
    if (s) start = Number(s[1]);
    const e = line.match(/silence_end: ([\d.]+)/);
    if (e && start !== null) {
      out.push({ start: Math.round(start * 100) / 100, end: Math.round(Number(e[1]) * 100) / 100 });
      start = null;
    }
  }
  return out;
}

/** Simple spectral-flux-free onset detector on RMS energy: good enough for cutting to music. */
export async function detectBeats(file: string): Promise<{ beats: number[]; bpm: number | null }> {
  const SR = 11025;
  const { stdout } = await run(FFMPEG, ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { encoding: "buffer", maxBuffer: 1024 * 1024 * 1024 });
  const samples = new Int16Array(stdout.buffer, stdout.byteOffset, Math.floor(stdout.byteLength / 2));
  const hop = 512;
  const energies: number[] = [];
  for (let i = 0; i + hop <= samples.length; i += hop) {
    let sum = 0;
    for (let j = i; j < i + hop; j++) sum += samples[j] * samples[j];
    energies.push(Math.sqrt(sum / hop));
  }
  const win = 43; // ~2s context
  const beats: number[] = [];
  let last = -1;
  for (let i = 1; i < energies.length - 1; i++) {
    const a = Math.max(0, i - win);
    const b = Math.min(energies.length, i + win);
    let mean = 0;
    for (let k = a; k < b; k++) mean += energies[k];
    mean /= b - a;
    const flux = energies[i] - energies[i - 1];
    const t = (i * hop) / SR;
    if (energies[i] > mean * 1.35 && flux > 0 && energies[i] >= energies[i + 1] && energies[i] > 400 && t - last > 0.25) {
      beats.push(Math.round(t * 100) / 100);
      last = t;
    }
  }
  let bpm: number | null = null;
  if (beats.length > 8) {
    const gaps = beats.slice(1).map((t, i) => t - beats[i]).filter((g) => g > 0.25 && g < 2).sort((x, y) => x - y);
    const med = gaps[Math.floor(gaps.length / 2)];
    if (med) {
      bpm = 60 / med;
      while (bpm < 70) bpm *= 2;
      while (bpm > 180) bpm /= 2;
      bpm = Math.round(bpm);
    }
  }
  return { beats, bpm };
}

export async function sampleFrames(file: string, times: number[], outDir: string, width = 512): Promise<{ t: number; file: string }[]> {
  await fs.mkdir(outDir, { recursive: true });
  const out: { t: number; file: string }[] = [];
  for (const [i, t] of times.entries()) {
    const f = path.join(outDir, `f${String(i).padStart(3, "0")}.jpg`);
    try {
      await run(FFMPEG, ["-v", "error", "-y", "-ss", t.toFixed(2), "-i", file, "-frames:v", "1", "-vf", `scale=${width}:-2`, "-q:v", "5", f], { timeout: 60_000 });
      await fs.access(f);
      out.push({ t, file: f });
    } catch {
      /* frame past the end or unreadable: skip */
    }
  }
  return out;
}

/** Pick representative frame times: scene starts first, then fill evenly. */
export function chooseFrameTimes(durationSec: number, scenes: number[], max: number): number[] {
  const candidates = [0.3, ...scenes.map((s) => s + 0.25)].filter((t) => t < durationSec - 0.1);
  let times: number[];
  if (candidates.length >= max) {
    const step = candidates.length / max;
    times = Array.from({ length: max }, (_, i) => candidates[Math.floor(i * step)]);
  } else {
    times = [...candidates];
    const need = max - times.length;
    for (let i = 1; i <= need; i++) times.push((durationSec * i) / (need + 1));
  }
  return [...new Set(times.map((t) => Math.round(t * 10) / 10))].sort((a, b) => a - b).slice(0, max);
}

export async function analyzeFootage(file: string, opts: { workDir: string; maxFrames: number; withBeats?: boolean }): Promise<FootageAnalysis> {
  const p = await probe(file);
  const duration = p.durationSec ?? 0;
  const [scenes, silences, rhythm] = await Promise.all([
    p.hasVideo ? detectScenes(file).catch(() => []) : Promise.resolve([]),
    p.hasAudio ? detectSilences(file).catch(() => []) : Promise.resolve([]),
    p.hasAudio && opts.withBeats ? detectBeats(file).catch(() => ({ beats: [], bpm: null })) : Promise.resolve({ beats: [] as number[], bpm: null as number | null }),
  ]);
  const frames = p.hasVideo && opts.maxFrames > 0 ? await sampleFrames(file, chooseFrameTimes(duration, scenes, opts.maxFrames), opts.workDir) : [];
  return {
    durationSec: duration,
    width: p.width,
    height: p.height,
    fps: p.fps,
    hasAudio: p.hasAudio,
    scenes,
    silences,
    beats: rhythm.beats,
    bpm: rhythm.bpm,
    avgShotSec: Math.round((duration / (scenes.length + 1)) * 100) / 100,
    frames,
  };
}
