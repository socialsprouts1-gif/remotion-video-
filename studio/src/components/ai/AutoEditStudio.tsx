"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clapperboard, Film, Music, Scissors, Sparkles, Trash2, UploadCloud, Wand2, BookmarkPlus } from "lucide-react";
import { api, formatDuration } from "@/lib/api";
import { BUILTIN_STYLES, type StyleProfile } from "@/lib/ai/edit-styles";
import { cn } from "@/lib/cn";
import { Badge, Button, Field, Notice, Progress, Segmented } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useAssets, type Asset } from "@/components/editor/assets-store";
import { useUploader } from "@/components/editor/panels/MediaPanel";
import { useJobPolling, useProviders, type AiJob } from "./useProviders";

interface CustomStyle { id: string; name: string; description: string; profile: StyleProfile }
interface AutoOutput { stage?: string; projectId?: string; summary?: string; engine?: string; notes?: string[]; styleProfile?: StyleProfile | null }

function AssetTile({ a, selected, onClick, badge }: { a: Asset; selected: boolean; onClick: () => void; badge?: string }) {
  return (
    <button onClick={onClick} className={cn("relative w-36 shrink-0 overflow-hidden rounded-lg border bg-ink-850 text-left transition", selected ? "border-accent ring-2 ring-accent/40" : "border-white/[0.08] hover:border-white/20")}>
      <div className="flex h-20 items-center justify-center bg-black/40">
        {a.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.poster} alt="" className="h-full w-full object-cover" />
        ) : a.kind === "AUDIO" ? <Music className="h-5 w-5 text-emerald-300/70" /> : <Film className="h-5 w-5" />}
      </div>
      <div className="truncate px-2 py-1 text-[10px]">{a.name}</div>
      {a.durationSec ? <span className="absolute right-1 top-1 rounded bg-black/70 px-1 text-[9px]">{formatDuration(a.durationSec)}</span> : null}
      {selected ? <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold">{badge ?? <Check className="h-3 w-3" />}</span> : null}
    </button>
  );
}

export function AutoEditStudio() {
  const router = useRouter();
  const providers = useProviders();
  const { assets, loaded, load } = useAssets();
  const { upload, uploads } = useUploader();
  const fileRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [styleId, setStyleId] = useState("reels");
  const [custom, setCustom] = useState<CustomStyle[]>([]);
  const [prompt, setPrompt] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [music, setMusic] = useState<string | null>(null);
  const [aspect, setAspect] = useState<"16:9" | "9:16" | "1:1" | "4:5">("9:16");
  const [duration, setDuration] = useState("30");
  const [captions, setCaptions] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadStyles = () => api<{ styles: CustomStyle[] }>("/api/styles").then((r) => setCustom(r.styles), () => undefined);
  useEffect(() => {
    if (!loaded) void load();
    void loadStyles();
  }, [loaded, load]);

  const jobs = useJobPolling(jobId ? [jobId] : [], (job) => {
    if (job.status === "SUCCEEDED") toast.success("Your edit is ready");
    else if (job.status === "FAILED") toast.error(job.error ?? "Auto edit failed");
  });
  const job: AiJob | undefined = jobId ? jobs[jobId] : undefined;
  const out = (job?.output ?? {}) as AutoOutput;
  const running = !!jobId && (!job || job.status === "QUEUED" || job.status === "RUNNING");

  const vids = assets.filter((a) => a.kind === "VIDEO");
  const audios = assets.filter((a) => a.kind === "AUDIO" || (a.kind === "VIDEO" && a.hasAudio));
  const totalSel = videos.reduce((s, id) => s + (assets.find((a) => a.id === id)?.durationSec ?? 0), 0);

  async function start() {
    if (!videos.length) return toast.error("Pick at least one video");
    setBusy(true);
    try {
      const r = await api<{ job: AiJob }>("/api/ai/auto-edit", {
        method: "POST",
        body: { assetIds: videos, styleId, prompt, referenceAssetId: reference, musicAssetId: music, aspect, targetDurationSec: duration === "auto" ? null : Number(duration), captions },
      });
      setJobId(r.job.id);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveStyle(p: StyleProfile) {
    const name = prompt_(`Name this style`, p.name || "My style");
    if (!name) return;
    await api("/api/styles", { method: "POST", body: { name, profile: p, sourceAssetId: reference } });
    toast.success("Saved to your style library");
    void loadStyles();
  }

  return (
    <div>
      <div className="mb-8">
        <div className="label mb-2 text-accent-soft">Auto Edit</div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl"><span className="text-gradient">Raw footage in. A real edit out.</span></h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">Upload your clips, pick a style (or describe one, or give a reference video). Lumora finds shots, silences and beats; Claude watches your footage and cuts it like an editor — then you fine-tune everything on the timeline.</p>
      </div>

      {providers && !providers.llm.configured ? (
        <div className="mb-6"><Notice tone="warning" title="Basic auto edit (no AI)">Without Claude, the editor removes silences, cuts at shot changes and paces to the style — but can't understand your footage. Add ANTHROPIC_API_KEY for real AI edits.</Notice></div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {/* 1. footage */}
          <section className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">1 · Your footage <span className="font-normal text-ink-400">(in order — click to select)</span></h2>
              <Button size="sm" icon={<UploadCloud className="h-3.5 w-3.5" />} onClick={() => fileRef.current?.click()}>Upload</Button>
              <input ref={fileRef} type="file" multiple accept="video/*,audio/*" className="hidden" onChange={async (e) => {
                if (!e.target.files) return;
                const done = await upload(e.target.files);
                e.target.value = "";
                setVideos((v) => [...v, ...done.filter((a) => a.kind === "VIDEO").map((a) => a.id)]);
              }} />
            </div>
            {uploads.map((u) => (
              <div key={u.id} className="mb-2"><div className="mb-1 text-[11px] text-ink-300">{u.name} · {u.stage}</div><Progress value={u.progress} /></div>
            ))}
            {vids.length ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {vids.map((a) => (
                  <AssetTile key={a.id} a={a} selected={videos.includes(a.id)} badge={String(videos.indexOf(a.id) + 1)} onClick={() => setVideos((v) => (v.includes(a.id) ? v.filter((x) => x !== a.id) : [...v, a.id]))} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-ink-400">Upload your raw clips to start.</p>
            )}
            {videos.length ? <div className="mt-1 text-xs text-ink-400">{videos.length} clip(s) · {formatDuration(totalSel)} of footage</div> : null}
          </section>

          {/* 2. style */}
          <section className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold">2 · Editing style</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {BUILTIN_STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyleId(s.id)} className={cn("rounded-xl border p-3 text-left transition", styleId === s.id ? "border-accent/70 bg-accent/10" : "border-white/[0.07] hover:border-white/20")}>
                  <div className="text-lg">{s.emoji}</div>
                  <div className="mt-1 text-sm font-semibold">{s.name}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-ink-400">{s.description}</div>
                </button>
              ))}
              {custom.map((s) => (
                <div key={s.id} className={cn("relative rounded-xl border p-3 text-left transition", styleId === `custom:${s.id}` ? "border-accent/70 bg-accent/10" : "border-white/[0.07] hover:border-white/20")}>
                  <button className="w-full text-left" onClick={() => setStyleId(`custom:${s.id}`)}>
                    <div className="text-lg">⭐</div>
                    <div className="mt-1 text-sm font-semibold">{s.name}</div>
                    <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-400">{s.description}</div>
                  </button>
                  <button title="Delete style" className="absolute right-2 top-2 text-ink-500 hover:text-rose-300" onClick={async () => { if (confirm(`Delete style “${s.name}”?`)) { await api(`/api/styles/${s.id}`, { method: "DELETE" }); void loadStyles(); } }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Field label="Describe the edit (optional)" className="mt-4">
              <textarea className="field min-h-[90px]" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. 30-second energetic reel for my clothing brand. Open with the best outfit shot, cut on the beat, add “New Drop” title and end with “Shop now”." />
            </Field>
          </section>

          {/* 3. reference + music */}
          <section className="panel p-5">
            <h2 className="mb-1 text-sm font-semibold">3 · Reference & music <span className="font-normal text-ink-400">(optional)</span></h2>
            <p className="mb-3 text-xs text-ink-400">A reference video teaches the AI a style (pacing, transitions, grade, text). Only the style is used — never its content. You can save it to your style library afterwards.</p>
            <div className="mb-1 text-[11px] font-medium text-ink-300">Reference video</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {vids.filter((a) => !videos.includes(a.id)).map((a) => (
                <AssetTile key={a.id} a={a} selected={reference === a.id} onClick={() => setReference(reference === a.id ? null : a.id)} />
              ))}
              {!vids.filter((a) => !videos.includes(a.id)).length ? <p className="text-xs text-ink-500">Upload a reference video (not selected as footage) to use it here.</p> : null}
            </div>
            <div className="mb-1 mt-3 text-[11px] font-medium text-ink-300">Music (cuts sync to its beats in beat-based styles)</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {audios.filter((a) => !videos.includes(a.id) && a.id !== reference).map((a) => (
                <AssetTile key={a.id} a={a} selected={music === a.id} onClick={() => setMusic(music === a.id ? null : a.id)} />
              ))}
              {!audios.length ? <p className="text-xs text-ink-500">Upload an MP3/WAV to add music.</p> : null}
            </div>
          </section>
        </div>

        {/* settings + run */}
        <aside className="space-y-4">
          <div className="panel space-y-4 p-5">
            <Field label="Format">
              <div><Segmented value={aspect} onChange={setAspect} options={[{ value: "9:16", label: "9:16 Reel" }, { value: "16:9", label: "16:9" }, { value: "1:1", label: "1:1" }, { value: "4:5", label: "4:5" }]} /></div>
            </Field>
            <Field label="Length">
              <div><Segmented value={duration} onChange={setDuration} options={["15", "30", "60", "90", "auto"].map((d) => ({ value: d, label: d === "auto" ? "Auto" : `${d}s` }))} /></div>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={captions} onChange={(e) => setCaptions(e.target.checked)} /> Auto captions <span className="text-xs text-ink-500">(needs ElevenLabs key)</span>
            </label>
            <Button variant="primary" size="lg" className="w-full" loading={busy || running} icon={<Scissors className="h-4 w-4" />} onClick={start} disabled={!videos.length}>
              {running ? "Editing…" : "Auto edit my video"}
            </Button>
            <p className="text-[11px] text-ink-500">Uses 15 Lumora credits. With Claude, one auto edit typically costs about ₹15–30 of API usage (frames + plan). Analysis runs locally for free.</p>
          </div>

          {job ? (
            <div className="panel space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Progress</div>
                <Badge tone={job.status === "SUCCEEDED" ? "success" : job.status === "FAILED" ? "danger" : "info"}>{job.status.toLowerCase()}</Badge>
              </div>
              {running ? <Progress value={job.progress} /> : null}
              <div className="text-xs text-ink-300">{job.status === "FAILED" ? job.error : out.stage}</div>
              {job.status === "QUEUED" ? <p className="text-[11px] text-amber-300/80">Waiting for the worker — make sure <code>npm run worker</code> is running.</p> : null}
              {out.summary ? <p className="text-xs leading-relaxed text-ink-200">{out.summary}</p> : null}
              {out.engine ? <Badge tone={out.engine === "claude" ? "accent" : "warning"}>{out.engine === "claude" ? "Claude edit" : "Basic editor (no AI)"}</Badge> : null}
              {out.notes?.map((n) => <p key={n} className="text-[11px] text-amber-200/80">• {n}</p>)}
              {out.projectId ? (
                <Button variant="primary" className="w-full" icon={<Clapperboard className="h-4 w-4" />} onClick={() => router.push(`/editor/${out.projectId}`)}>Open in editor</Button>
              ) : null}
              {out.styleProfile ? (
                <Button variant="outline" className="w-full" icon={<BookmarkPlus className="h-4 w-4" />} onClick={() => saveStyle(out.styleProfile!)}>Save reference style to library</Button>
              ) : null}
            </div>
          ) : (
            <div className="panel space-y-2 p-5 text-xs text-ink-300">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Wand2 className="h-4 w-4 text-accent-soft" /> What happens</div>
              <p>1. Shots, silences and music beats are detected on your machine.</p>
              <p>2. Speech is transcribed (if a speech key is set) so cuts land between words.</p>
              <p>3. Claude watches sampled frames, reads the analysis and plans the edit.</p>
              <p>4. You get an editable timeline: cuts, zooms, transitions, titles, captions, grade, music.</p>
              <p className="flex items-center gap-1 pt-1 text-ink-400"><Sparkles className="h-3 w-3" /> Then refine with the AI assistant in the editor.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function prompt_(q: string, d: string) {
  return typeof window === "undefined" ? null : window.prompt(q, d);
}
