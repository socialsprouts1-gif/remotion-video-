/**
 * fal.ai adapter (queue API). Model ids are configurable because fal's catalogue
 * changes often; defaults are marked `verified: false` until checked against
 * https://fal.ai/models for your account. Override with FAL_MODEL_* env vars.
 */
import { ProviderError, providerFetch, type GenerationInput, type ModelSpec, type PollResult, type ProviderAdapter, type ProviderOutput, type SubmitResult } from "../types";

const KEY = () => process.env.FAL_KEY ?? "";
const QUEUE = "https://queue.fal.run";

const m = (env: string, fallback: string) => process.env[env] || fallback;

function models(): ModelSpec[] {
  return [
    { id: m("FAL_MODEL_TEXT_TO_VIDEO", "fal-ai/kling-video/v2.1/master/text-to-video"), label: "Kling (text→video)", capability: "text-to-video", durations: [5, 10], aspectRatios: ["16:9", "9:16", "1:1"], negativePrompt: true, verified: false, credits: 8, perSecond: true },
    { id: m("FAL_MODEL_IMAGE_TO_VIDEO", "fal-ai/kling-video/v2.1/standard/image-to-video"), label: "Kling (image→video)", capability: "image-to-video", durations: [5, 10], negativePrompt: true, firstFrame: true, verified: false, credits: 8, perSecond: true },
    { id: m("FAL_MODEL_TEXT_TO_IMAGE", "fal-ai/flux/dev"), label: "FLUX.1 dev", capability: "text-to-image", aspectRatios: ["16:9", "9:16", "1:1", "4:5"], seed: true, verified: false, credits: 4 },
    { id: m("FAL_MODEL_BG_REMOVAL", "fal-ai/birefnet"), label: "BiRefNet background removal", capability: "background-removal", firstFrame: true, verified: false, credits: 2 },
    { id: m("FAL_MODEL_STT", "fal-ai/wizper"), label: "Whisper (speech→text)", capability: "speech-to-text", verified: false, credits: 3 },
  ];
}

const IMAGE_SIZES: Record<string, string> = { "16:9": "landscape_16_9", "9:16": "portrait_16_9", "1:1": "square_hd", "4:5": "portrait_4_3" };

function buildInput(model: ModelSpec, i: GenerationInput): Record<string, unknown> {
  switch (model.capability) {
    case "text-to-video":
      return { prompt: i.prompt, duration: String(i.durationSec ?? 5), aspect_ratio: i.aspectRatio ?? "16:9", ...(i.negativePrompt ? { negative_prompt: i.negativePrompt } : {}) };
    case "image-to-video":
      return { prompt: i.prompt, image_url: i.imageUrl, duration: String(i.durationSec ?? 5), ...(i.negativePrompt ? { negative_prompt: i.negativePrompt } : {}) };
    case "text-to-image":
      return { prompt: i.prompt, image_size: IMAGE_SIZES[i.aspectRatio ?? "16:9"] ?? "landscape_16_9", num_images: 1, ...(i.seed !== undefined ? { seed: i.seed } : {}) };
    case "background-removal":
      return { image_url: i.imageUrl };
    case "speech-to-text":
      return { audio_url: i.audioUrl ?? i.videoUrl, task: "transcribe", chunk_level: "word", ...(i.language ? { language: i.language } : {}) };
    default:
      throw new ProviderError(`fal adapter does not implement ${model.capability}`);
  }
}

function extractOutputs(model: ModelSpec, out: Record<string, unknown>): ProviderOutput[] {
  const video = out.video as { url?: string; content_type?: string } | undefined;
  if (video?.url) return [{ url: video.url, mime: video.content_type ?? "video/mp4", name: "generated.mp4" }];
  const images = (out.images as { url: string; content_type?: string }[] | undefined) ?? (out.image ? [out.image as { url: string; content_type?: string }] : []);
  if (images.length) return images.map((im, k) => ({ url: im.url, mime: im.content_type ?? "image/png", name: `generated-${k + 1}.png` }));
  if (model.capability === "speech-to-text") return [{ mime: "application/json", name: "transcript.json", json: out }];
  throw new ProviderError(`Unrecognised fal output shape: ${JSON.stringify(out).slice(0, 200)}`);
}

export const fal: ProviderAdapter = {
  id: "fal",
  name: "fal.ai",
  website: "https://fal.ai",
  envKeys: ["FAL_KEY"],
  configured: () => !!KEY(),
  models,
  async submit(model, input): Promise<SubmitResult> {
    const res = await providerFetch(`${QUEUE}/${model.id}`, {
      method: "POST",
      headers: { authorization: `Key ${KEY()}`, "content-type": "application/json" },
      body: JSON.stringify(buildInput(model, input)),
    });
    const j = (await res.json()) as { request_id: string; status_url?: string; response_url?: string; cancel_url?: string };
    if (!j.request_id) throw new ProviderError("fal did not return a request_id");
    return { kind: "async", externalId: j.request_id, meta: { statusUrl: j.status_url, responseUrl: j.response_url, cancelUrl: j.cancel_url } };
  },
  async poll(model, externalId, meta): Promise<PollResult> {
    const statusUrl = (meta?.statusUrl as string) ?? `${QUEUE}/${model.id}/requests/${externalId}/status`;
    const s = (await (await providerFetch(statusUrl, { headers: { authorization: `Key ${KEY()}` } })).json()) as { status: string; error?: string };
    if (s.status === "IN_QUEUE" || s.status === "IN_PROGRESS") return { status: "running", progress: s.status === "IN_PROGRESS" ? 0.5 : 0.1 };
    if (s.status !== "COMPLETED") return { status: "failed", error: s.error ?? `fal status ${s.status}` };
    const responseUrl = (meta?.responseUrl as string) ?? `${QUEUE}/${model.id}/requests/${externalId}`;
    const out = (await (await providerFetch(responseUrl, { headers: { authorization: `Key ${KEY()}` } })).json()) as Record<string, unknown>;
    if (out.detail || out.error) return { status: "failed", error: JSON.stringify(out.detail ?? out.error).slice(0, 400) };
    return { status: "done", outputs: extractOutputs(model, out) };
  },
  async cancel(model, externalId, meta) {
    const url = (meta?.cancelUrl as string) ?? `${QUEUE}/${model.id}/requests/${externalId}/cancel`;
    await providerFetch(url, { method: "PUT", headers: { authorization: `Key ${KEY()}` } }).catch(() => undefined);
  },
};
