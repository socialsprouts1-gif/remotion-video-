/**
 * Provider adapter architecture.
 *
 * Each external AI service is wrapped in a ProviderAdapter that declares, per
 * capability, which models it offers and which generation controls each model
 * actually supports. The UI only shows controls a selected model supports, and
 * the server rejects unsupported options instead of silently dropping them.
 */
import { z } from "zod";

export const CAPABILITIES = [
  "text-to-video",
  "image-to-video",
  "video-to-video",
  "text-to-image",
  "image-edit",
  "background-removal",
  "video-upscale",
  "text-to-speech",
  "speech-to-text",
  "music",
  "sound-effect",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

export const CAPABILITY_INFO: Record<Capability, { label: string; output: "video" | "image" | "audio" | "transcript"; credits: number }> = {
  "text-to-video": { label: "Text to video", output: "video", credits: 40 },
  "image-to-video": { label: "Image to video", output: "video", credits: 40 },
  "video-to-video": { label: "Video to video", output: "video", credits: 50 },
  "text-to-image": { label: "Text to image", output: "image", credits: 4 },
  "image-edit": { label: "Image edit", output: "image", credits: 6 },
  "background-removal": { label: "Background removal", output: "image", credits: 2 },
  "video-upscale": { label: "Video upscale", output: "video", credits: 30 },
  "text-to-speech": { label: "Text to speech", output: "audio", credits: 3 },
  "speech-to-text": { label: "Speech to text", output: "transcript", credits: 3 },
  music: { label: "Music", output: "audio", credits: 10 },
  "sound-effect": { label: "Sound effect", output: "audio", credits: 3 },
};

/** Controls a model may support. Anything not listed is rejected for that model. */
export interface ModelSpec {
  id: string;
  label: string;
  capability: Capability;
  durations?: number[];
  aspectRatios?: string[];
  negativePrompt?: boolean;
  seed?: boolean;
  firstFrame?: boolean; // image input
  lastFrame?: boolean;
  referenceImages?: boolean;
  cameraControl?: boolean;
  voices?: { id: string; label: string }[];
  languages?: string[];
  /** credits charged per job (or per second for video when perSecond = true) */
  credits?: number;
  perSecond?: boolean;
  /** has this adapter been verified against the live provider docs */
  verified: boolean;
  notes?: string;
}

export const GenerationInput = z.object({
  prompt: z.string().max(12000).default(""),
  negativePrompt: z.string().max(2000).optional(),
  durationSec: z.number().positive().max(60).optional(),
  aspectRatio: z.string().optional(),
  seed: z.number().int().optional(),
  /** signed absolute URLs prepared by the server from asset ids */
  imageUrl: z.string().url().optional(),
  lastFrameUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  voiceId: z.string().optional(),
  language: z.string().optional(),
  style: z.string().optional(),
  camera: z.string().optional(),
  motionIntensity: z.number().min(0).max(1).optional(),
});
export type GenerationInput = z.infer<typeof GenerationInput>;

export type SubmitResult = { kind: "async"; externalId: string; meta?: Record<string, unknown> } | { kind: "done"; outputs: ProviderOutput[] };

export interface ProviderOutput {
  /** remote URL to download, or inline bytes */
  url?: string;
  data?: Buffer;
  mime: string;
  name: string;
  /** structured output (transcripts) */
  json?: unknown;
}

export type PollResult =
  | { status: "running"; progress?: number }
  | { status: "done"; outputs: ProviderOutput[] }
  | { status: "failed"; error: string };

export interface ProviderAdapter {
  id: string;
  name: string;
  website: string;
  envKeys: string[];
  /** true only for the development mock provider */
  isMock?: boolean;
  configured(): boolean;
  models(): ModelSpec[];
  submit(model: ModelSpec, input: GenerationInput): Promise<SubmitResult>;
  poll(model: ModelSpec, externalId: string, meta?: Record<string, unknown>): Promise<PollResult>;
  cancel?(model: ModelSpec, externalId: string, meta?: Record<string, unknown>): Promise<void>;
}

export class ProviderError extends Error {
  constructor(message: string, public retryable = false) {
    super(message);
  }
}

/** fetch with timeout and JSON error surfacing */
export async function providerFetch(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 60_000);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ProviderError(`${new URL(url).host} responded ${res.status}: ${body.slice(0, 300)}`, res.status === 429 || res.status >= 500);
    }
    return res;
  } catch (e) {
    if (e instanceof ProviderError) throw e;
    throw new ProviderError(`Network error calling ${new URL(url).host}: ${(e as Error).message}`, true);
  } finally {
    clearTimeout(t);
  }
}
