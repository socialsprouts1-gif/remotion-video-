"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { AssetDto } from "@/server/services/assets";

export type Asset = AssetDto;

export const useAssets = create<{ assets: Asset[]; loaded: boolean; load(): Promise<void>; add(a: Asset): void; byId(id: string): Asset | undefined }>((set, get) => ({
  assets: [],
  loaded: false,
  async load() {
    const r = await api<{ assets: Asset[] }>("/api/assets");
    set({ assets: r.assets, loaded: true });
  },
  add: (a) => set({ assets: [a, ...get().assets.filter((x) => x.id !== a.id)] }),
  byId: (id) => get().assets.find((a) => a.id === id),
}));

/** Build an addClip payload for an asset at a given frame. */
export function clipFromAsset(a: Asset, start: number, fps: number, canvas: { width: number; height: number }) {
  const srcFrames = a.durationSec ? Math.max(1, Math.round(a.durationSec * fps)) : null;
  if (a.kind === "AUDIO") return { type: "audio" as const, name: a.name, assetId: a.id, src: a.src, start, duration: srcFrames ?? fps * 5, sourceDuration: srcFrames };
  if (a.kind === "IMAGE") {
    // logos / images that don't match the canvas get a contained box instead of full-frame
    const fitsFrame = a.width && a.height && Math.abs(a.width / a.height - canvas.width / canvas.height) < 0.05;
    const box = !fitsFrame && a.width && a.height ? (() => { const k = Math.min((canvas.width * 0.6) / a.width, (canvas.height * 0.6) / a.height); return { width: Math.round(a.width * k), height: Math.round(a.height * k) }; })() : {};
    return { type: "image" as const, name: a.name, assetId: a.id, src: a.src, start, duration: fps * 5, fit: fitsFrame ? ("cover" as const) : ("contain" as const), transform: box };
  }
  return { type: "video" as const, name: a.name, assetId: a.id, src: a.src, start, duration: srcFrames ?? fps * 5, sourceDuration: srcFrames, muted: a.hasAudio === false };
}
