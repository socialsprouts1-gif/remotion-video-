"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { ModelSpec } from "@/server/ai/types";

export interface ProviderInfo { id: string; name: string; website: string; envKeys: string[]; isMock: boolean; configured: boolean; models: ModelSpec[] }
export interface ProvidersResponse { providers: ProviderInfo[]; planned: { id: string; name: string; envKeys: string[]; capabilities: string[] }[]; llm: { configured: boolean; provider: string; envKeys: string[] } }

const useStore = create<{ data: ProvidersResponse | null; load(): Promise<void> }>((set, get) => ({
  data: null,
  async load() {
    if (get().data) return;
    set({ data: await api<ProvidersResponse>("/api/ai/providers") });
  },
}));

export function useProviders() {
  const data = useStore((s) => s.data);
  const load = useStore((s) => s.load);
  useEffect(() => {
    void load().catch(() => undefined);
  }, [load]);
  return data;
}

export interface ModelOption extends ModelSpec { provider: string; providerName: string; isMock: boolean }

export function modelsFor(data: ProvidersResponse | null, capability: string): ModelOption[] {
  if (!data) return [];
  return data.providers
    .filter((p) => p.configured)
    .flatMap((p) => p.models.filter((m) => m.capability === capability).map((m) => ({ ...m, provider: p.id, providerName: p.name, isMock: p.isMock })))
    .sort((a, b) => Number(a.isMock) - Number(b.isMock));
}

export interface AiJob {
  id: string;
  capability: string;
  provider: string;
  model: string | null;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED";
  progress: number;
  error: string | null;
  costCredits: number;
  input: { prompt?: string; context?: Record<string, unknown> | null } & Record<string, unknown>;
  output: { assets?: import("@/server/services/assets").AssetDto[]; transcript?: unknown } | null;
  createdAt: string;
}

/** Poll a set of AI jobs until they finish. Calls onDone once per finished job. */
export function useJobPolling(ids: string[], onDone: (job: AiJob) => void) {
  const [jobs, setJobs] = useState<Record<string, AiJob>>({});
  const key = ids.join(",");
  useEffect(() => {
    if (!ids.length) return;
    let stop = false;
    const finished = new Set<string>();
    const tick = async () => {
      for (const id of ids) {
        if (finished.has(id)) continue;
        try {
          const { job } = await api<{ job: AiJob }>(`/api/ai/jobs/${id}`);
          setJobs((j) => ({ ...j, [id]: job }));
          if (["SUCCEEDED", "FAILED", "CANCELED"].includes(job.status)) {
            finished.add(id);
            onDone(job);
          }
        } catch {
          /* transient */
        }
      }
      if (!stop && finished.size < ids.length) setTimeout(tick, 2500);
    };
    void tick();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return jobs;
}
