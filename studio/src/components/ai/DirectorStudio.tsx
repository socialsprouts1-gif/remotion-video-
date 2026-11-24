"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clapperboard, FileText, Megaphone, Plus, Sparkles, Trash2, Wand2, Layers } from "lucide-react";
import { api } from "@/lib/api";
import { TRANSITION_TYPES, type ProductionPlan } from "@/lib/project/schema";
import { Badge, Button, Field, Notice, Segmented } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useProviders } from "./useProviders";

type Mode = "director" | "commercial" | "script";
const EXAMPLES = [
  "Create a 20-second premium advertisement for my clothing brand. Start with a cinematic close-up of the product, add smooth camera movement, animated typography, modern transitions, sound effects, and a professional ending.",
  "A cinematic advertisement for a luxury perfume brand with golden lighting, slow-motion liquid splashes, macro product shots, premium typography, and smooth camera movement.",
  "15-second TikTok for a new productivity app: fast cuts, bold kinetic captions, UI close-ups, upbeat electronic music.",
];

interface BrandKit { id: string; name: string }

export function DirectorStudio() {
  const router = useRouter();
  const providers = useProviders();
  const [mode, setMode] = useState<Mode>("director");
  const [brief, setBrief] = useState("");
  const [product, setProduct] = useState({ name: "", description: "", audience: "", style: "cinematic premium", cta: "" });
  const [aspect, setAspect] = useState<"auto" | "16:9" | "9:16" | "1:1" | "4:5">("auto");
  const [duration, setDuration] = useState("");
  const [brandKitId, setBrandKitId] = useState("");
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [engine, setEngine] = useState("");
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);

  useEffect(() => {
    api<{ kits: BrandKit[] }>("/api/brand").then((r) => setKits(r.kits), () => undefined);
  }, []);

  const composedBrief = () => {
    if (mode !== "commercial") return brief;
    return `Product commercial for "${product.name}". ${product.description}. Target audience: ${product.audience || "general"}. Desired style: ${product.style}. ${product.cta ? `End with the call to action "${product.cta}".` : "End with a hero shot and call to action."}`;
  };

  async function generate() {
    const b = composedBrief().trim();
    if (b.length < 3) return toast.error("Describe the video first");
    setLoading(true);
    setPlan(null);
    try {
      const r = await api<{ plan: ProductionPlan; engine: string }>("/api/ai/director", {
        method: "POST",
        body: { brief: b, mode: mode === "script" ? "script" : "brief", aspect: aspect === "auto" ? undefined : aspect, durationSec: duration ? Number(duration) : undefined, brandKitId: brandKitId || undefined },
      });
      setPlan(r.plan);
      setEngine(r.engine);
      setVariants([r.plan.aspectRatio]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function build() {
    if (!plan) return;
    setBuilding(true);
    try {
      const aspects = variants.length ? variants : [plan.aspectRatio];
      const ids: string[] = [];
      for (const a of aspects) {
        const r = await api<{ projectId: string }>("/api/ai/director", {
          method: "POST",
          body: { brief: composedBrief(), plan: { ...plan, aspectRatio: a }, createProject: true, brandKitId: brandKitId || undefined, name: aspects.length > 1 ? `${plan.title} (${a})` : plan.title },
        });
        ids.push(r.projectId);
      }
      if (ids.length === 1) router.push(`/editor/${ids[0]}`);
      else {
        toast.success(`Created ${ids.length} platform variations`);
        router.push("/projects");
      }
    } catch (e) {
      toast.error((e as Error).message);
      setBuilding(false);
    }
  }

  const updScene = (i: number, patch: Partial<ProductionPlan["scenes"][number]>) => setPlan((p) => (p ? { ...p, scenes: p.scenes.map((s, j) => (j === i ? { ...s, ...patch } : s)) } : p));
  const total = plan?.scenes.reduce((s, x) => s + x.durationSec, 0) ?? 0;

  return (
    <div>
      <div className="mb-8">
        <div className="label mb-2 text-accent-soft">AI Studio · Director mode</div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-gradient">Describe it. Direct it. Edit everything.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">The AI Director turns your brief into a production plan — creative direction, scene-by-scene storyboard, camera, lighting, typography and pacing — then builds an editable timeline you can refine, generate footage for, and export.</p>
      </div>

      {providers && !providers.llm.configured ? (
        <div className="mb-6">
          <Notice tone="warning" title="Claude isn't connected — using the basic planner">
            Without ANTHROPIC_API_KEY, plans come from a rule-based planner (no AI) that reads duration, platform and keywords from your brief. The result is clearly labelled and fully editable.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel p-5">
          <div className="mb-4">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "director", label: <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Prompt</span> },
                { value: "commercial", label: <span className="flex items-center gap-1.5"><Megaphone className="h-3.5 w-3.5" /> Product commercial</span> },
                { value: "script", label: <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Script to video</span> },
              ]}
            />
          </div>
          {mode === "commercial" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name"><input className="field" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} placeholder="Aurora Eau de Parfum" /></Field>
              <Field label="Target audience"><input className="field" value={product.audience} onChange={(e) => setProduct({ ...product, audience: e.target.value })} placeholder="Women 25–40, premium gifting" /></Field>
              <Field label="Description" className="sm:col-span-2"><textarea className="field min-h-[80px]" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} placeholder="What it is, what makes it special" /></Field>
              <Field label="Style"><input className="field" value={product.style} onChange={(e) => setProduct({ ...product, style: e.target.value })} /></Field>
              <Field label="Call to action"><input className="field" value={product.cta} onChange={(e) => setProduct({ ...product, cta: e.target.value })} placeholder="Shop the collection" /></Field>
            </div>
          ) : (
            <>
              <textarea
                className="field min-h-[150px] text-[15px] leading-relaxed"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={mode === "script" ? "Paste your full script (narration + scene notes)…" : "Describe the video you want…"}
              />
              {mode === "director" ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {EXAMPLES.map((ex) => (
                    <button key={ex} onClick={() => setBrief(ex)} className="max-w-xs truncate rounded-full border border-white/[0.08] px-3 py-1 text-[11px] text-ink-300 hover:border-accent/40 hover:text-white">
                      {ex}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
          <div className="mt-5 flex flex-wrap items-end gap-4">
            <Field label="Aspect">
              <div><Segmented size="sm" value={aspect} onChange={setAspect} options={[{ value: "auto", label: "Auto" }, { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" }, { value: "4:5", label: "4:5" }]} /></div>
            </Field>
            <Field label="Duration (s)">
              <input className="field w-24" type="number" min={3} max={600} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="auto" />
            </Field>
            <Field label="Brand kit">
              <select className="field w-44" value={brandKitId} onChange={(e) => setBrandKitId(e.target.value)}>
                <option value="">None</option>
                {kits.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </Field>
            <Button variant="primary" size="lg" className="ml-auto" loading={loading} icon={<Wand2 className="h-4 w-4" />} onClick={generate}>
              Generate storyboard
            </Button>
          </div>
        </div>

        <div className="panel p-5 text-sm">
          <div className="label mb-3">How it works</div>
          <ol className="space-y-3 text-ink-300">
            {["Brief → production plan (category, creative direction, palette, typography, music, pacing)", "Plan → editable storyboard: tweak any scene, prompt, camera or transition", "Build → timeline with scene slots, animated titles, transitions and style overlays", "Generate footage per scene with a connected video model, or drop in your own", "Refine with the editing assistant, then export"].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent-soft">{i + 1}</span>
                <span className="text-xs leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="shimmer h-48 rounded-2xl" />)}
        </div>
      ) : null}

      {plan ? (
        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold">{plan.title}</h2>
                <Badge tone={engine === "claude" ? "accent" : "warning"}>{engine === "claude" ? "Claude" : "Basic planner (no AI)"}</Badge>
              </div>
              <div className="mt-1 text-sm text-ink-300">{plan.category} · {plan.aspectRatio} · {total.toFixed(1)}s · {plan.scenes.length} scenes</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-ink-300">
                <Layers className="h-3.5 w-3.5" /> Platforms:
                {(["16:9", "9:16", "1:1", "4:5"] as const).map((a) => (
                  <button key={a} onClick={() => setVariants((v) => (v.includes(a) ? v.filter((x) => x !== a) : [...v, a]))} className={cn("rounded-md border px-2 py-0.5", variants.includes(a) ? "border-accent/60 bg-accent/15 text-white" : "border-white/10 text-ink-400")}>
                    {a}
                  </button>
                ))}
              </div>
              <Button variant="primary" loading={building} icon={<Clapperboard className="h-4 w-4" />} onClick={build}>
                {variants.length > 1 ? `Build ${variants.length} versions` : "Build timeline"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="panel mb-5 grid gap-4 p-5 md:grid-cols-[1fr_auto]">
            <div>
              <div className="label mb-1">Creative direction</div>
              <p className="text-sm text-ink-100">{plan.creativeDirection.summary}</p>
              <div className="mt-3 grid gap-x-6 gap-y-1 text-xs text-ink-300 sm:grid-cols-2">
                <div><span className="text-ink-500">Style</span> {plan.creativeDirection.visualStyle}</div>
                <div><span className="text-ink-500">Lighting</span> {plan.creativeDirection.lighting}</div>
                <div><span className="text-ink-500">Music</span> {plan.creativeDirection.music}</div>
                <div><span className="text-ink-500">Pacing</span> {plan.creativeDirection.pacing}</div>
                <div><span className="text-ink-500">Type</span> {plan.creativeDirection.typography.headline} / {plan.creativeDirection.typography.body}</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {plan.creativeDirection.palette.map((c) => (
                <div key={c} className="h-14 w-9 rounded-lg border border-white/10" style={{ background: c }} title={c} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plan.scenes.map((s, i) => (
              <div key={i} className="panel flex flex-col p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15 text-xs font-bold text-accent-soft">{i + 1}</span>
                  <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" value={s.title} onChange={(e) => updScene(i, { title: e.target.value })} />
                  <input className="field-sm w-16 text-right" type="number" step={0.5} min={0.5} value={s.durationSec} onChange={(e) => updScene(i, { durationSec: Number(e.target.value) })} />
                  <span className="text-[10px] text-ink-500">s</span>
                </div>
                <div className="mb-3 h-1 overflow-hidden rounded-full" style={{ background: `linear-gradient(90deg, ${plan.creativeDirection.palette.join(",")})` }} />
                <label className="label mb-1">Visual prompt</label>
                <textarea className="field mb-2 min-h-[84px] text-xs" value={s.visualPrompt} onChange={(e) => updScene(i, { visualPrompt: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="label">Camera</label><input className="field-sm mt-1" value={s.camera} onChange={(e) => updScene(i, { camera: e.target.value })} /></div>
                  <div><label className="label">Transition in</label>
                    <select className="field-sm mt-1" value={s.transition} onChange={(e) => updScene(i, { transition: e.target.value as typeof s.transition })}>
                      {TRANSITION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <label className="label mb-1 mt-2">On-screen text</label>
                <input className="field-sm" value={s.onScreenText} onChange={(e) => updScene(i, { onScreenText: e.target.value })} placeholder="(none)" />
                <p className="mt-2 line-clamp-3 text-[11px] text-ink-400">{s.description}</p>
                <button className="mt-auto self-end pt-2 text-ink-500 hover:text-rose-300" title="Remove scene" onClick={() => setPlan({ ...plan, scenes: plan.scenes.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setPlan({ ...plan, scenes: [...plan.scenes, { title: "New scene", durationSec: 3, description: "", visualPrompt: "", camera: "", lighting: "", onScreenText: "", transition: "fade", motion: "" }] })}
              className="flex min-h-[200px] items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-sm text-ink-400 hover:border-accent/40 hover:text-white"
            >
              <Plus className="h-4 w-4" /> Add scene
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
