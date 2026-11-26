/** ElevenLabs adapter: text-to-speech (sync) and speech-to-text (Scribe). */
import { ProviderError, providerFetch, type ModelSpec, type PollResult, type ProviderAdapter, type SubmitResult } from "../types";

const KEY = () => process.env.ELEVENLABS_API_KEY ?? "";
const API = "https://api.elevenlabs.io/v1";

// Premade voices available to every ElevenLabs account.
const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel — calm narrator" },
  { id: "pNInz6obpgDQGcFmaJgB", label: "Adam — deep, confident" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella — soft, warm" },
  { id: "ErXwobaYiN019PkySvjV", label: "Antoni — friendly" },
  { id: "TxGEqnHWrfWFTfGW9XjX", label: "Josh — energetic" },
];

function models(): ModelSpec[] {
  return [
    { id: process.env.ELEVENLABS_TTS_MODEL || "eleven_multilingual_v2", label: "Multilingual v2", capability: "text-to-speech", voices: VOICES, languages: ["auto"], verified: false, credits: 3 },
    { id: process.env.ELEVENLABS_STT_MODEL || "scribe_v1", label: "Scribe", capability: "speech-to-text", verified: false, credits: 3 },
    { id: "sound-generation", label: "Sound effects", capability: "sound-effect", durations: [2, 5, 10], verified: false, credits: 3 },
  ];
}

export const elevenlabs: ProviderAdapter = {
  id: "elevenlabs",
  name: "ElevenLabs",
  website: "https://elevenlabs.io",
  envKeys: ["ELEVENLABS_API_KEY"],
  configured: () => !!KEY(),
  models,
  async submit(model, input): Promise<SubmitResult> {
    const headers = { "xi-api-key": KEY() };
    if (model.capability === "text-to-speech") {
      if (!input.prompt.trim()) throw new ProviderError("Text is required");
      const voice = input.voiceId || VOICES[0].id;
      const res = await providerFetch(`${API}/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json", accept: "audio/mpeg" },
        body: JSON.stringify({ text: input.prompt, model_id: model.id }),
        timeoutMs: 120_000,
      });
      return { kind: "done", outputs: [{ data: Buffer.from(await res.arrayBuffer()), mime: "audio/mpeg", name: "voiceover.mp3" }] };
    }
    if (model.capability === "sound-effect") {
      const res = await providerFetch(`${API}/sound-generation`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({ text: input.prompt, ...(input.durationSec ? { duration_seconds: input.durationSec } : {}) }),
        timeoutMs: 120_000,
      });
      return { kind: "done", outputs: [{ data: Buffer.from(await res.arrayBuffer()), mime: "audio/mpeg", name: "sfx.mp3" }] };
    }
    if (model.capability === "speech-to-text") {
      const src = input.audioUrl ?? input.videoUrl;
      if (!src) throw new ProviderError("An audio or video source is required");
      const media = await providerFetch(src, { timeoutMs: 300_000 });
      const form = new FormData();
      form.append("model_id", model.id);
      form.append("file", new Blob([await media.arrayBuffer()]), "audio");
      if (input.language) form.append("language_code", input.language);
      const res = await providerFetch(`${API}/speech-to-text`, { method: "POST", headers, body: form, timeoutMs: 600_000 });
      return { kind: "done", outputs: [{ mime: "application/json", name: "transcript.json", json: await res.json() }] };
    }
    throw new ProviderError(`ElevenLabs adapter does not implement ${model.capability}`);
  },
  async poll(): Promise<PollResult> {
    return { status: "failed", error: "ElevenLabs jobs complete synchronously" };
  },
};
