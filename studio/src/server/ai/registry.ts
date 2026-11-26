import { elevenlabs } from "./providers/elevenlabs";
import { fal } from "./providers/fal";
import { mock } from "./providers/mock";
import { replicate } from "./providers/replicate";
import type { Capability, ModelSpec, ProviderAdapter } from "./types";

/**
 * All known adapters. Adding a provider = implementing ProviderAdapter and listing it here.
 * Runway, Luma, Google Veo and OpenAI are listed as planned so the UI can show them as
 * "integration not built yet" rather than pretending they work.
 */
export const PROVIDERS: ProviderAdapter[] = [fal, replicate, elevenlabs, mock];

export const PLANNED_PROVIDERS = [
  { id: "runway", name: "Runway", envKeys: ["RUNWAYML_API_SECRET"], capabilities: ["image-to-video", "video-to-video"] },
  { id: "luma", name: "Luma Dream Machine", envKeys: ["LUMA_API_KEY"], capabilities: ["text-to-video", "image-to-video"] },
  { id: "veo", name: "Google Veo", envKeys: ["GOOGLE_API_KEY"], capabilities: ["text-to-video"] },
  { id: "openai", name: "OpenAI images", envKeys: ["OPENAI_API_KEY"], capabilities: ["text-to-image", "image-edit"] },
];

export function provider(id: string) {
  return PROVIDERS.find((p) => p.id === id) ?? null;
}

export function findModel(providerId: string, modelId: string): { adapter: ProviderAdapter; model: ModelSpec } | null {
  const adapter = provider(providerId);
  const model = adapter?.models().find((m) => m.id === modelId);
  return adapter && model ? { adapter, model } : null;
}

/** Configured models for a capability (mock provider last). */
export function modelsFor(cap: Capability) {
  return PROVIDERS.filter((p) => p.configured()).flatMap((p) => p.models().filter((m) => m.capability === cap).map((m) => ({ provider: p.id, providerName: p.name, isMock: !!p.isMock, ...m })));
}

export function providerStatus() {
  return {
    providers: PROVIDERS.map((p) => ({
      id: p.id,
      name: p.name,
      website: p.website,
      envKeys: p.envKeys,
      isMock: !!p.isMock,
      configured: p.configured(),
      models: p.models(),
    })),
    planned: PLANNED_PROVIDERS,
    llm: { configured: !!process.env.ANTHROPIC_API_KEY, provider: "Anthropic Claude", envKeys: ["ANTHROPIC_API_KEY"] },
  };
}
