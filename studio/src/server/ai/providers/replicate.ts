/**
 * Replicate adapter (predictions API). Model slugs are configurable (REPLICATE_MODEL_*);
 * defaults are unverified until checked against replicate.com for your account.
 */
import { ProviderError, providerFetch, type GenerationInput, type ModelSpec, type PollResult, type ProviderAdapter, type SubmitResult } from "../types";

const TOKEN = () => process.env.REPLICATE_API_TOKEN ?? "";
const API = "https://api.replicate.com/v1";
const m = (env: string, fallback: string) => process.env[env] || fallback;

function models(): ModelSpec[] {
  return [
    { id: m("REPLICATE_MODEL_TEXT_TO_IMAGE", "black-forest-labs/flux-schnell"), label: "FLUX schnell", capability: "text-to-image", aspectRatios: ["16:9", "9:16", "1:1", "4:5"], seed: true, verified: false, credits: 2 },
    { id: m("REPLICATE_MODEL_TEXT_TO_VIDEO", "minimax/video-01"), label: "MiniMax video-01", capability: "text-to-video", durations: [6], firstFrame: true, verified: false, credits: 8, perSecond: true },
    { id: m("REPLICATE_MODEL_MUSIC", "meta/musicgen"), label: "MusicGen", capability: "music", durations: [8, 15, 30], verified: false, credits: 10 },
  ];
}

function buildInput(model: ModelSpec, i: GenerationInput): Record<string, unknown> {
  switch (model.capability) {
    case "text-to-image":
      return { prompt: i.prompt, aspect_ratio: i.aspectRatio ?? "16:9", ...(i.seed !== undefined ? { seed: i.seed } : {}) };
    case "text-to-video":
      return { prompt: i.prompt, ...(i.imageUrl ? { first_frame_image: i.imageUrl } : {}) };
    case "music":
      return { prompt: i.prompt, duration: Math.round(i.durationSec ?? 15), output_format: "mp3" };
    default:
      throw new ProviderError(`Replicate adapter does not implement ${model.capability}`);
  }
}

const mimeFor = (cap: string) => (cap.includes("video") ? "video/mp4" : cap === "music" ? "audio/mpeg" : "image/webp");

export const replicate: ProviderAdapter = {
  id: "replicate",
  name: "Replicate",
  website: "https://replicate.com",
  envKeys: ["REPLICATE_API_TOKEN"],
  configured: () => !!TOKEN(),
  models,
  async submit(model, input): Promise<SubmitResult> {
    const res = await providerFetch(`${API}/models/${model.id}/predictions`, {
      method: "POST",
      headers: { authorization: `Bearer ${TOKEN()}`, "content-type": "application/json" },
      body: JSON.stringify({ input: buildInput(model, input) }),
    });
    const j = (await res.json()) as { id: string };
    return { kind: "async", externalId: j.id };
  },
  async poll(model, id): Promise<PollResult> {
    const j = (await (await providerFetch(`${API}/predictions/${id}`, { headers: { authorization: `Bearer ${TOKEN()}` } })).json()) as { status: string; output?: unknown; error?: string };
    if (j.status === "starting" || j.status === "processing") return { status: "running", progress: j.status === "processing" ? 0.5 : 0.1 };
    if (j.status !== "succeeded") return { status: "failed", error: j.error ?? `Replicate status ${j.status}` };
    const urls = (Array.isArray(j.output) ? j.output : [j.output]).filter((u): u is string => typeof u === "string");
    if (!urls.length) return { status: "failed", error: "Replicate returned no output files" };
    return { status: "done", outputs: urls.map((url, k) => ({ url, mime: mimeFor(model.capability), name: `${model.capability}-${k + 1}` })) };
  },
  async cancel(_model, id) {
    await providerFetch(`${API}/predictions/${id}/cancel`, { method: "POST", headers: { authorization: `Bearer ${TOKEN()}` } }).catch(() => undefined);
  },
};
