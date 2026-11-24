"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Download, Sparkles, XCircle, Plug } from "lucide-react";
import { api, timeAgo } from "@/lib/api";
import { Badge, Button, Field, Notice, Progress, Segmented } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { createProjectFromAsset } from "@/components/assets/AssetsLibrary";
import { useAssets, type Asset } from "@/components/editor/assets-store";
import { modelsFor, useProviders, type AiJob } from "./useProviders";

export interface CapabilityTab { capability: string; label: string; promptLabel?: string; placeholder?: string; needsImage?: boolean; needsAudio?: boolean; needsVideoOrAudio?: boolean }

const CAMERA_PRESETS = ["", "slow cinematic dolly-in", "dolly-out reveal", "orbit around subject", "tracking shot", "crane up", "aerial drone shot", "handheld", "pan left", "pan right", "tilt up", "tilt down", "slow zoom in", "FPV fly-through", "slow-motion"];
const STYLES = ["", "cinematic", "photorealistic", "3D render", "anime", "claymation", "watercolor", "neon cyberpunk", "minimal product studio", "documentary"];

function AssetPicker({ kind, value, onChange, label }: { kind: "IMAGE" | "AUDIO" | "MEDIA"; value: string; onChange: (id: string) => void; label: string }) {
  const { assets, loaded, load } = useAssets();
  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);
  const list = assets.filter((a) => (kind === "MEDIA" ? a.kind === "VIDEO" || a.kind === "AUDIO" : a.kind === kind));
  return (
    <Field label={label} hint={list.length ? undefined : `Upload a ${kind === "IMAGE" ? "image" : "video/audio file"} in the Assets Library first.`}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {list.slice(0, 30).map((a) => (
          <button key={a.id} onClick={() => onChange(a.id === value ? "" : a.id)} className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-ink-850 text-[10px]", a.id === value ? "border-accent ring-2 ring-accent/40" : "border-white/[0.08]")} title={a.name}>
            {a.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.poster} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="block truncate px-1">{a.name}</span>
            )}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function GenerationStudio({ tabs }: { tabs: CapabilityTab[] }) {
  const router = useRouter();
  const providers = useProviders();
  const [tab, setTab] = useState(tabs[0].capability);
  const cfg = tabs.find((t) => t.capability === tab)!;
  const models = useMemo(() => modelsFor(providers, tab), [providers, tab]);
  const [modelKey, setModelKey] = useState("");
  const model = models.find((m) => `${m.provider}/${m.id}` === modelKey) ?? models[0];
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [duration, setDuration] = useState<number | undefined>();
  const [aspect, setAspect] = useState<string | undefined>();
  const [seed, setSeed] = useState("");
  const [camera, setCamera] = useState("");
  const [style, setStyle] = useState("");
  const [motion, setMotion] = useState(0.5);
  const [voice, setVoice] = useState("");
  const [imageId, setImageId] = useState("");
  const [lastId, setLastId] = useState("");
  const [mediaId, setMediaId] = useState("");
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [busy, setBusy] = useState(false);
  const addAsset = useAssets((s) => s.add);

  const loadJobs = useCallback(() => api<{ jobs: AiJob[] }>(`/api/ai/jobs?capability=${tab}`).then((r) => setJobs(r.jobs), () => undefined), [tab]);
  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);
  useEffect(() => {
    if (!jobs.some((j) => j.status === "QUEUED" || j.status === "RUNNING")) return;
    const t = setInterval(async () => {
      const before = new Set(jobs.filter((j) => j.status === "SUCCEEDED").map((j) => j.id));
      const r = await api<{ jobs: AiJob[] }>(`/api/ai/jobs?capability=${tab}`).catch(() => null);
      if (!r) return;
      setJobs(r.jobs);
      for (const j of r.jobs) if (j.status === "SUCCEEDED" && !before.has(j.id)) j.output?.assets?.forEach(addAsset);
    }, 2500);
    return () => clearInterval(t);
  }, [jobs, tab, addAsset]);

  useEffect(() => {
    setDuration(model?.durations?.[0]);
    setAspect(model?.aspectRatios?.[0]);
    setVoice(model?.voices?.[0]?.id ?? "");
  }, [model?.id, model?.provider]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    if (!model) return;
    const fullPrompt = [prompt, style ? `Style: ${style}` : "", camera ? `Camera: ${camera}` : "", tab.includes("video") ? `Motion intensity: ${motion < 0.34 ? "subtle" : motion < 0.67 ? "moderate" : "high"}` : ""].filter(Boolean).join(". ");
    setBusy(true);
    try {
      const { job } = await api<{ job: AiJob }>("/api/ai/jobs", {
        method: "POST",
        body: {
          provider: model.provider,
          model: model.id,
          capability: tab,
          input: {
            prompt: tab === "text-to-speech" || tab === "background-removal" || tab === "speech-to-text" ? prompt : fullPrompt,
            negativePrompt: model.negativePrompt && negative ? negative : undefined,
            durationSec: duration,
            aspectRatio: aspect,
            seed: model.seed && seed ? Number(seed) : undefined,
            voiceId: voice || undefined,
            imageAssetId: imageId || undefined,
            lastFrameAssetId: model.lastFrame && lastId ? lastId : undefined,
            ...(cfg.needsVideoOrAudio && mediaId ? { videoAssetId: mediaId } : {}),
            camera: camera || undefined,
            motionIntensity: tab.includes("video") ? motion : undefined,
          },
        },
      });
      setJobs((j) => [job, ...j]);
      toast.success(`Queued · ${job.costCredits} credits`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const planned = providers?.planned.filter((p) => p.capabilities.includes(tab)) ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="panel h-fit space-y-5 p-5">
        {tabs.length > 1 ? <Segmented value={tab} onChange={setTab} options={tabs.map((t) => ({ value: t.capability, label: t.label }))} /> : null}
        {!providers ? (
          <div className="shimmer h-32 rounded-xl" />
        ) : !models.length ? (
          <Notice tone="warning" title="Integration required">
            No connected provider offers <b>{cfg.label.toLowerCase()}</b>. Add an API key on the server (see Settings → Integrations).
            {planned.length ? <> Planned adapters: {planned.map((p) => p.name).join(", ")}.</> : null}
          </Notice>
        ) : (
          <>
            <Field label="Model">
              <select className="field" value={model ? `${model.provider}/${model.id}` : ""} onChange={(e) => setModelKey(e.target.value)}>
                {models.map((m) => (
                  <option key={`${m.provider}/${m.id}`} value={`${m.provider}/${m.id}`}>
                    {m.providerName} · {m.label}{m.isMock ? " — DEV MOCK (not AI)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            {model?.isMock ? <Notice tone="warning" title="Development mock provider">Produces labelled synthetic test media so you can exercise the pipeline. It is not AI output.</Notice> : model && !model.verified ? <p className="-mt-3 text-[11px] text-amber-300/80">Model id “{model.id}” is configurable and unverified against the provider&apos;s live catalogue.</p> : null}

            {cfg.needsImage || model?.firstFrame ? <AssetPicker kind="IMAGE" label={cfg.needsImage ? "Input image" : "First frame / reference (optional)"} value={imageId} onChange={setImageId} /> : null}
            {model?.lastFrame ? <AssetPicker kind="IMAGE" label="Last frame (optional)" value={lastId} onChange={setLastId} /> : null}
            {cfg.needsVideoOrAudio ? <AssetPicker kind="MEDIA" label="Source audio / video" value={mediaId} onChange={setMediaId} /> : null}

            {tab !== "background-removal" && tab !== "speech-to-text" ? (
              <Field label={cfg.promptLabel ?? "Prompt"}>
                <textarea className="field min-h-[110px]" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={cfg.placeholder} />
              </Field>
            ) : null}
            {model?.negativePrompt ? (
              <Field label="Negative prompt">
                <input className="field" value={negative} onChange={(e) => setNegative(e.target.value)} placeholder="blurry, distorted, text, watermark" />
              </Field>
            ) : null}
            {tab.includes("video") || tab === "text-to-image" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Style"><select className="field" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLES.map((s) => <option key={s} value={s}>{s || "Default"}</option>)}</select></Field>
                {tab.includes("video") ? <Field label="Camera"><select className="field" value={camera} onChange={(e) => setCamera(e.target.value)}>{CAMERA_PRESETS.map((s) => <option key={s} value={s}>{s || "Default"}</option>)}</select></Field> : null}
              </div>
            ) : null}
            {tab.includes("video") ? (
              <Field label={`Motion intensity · ${motion < 0.34 ? "subtle" : motion < 0.67 ? "moderate" : "high"}`} hint="Sent as prompt guidance — only some models expose a motion parameter.">
                <input type="range" className="w-full" min={0} max={1} step={0.01} value={motion} onChange={(e) => setMotion(Number(e.target.value))} />
              </Field>
            ) : null}
            <div className="flex flex-wrap gap-4">
              {model?.durations ? (
                <Field label="Duration">
                  <div><Segmented size="sm" value={String(duration)} onChange={(v) => setDuration(Number(v))} options={model.durations.map((d) => ({ value: String(d), label: `${d}s` }))} /></div>
                </Field>
              ) : null}
              {model?.aspectRatios ? (
                <Field label="Aspect">
                  <div><Segmented size="sm" value={aspect ?? ""} onChange={setAspect} options={model.aspectRatios.map((a) => ({ value: a, label: a }))} /></div>
                </Field>
              ) : null}
              {model?.seed ? (
                <Field label="Seed"><input className="field w-28" value={seed} onChange={(e) => setSeed(e.target.value.replace(/\D/g, ""))} placeholder="random" /></Field>
              ) : null}
            </div>
            {model?.voices ? (
              <Field label="Voice">
                <select className="field" value={voice} onChange={(e) => setVoice(e.target.value)}>
                  {model.voices.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </Field>
            ) : null}
            <Button variant="primary" size="lg" className="w-full" loading={busy} icon={<Sparkles className="h-4 w-4" />} onClick={submit} disabled={(cfg.needsImage && !imageId) || (cfg.needsVideoOrAudio && !mediaId)}>
              Generate
            </Button>
          </>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">History</h2>
          <span className="text-xs text-ink-400">{jobs.length} jobs</span>
        </div>
        {!jobs.length ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center text-sm text-ink-400">
            <Plug className="mb-3 h-6 w-6" />
            Your generations will appear here with progress, cost and results.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} onOpen={async (a) => { const id = await createProjectFromAsset(a); router.push(`/editor/${id}`); }} onCancel={async () => { await api(`/api/ai/jobs/${j.id}/cancel`, { method: "POST" }).catch((e) => toast.error(e.message)); void loadJobs(); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, onOpen, onCancel }: { job: AiJob; onOpen: (a: Asset) => void; onCancel: () => void }) {
  const a = job.output?.assets?.[0];
  const running = job.status === "QUEUED" || job.status === "RUNNING";
  const transcript = job.output?.transcript as { text?: string } | undefined;
  return (
    <div className="panel overflow-hidden">
      <div className="flex aspect-video items-center justify-center bg-black/50">
        {a ? (
          a.kind === "VIDEO" ? <video src={a.src} controls loop className="h-full w-full object-contain" /> : a.kind === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.src} alt="" className="h-full w-full object-contain" />
          ) : <audio src={a.src} controls className="w-11/12" />
        ) : running ? (
          <div className="w-2/3 text-center">
            <div className="shimmer mb-3 h-2 rounded-full" />
            <Progress value={job.progress} />
            <div className="mt-2 text-xs text-ink-400">{job.status === "QUEUED" ? "Queued" : "Generating"}…</div>
          </div>
        ) : transcript ? (
          <div className="max-h-full overflow-y-auto p-3 text-xs text-ink-200">{transcript.text ?? JSON.stringify(transcript).slice(0, 400)}</div>
        ) : (
          <div className="p-4 text-center text-xs text-rose-300">{job.error ?? job.status.toLowerCase()}</div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <div className="line-clamp-2 text-xs text-ink-200">{job.input.prompt || job.capability}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={job.status === "SUCCEEDED" ? "success" : job.status === "FAILED" ? "danger" : running ? "info" : "default"}>{job.status.toLowerCase()}</Badge>
          <Badge>{job.provider === "mock" ? "dev mock" : job.provider}</Badge>
          <Badge>{job.costCredits} cr</Badge>
          <span className="ml-auto text-[10px] text-ink-500">{timeAgo(job.createdAt)}</span>
        </div>
        <div className="flex gap-1.5">
          {running ? <Button size="xs" variant="danger" icon={<XCircle className="h-3 w-3" />} onClick={onCancel}>Cancel</Button> : null}
          {a ? (
            <>
              {a.kind !== "AUDIO" ? <Button size="xs" variant="outline" icon={<Clapperboard className="h-3 w-3" />} onClick={() => onOpen(a)}>Edit in project</Button> : null}
              <a href={a.src} download className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-ink-300 hover:bg-white/5"><Download className="h-3 w-3" /> Save</a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
