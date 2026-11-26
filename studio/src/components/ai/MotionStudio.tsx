"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { Shapes, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { EFFECTS, defaultParams } from "@/lib/motion/effects";
import { EFFECT_KINDS, type EffectKind } from "@/lib/project/schema";
import { newDocument } from "@/lib/project/factory";
import { applyCommands } from "@/lib/project/ops";
import { ProjectComposition } from "@/remotion/ProjectComposition";
import { Badge, Button, Field, Notice, Segmented } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { TemplatesBrowser } from "@/components/projects/TemplatesBrowser";
import { useProviders } from "./useProviders";

function effectDoc(kind: EffectKind) {
  const base = newDocument({ aspect: "16:9", durationSec: 4 });
  const d = EFFECTS[kind];
  const bgTrack = base.tracks.find((t) => t.kind === "video")!;
  const ovTrack = base.tracks.find((t) => t.kind === "overlay")!;
  return applyCommands(base, [
    ...(d.box || d.blendMode === "screen" || d.blendMode === "overlay" ? [{ op: "addClip" as const, trackId: bgTrack.id, clip: { type: "solid", name: "Background", start: 0, duration: 120, color: "#0b0d12", gradient: { kind: "radial", angle: 0, stops: [["#1b1f2e", 0], ["#07080b", 75]] } } }] : []),
    { op: "addClip" as const, trackId: ovTrack.id, clip: { type: "effect", effect: kind, name: d.label, start: 0, duration: 120, params: defaultParams(kind), blendMode: d.blendMode ?? "normal", transform: d.box ? { width: d.box.width, height: d.box.height } : {} } },
  ]).doc;
}

function EffectPreview({ kind, onUse }: { kind: EffectKind; onUse: () => void }) {
  const [hover, setHover] = useState(false);
  const doc = useMemo(() => effectDoc(kind), [kind]);
  const d = EFFECTS[kind];
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="group">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] bg-black">
        {hover ? (
          <Player component={ProjectComposition} inputProps={{ doc }} compositionWidth={1920} compositionHeight={1080} fps={30} durationInFrames={120} autoPlay loop style={{ width: "100%", height: "100%" }} />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-glow-cyan/5 p-4 text-center text-xs text-ink-400">{d.description}</div>
        )}
        <button onClick={onUse} className="absolute bottom-2 right-2 rounded-md bg-accent px-2 py-1 text-[11px] font-medium opacity-0 shadow-glow transition group-hover:opacity-100">Use</button>
      </div>
      <div className="mt-2 flex items-center justify-between px-0.5">
        <span className="text-sm font-medium">{d.label}</span>
        <Badge>{d.category}</Badge>
      </div>
    </div>
  );
}

export function MotionStudio() {
  const router = useRouter();
  const providers = useProviders();
  const [prompt, setPrompt] = useState("Create a 5-second 3D animated logo reveal with metallic silver text \"NOVA\", cinematic lighting, particles, and a black background.");
  const [aspect, setAspect] = useState<"16:9" | "9:16" | "1:1" | "4:5">("16:9");
  const [duration, setDuration] = useState(5);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const r = await api<{ projectId: string; summary: string }>("/api/ai/motion", { method: "POST", body: { prompt, aspect, durationSec: duration } });
      toast.success(r.summary.slice(0, 140));
      router.push(`/editor/${r.projectId}`);
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  }

  async function createFromEffect(kind: EffectKind) {
    const doc = effectDoc(kind);
    const r = await api<{ id: string }>("/api/projects", { method: "POST", body: { name: EFFECTS[kind].label, doc } });
    router.push(`/editor/${r.id}`);
  }

  return (
    <div>
      <div className="mb-8">
        <div className="label mb-2 text-accent-soft">Motion Graphics Studio</div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl"><span className="text-gradient">Motion design without After Effects</span></h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">Kinetic typography, logo reveals, HUDs, charts, particles and light — every element is an editable layer with keyframes, easing curves, presets and loops. Nothing is flattened.</p>
      </div>

      <div className="panel mb-10 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Wand2 className="h-4 w-4 text-accent-soft" /> AI motion graphics generator</div>
        {providers && !providers.llm.configured ? <div className="mb-3"><Notice tone="warning" title="Basic composer (no AI)">Without Claude, the generator composes layers from keywords in your prompt (logo, metallic, neon, particles, glitch, HUD, chart…). Connect ANTHROPIC_API_KEY for full creative generation.</Notice></div> : null}
        <textarea className="field min-h-[90px] text-[15px]" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Field label="Aspect"><div><Segmented size="sm" value={aspect} onChange={setAspect} options={["16:9", "9:16", "1:1", "4:5"].map((a) => ({ value: a as "16:9", label: a }))} /></div></Field>
          <Field label="Duration"><div><Segmented size="sm" value={String(duration)} onChange={(v) => setDuration(Number(v))} options={["3", "5", "8", "10", "15"].map((d) => ({ value: d, label: `${d}s` }))} /></div></Field>
          <Button variant="primary" size="lg" className="ml-auto" loading={busy} icon={<Shapes className="h-4 w-4" />} onClick={generate}>Generate editable animation</Button>
        </div>
      </div>

      <h2 className="mb-4 text-base font-semibold">Motion graphics library</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {EFFECT_KINDS.map((k) => (
          <EffectPreview key={k} kind={k} onUse={() => void createFromEffect(k)} />
        ))}
      </div>

      <h2 className="mb-4 mt-12 text-base font-semibold">Motion templates</h2>
      <TemplatesBrowser />
    </div>
  );
}
