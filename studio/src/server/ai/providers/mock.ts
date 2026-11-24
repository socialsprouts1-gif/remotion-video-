/**
 * DEVELOPMENT MOCK PROVIDER — not AI.
 * Produces synthetic test media with ffmpeg, stamped "MOCK PROVIDER — NOT AI OUTPUT",
 * so the async job pipeline (queue → poll → download → asset → timeline) can be
 * exercised without paid API keys. Enabled only when ENABLE_MOCK_PROVIDER=true and
 * NODE_ENV !== "production".
 */
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { env } from "../../env";
import type { ModelSpec, PollResult, ProviderAdapter, SubmitResult } from "../types";

const run = promisify(execFile);
const SIZES: Record<string, string> = { "16:9": "1280x720", "9:16": "720x1280", "1:1": "1024x1024", "4:5": "864x1080" };

const esc = (s: string) => s.replace(/[\\:'%]/g, " ").slice(0, 60);
const label = (prompt: string) =>
  `drawtext=text='MOCK PROVIDER — NOT AI OUTPUT':fontcolor=white:fontsize=h/16:x=(w-tw)/2:y=h*0.38:box=1:boxcolor=black@0.6:boxborderw=12,` +
  `drawtext=text='${esc(prompt) || "no prompt"}':fontcolor=white@0.85:fontsize=h/28:x=(w-tw)/2:y=h*0.55`;

async function tmp(ext: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lumora-mock-"));
  return path.join(dir, `out.${ext}`);
}

function models(): ModelSpec[] {
  const base = { verified: true, notes: "Synthetic test output for development only", credits: 0 };
  return [
    { ...base, id: "mock-video", label: "Mock video (dev)", capability: "text-to-video", durations: [3, 5, 8], aspectRatios: ["16:9", "9:16", "1:1", "4:5"], negativePrompt: true, seed: true, firstFrame: true, lastFrame: true },
    { ...base, id: "mock-i2v", label: "Mock image→video (dev)", capability: "image-to-video", durations: [3, 5], firstFrame: true },
    { ...base, id: "mock-image", label: "Mock image (dev)", capability: "text-to-image", aspectRatios: ["16:9", "9:16", "1:1", "4:5"], seed: true },
    { ...base, id: "mock-tts", label: "Mock speech (dev tone)", capability: "text-to-speech", voices: [{ id: "tone", label: "Test tone" }] },
    { ...base, id: "mock-stt", label: "Mock transcript (dev)", capability: "speech-to-text" },
    { ...base, id: "mock-music", label: "Mock music (dev tone)", capability: "music", durations: [8, 15] },
  ];
}

export const mock: ProviderAdapter = {
  id: "mock",
  name: "Mock provider (development)",
  website: "",
  envKeys: ["ENABLE_MOCK_PROVIDER"],
  isMock: true,
  configured: () => env.mockProvider,
  models,
  async submit(model, input): Promise<SubmitResult> {
    const size = SIZES[input.aspectRatio ?? "16:9"] ?? "1280x720";
    const dur = input.durationSec ?? 5;
    if (model.capability === "text-to-video" || model.capability === "image-to-video") {
      const out = await tmp("mp4");
      await run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `testsrc2=size=${size}:rate=30:duration=${dur}`, "-f", "lavfi", "-i", `sine=frequency=330:duration=${dur}`, "-vf", label(input.prompt), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", out]);
      return { kind: "async", externalId: out, meta: { readyAt: Date.now() + 3000, mime: "video/mp4" } };
    }
    if (model.capability === "text-to-image") {
      const out = await tmp("png");
      await run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `testsrc2=size=${size}:rate=1:duration=1`, "-vf", label(input.prompt), "-frames:v", "1", out]);
      return { kind: "done", outputs: [{ data: await fs.readFile(out), mime: "image/png", name: "mock-image.png" }] };
    }
    if (model.capability === "text-to-speech" || model.capability === "music") {
      const out = await tmp("mp3");
      const d = model.capability === "music" ? dur : Math.max(1.5, input.prompt.split(/\s+/).length * 0.35);
      await run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `sine=frequency=440:duration=${d}`, "-c:a", "libmp3lame", out]);
      return { kind: "done", outputs: [{ data: await fs.readFile(out), mime: "audio/mpeg", name: `mock-${model.capability}.mp3` }] };
    }
    if (model.capability === "speech-to-text") {
      const words = (input.prompt || "mock transcript generated for development only").split(/\s+/);
      return { kind: "done", outputs: [{ mime: "application/json", name: "transcript.json", json: { mock: true, words: words.map((w, k) => ({ text: w, start: k * 0.4, end: k * 0.4 + 0.35, type: "word" })) } }] };
    }
    throw new Error(`mock does not implement ${model.capability}`);
  },
  async poll(_m, externalId, meta): Promise<PollResult> {
    if (Date.now() < Number(meta?.readyAt ?? 0)) return { status: "running", progress: 0.5 };
    return { status: "done", outputs: [{ data: await fs.readFile(externalId), mime: String(meta?.mime ?? "video/mp4"), name: "mock-video.mp4" }] };
  },
};
