"use client";
import { useEffect, useRef, useState } from "react";
import { Bot, Check, Clapperboard, Captions, Send, Sparkles, X, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { applyCommands, describeCommand, allClips, type EditCommand } from "@/lib/project/ops";
import { captionClips, wordsFromTranscript } from "@/lib/ai/captions";
import { cn } from "@/lib/cn";
import { Badge, Button, Notice, Progress, Segmented } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { modelsFor, useJobPolling, useProviders, type AiJob } from "@/components/ai/useProviders";
import { useEditor } from "../store";
import { clipFromAsset, useAssets } from "../assets-store";

interface Msg { role: "user" | "assistant"; text: string; commands?: EditCommand[]; requires?: { capability: string; reason: string }[]; engine?: string; status?: "proposed" | "applied" | "discarded"; warnings?: string[] }

const SUGGESTIONS = ["Make it more cinematic", "Add smooth fade transitions", "Make the color grading warmer", "Change the video to 9:16", "Add a title \"Summer Drop\"", "Add zoom effects", "Make the video 1.5x faster", "Create a professional intro"];

export function AIPanel() {
  const [tab, setTab] = useState<"assistant" | "scenes" | "captions">("assistant");
  return (
    <div className="flex h-full flex-col">
      <div className="p-3 pb-0">
        <Segmented size="sm" value={tab} onChange={setTab} options={[{ value: "assistant", label: "Assistant" }, { value: "scenes", label: "Scenes" }, { value: "captions", label: "Captions" }]} />
      </div>
      <div className="min-h-0 flex-1">{tab === "assistant" ? <Assistant /> : tab === "scenes" ? <ScenesTab /> : <CaptionsTab />}</div>
    </div>
  );
}

function Assistant() {
  const providers = useProviders();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);
  useEffect(() => () => useEditor.getState().setPreview(null), []);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const st = useEditor.getState();
    // discard any pending proposal
    st.setPreview(null);
    setMsgs((m) => [...m.map((x) => (x.status === "proposed" ? { ...x, status: "discarded" as const } : x)), { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const r = await api<{ reply: string; commands: EditCommand[]; requires: { capability: string; reason: string }[]; engine: string; preview: { warnings: string[] } }>("/api/ai/assistant", {
        method: "POST",
        body: { projectId: st.projectId, instruction: text, doc: st.doc, selection: st.selection, playhead: st.playhead },
      });
      if (r.commands.length) {
        try {
          st.setPreview(applyCommands(st.doc, r.commands).doc);
        } catch {
          /* preview failed — still allow apply attempt */
        }
      }
      setMsgs((m) => [...m, { role: "assistant", text: r.reply, commands: r.commands, requires: r.requires, engine: r.engine, status: r.commands.length ? "proposed" : undefined, warnings: r.preview.warnings }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", text: (e as Error).message }]);
    } finally {
      setBusy(false);
    }
  }

  function decide(i: number, apply: boolean) {
    const st = useEditor.getState();
    const msg = msgs[i];
    st.setPreview(null);
    if (apply && msg.commands) {
      const r = st.dispatch(msg.commands, `AI: ${msgs[i - 1]?.text.slice(0, 40) ?? "edit"}`);
      if (!r.ok) {
        toast.error(r.error ?? "Couldn't apply — the project changed since the proposal.");
        return;
      }
      if (r.created.length) st.select(r.created);
      toast.success("Applied — press Ctrl+Z to undo");
    }
    setMsgs((m) => m.map((x, j) => (j === i ? { ...x, status: apply ? "applied" : "discarded" } : x)));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {providers && !providers.llm.configured ? (
          <Notice tone="warning" title="Using the built-in command parser">
            Claude isn&apos;t connected, so only common instructions are understood. Add ANTHROPIC_API_KEY for free-form editing.
          </Notice>
        ) : null}
        {msgs.length === 0 ? (
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-ink-300">
              <Bot className="h-4 w-4 text-accent-soft" /> Tell me what to change. I&apos;ll preview it before anything is applied.
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-ink-300 hover:border-accent/50 hover:text-white">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {msgs.map((m, i) => (
          <div key={i} className={cn("rounded-xl px-3 py-2 text-xs leading-relaxed", m.role === "user" ? "ml-6 bg-accent/15 text-ink-100" : "mr-2 bg-ink-850")}>
            {m.role === "assistant" && m.engine ? (
              <div className="mb-1">
                <Badge tone={m.engine === "claude" ? "accent" : "default"}>{m.engine === "claude" ? "Claude" : "Command parser (no AI)"}</Badge>
              </div>
            ) : null}
            <div className="whitespace-pre-wrap">{m.text}</div>
            {m.requires?.length ? (
              <div className="mt-2 space-y-1">
                {m.requires.map((r, j) => (
                  <div key={j} className="flex gap-1.5 text-[11px] text-amber-200/90">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {r.reason}
                  </div>
                ))}
              </div>
            ) : null}
            {m.commands?.length ? (
              <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/20 p-2">
                <div className="label mb-1">{m.commands.length} edit{m.commands.length > 1 ? "s" : ""}</div>
                <ul className="space-y-0.5 text-[11px] text-ink-300">
                  {m.commands.slice(0, 8).map((c, j) => (
                    <li key={j}>• {describeCommand(c, useEditor.getState().doc)}</li>
                  ))}
                  {m.commands.length > 8 ? <li>… and {m.commands.length - 8} more</li> : null}
                </ul>
                {m.warnings?.length ? <div className="mt-1 text-[10px] text-amber-300/80">{m.warnings.join(" · ")}</div> : null}
                {m.status === "proposed" ? (
                  <div className="mt-2 flex gap-1.5">
                    <Button size="xs" variant="primary" icon={<Check className="h-3 w-3" />} onClick={() => decide(i, true)}>Apply</Button>
                    <Button size="xs" variant="ghost" icon={<X className="h-3 w-3" />} onClick={() => decide(i, false)}>Discard</Button>
                    <span className="ml-auto self-center text-[10px] text-ink-500">previewing in player</span>
                  </div>
                ) : (
                  <div className="mt-1.5 text-[10px] text-ink-500">{m.status === "applied" ? "Applied" : "Discarded"}</div>
                )}
              </div>
            ) : null}
          </div>
        ))}
        {busy ? <div className="shimmer h-10 rounded-xl" /> : null}
        <div ref={endRef} />
      </div>
      <form
        className="border-t border-white/[0.05] p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <div className="flex items-end gap-1.5 rounded-xl border border-white/[0.08] bg-ink-850 p-1.5 focus-within:border-accent/50">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
              e.stopPropagation();
            }}
            placeholder="e.g. make the intro punchier and add a warm grade"
            className="min-h-0 flex-1 resize-none bg-transparent px-1.5 py-1 text-xs outline-none"
          />
          <Button size="xs" variant="primary" type="submit" loading={busy} icon={<Send className="h-3 w-3" />} />
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------- scenes */

function ScenesTab() {
  const doc = useEditor((s) => s.doc);
  const providers = useProviders();
  const models = modelsFor(providers, "text-to-video");
  const [model, setModel] = useState("");
  const [jobIds, setJobIds] = useState<string[]>([]);
  const addAsset = useAssets((s) => s.add);
  const scenes = allClips(doc).filter((c) => c.type === "scene");
  const sel = models.find((m) => `${m.provider}/${m.id}` === model) ?? models[0];

  const jobs = useJobPolling(jobIds, (job: AiJob) => {
    const st = useEditor.getState();
    const sceneId = job.input.context?.sceneClipId as string | undefined;
    const scene = sceneId ? allClips(st.doc).find((c) => c.id === sceneId) : undefined;
    if (job.status !== "SUCCEEDED") {
      if (scene) st.dispatch([{ op: "updateClip", clipId: scene.id, patch: { status: "failed", error: job.error ?? "failed" } }], "Scene generation failed");
      toast.error(`Scene generation failed: ${job.error ?? job.status}`);
      return;
    }
    const asset = job.output?.assets?.[0];
    if (!asset) return;
    addAsset(asset);
    if (!scene || scene.type !== "scene") {
      toast.info("Footage generated — it's in your Media library.");
      return;
    }
    const clip = clipFromAsset(asset, scene.start, st.doc.settings.fps, st.doc.settings);
    st.dispatch(
      [
        { op: "addClip", clip: { ...clip, start: scene.start, duration: Math.min(clip.duration, scene.duration), transitionIn: scene.transitionIn, transitionOut: scene.transitionOut, name: `${scene.title} (AI)`, aiJobId: job.id } },
        { op: "removeClips", clipIds: [scene.id] },
      ],
      `Generated footage: ${scene.title}`,
    );
    toast.success(`Scene “${scene.title}” generated`);
  });

  async function generate(sceneId: string) {
    const st = useEditor.getState();
    const scene = allClips(st.doc).find((c) => c.id === sceneId);
    if (!scene || scene.type !== "scene" || !sel) return;
    const sec = scene.duration / st.doc.settings.fps;
    const duration = sel.durations ? sel.durations.reduce((a, b) => (Math.abs(b - sec) < Math.abs(a - sec) ? b : a)) : undefined;
    const aspect = `${st.doc.settings.width > st.doc.settings.height ? "16:9" : st.doc.settings.width < st.doc.settings.height ? "9:16" : "1:1"}`;
    try {
      const { job } = await api<{ job: AiJob }>("/api/ai/jobs", {
        method: "POST",
        body: {
          provider: sel.provider,
          model: sel.id,
          capability: "text-to-video",
          projectId: st.projectId,
          input: { prompt: `${scene.visualPrompt}${scene.camera ? `. Camera: ${scene.camera}` : ""}`, durationSec: duration, aspectRatio: sel.aspectRatios?.includes(aspect) ? aspect : undefined },
          context: { sceneClipId: scene.id },
        },
      });
      st.dispatch([{ op: "updateClip", clipId: scene.id, patch: { status: "generating", error: null } }], "Generate scene");
      setJobIds((j) => [...j, job.id]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="h-full space-y-3 overflow-y-auto p-3">
      {!models.length ? (
        <Notice tone="warning" title="No video model connected">
          Storyboard scenes are editable motion layouts. To replace them with generated footage, connect a video provider (FAL_KEY or REPLICATE_API_TOKEN). You can also drop your own footage onto a selected scene from Media.
        </Notice>
      ) : (
        <div>
          <div className="label mb-1">Video model</div>
          <select className="field-sm" value={sel ? `${sel.provider}/${sel.id}` : ""} onChange={(e) => setModel(e.target.value)}>
            {models.map((m) => (
              <option key={`${m.provider}/${m.id}`} value={`${m.provider}/${m.id}`}>
                {m.providerName} · {m.label}
                {m.isMock ? " (dev mock)" : m.verified ? "" : " (unverified)"}
              </option>
            ))}
          </select>
          {sel && !sel.verified ? <p className="mt-1 text-[10px] text-amber-300/80">This model id is configurable and hasn&apos;t been verified against the provider&apos;s live catalogue.</p> : null}
        </div>
      )}
      {scenes.length === 0 ? (
        <p className="text-xs text-ink-400">No storyboard scenes in this project. Use AI Studio to generate a storyboard from a prompt.</p>
      ) : (
        scenes.map((s) => {
          if (s.type !== "scene") return null;
          const job = Object.values(jobs).find((j) => j.input.context?.sceneClipId === s.id && ["QUEUED", "RUNNING"].includes(j.status));
          return (
            <div key={s.id} className="rounded-lg border border-white/[0.06] bg-ink-850 p-2.5">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-3.5 w-3.5 text-accent-soft" />
                <button className="truncate text-xs font-medium hover:underline" onClick={() => { useEditor.getState().select([s.id]); useEditor.getState().setPlayhead(s.start); }}>
                  {s.sceneIndex + 1}. {s.title}
                </button>
                <span className="ml-auto text-[10px] text-ink-500">{(s.duration / doc.settings.fps).toFixed(1)}s</span>
              </div>
              <p className="mt-1 line-clamp-3 text-[11px] text-ink-400">{s.visualPrompt}</p>
              {job ? <Progress className="mt-2" value={job.progress} /> : null}
              {s.status === "failed" ? <p className="mt-1 text-[10px] text-rose-300">{s.error}</p> : null}
              <Button size="xs" variant="outline" className="mt-2 w-full" disabled={!sel || !!job} icon={<Sparkles className="h-3 w-3" />} onClick={() => generate(s.id)}>
                {job ? "Generating…" : s.status === "failed" ? "Retry generation" : "Generate footage"}
              </Button>
            </div>
          );
        })
      )}
    </div>
  );
}

/* --------------------------------------------------------- captions */

function CaptionsTab() {
  const doc = useEditor((s) => s.doc);
  const selection = useEditor((s) => s.selection);
  const providers = useProviders();
  const models = modelsFor(providers, "speech-to-text");
  const [jobIds, setJobIds] = useState<string[]>([]);
  const [style, setStyle] = useState<"bold" | "clean" | "karaoke">("bold");
  const media = allClips(doc).filter((c) => (c.type === "video" || c.type === "audio") && !c.muted);
  const target = media.find((c) => selection.includes(c.id)) ?? media[0];

  const jobs = useJobPolling(jobIds, (job) => {
    if (job.status !== "SUCCEEDED") return toast.error(`Transcription failed: ${job.error ?? job.status}`);
    const st = useEditor.getState();
    const clipId = job.input.context?.clipId as string;
    const src = allClips(st.doc).find((c) => c.id === clipId);
    if (!src || (src.type !== "video" && src.type !== "audio")) return;
    const words = wordsFromTranscript(job.output?.transcript);
    if (!words.length) return toast.error("No speech was detected.");
    const { width, height, fps } = st.doc.settings;
    const s = Math.min(width, height);
    const styles = {
      bold: { fontFamily: "Montserrat", fontSize: Math.round(s * 0.07), fontWeight: 900, textTransform: "uppercase", strokeColor: "#000000", strokeWidth: 3 },
      clean: { fontFamily: "Inter", fontSize: Math.round(s * 0.05), fontWeight: 600, background: "rgba(0,0,0,0.65)", padding: Math.round(s * 0.012), borderRadius: 10 },
      karaoke: { fontFamily: "Poppins", fontSize: Math.round(s * 0.075), fontWeight: 800, shadow: "0 4px 18px rgba(0,0,0,0.7)" },
    }[style];
    const clips = captionClips(words, { fps, offsetFrames: src.start, trimStartFrames: src.trimStart, speed: src.speed, style: styles, y: Math.round(height * 0.3), width: Math.round(width * 0.86), maxWords: style === "clean" ? 7 : 4 });
    const trackId = `cap-${Date.now().toString(36)}`;
    const r = st.dispatch([{ op: "addTrack", kind: "text", name: "Captions", index: 0, id: trackId }, ...clips.map((c) => ({ op: "addClip" as const, trackId, clip: c }))], "Auto captions");
    if (r.ok) toast.success(`Added ${clips.length} caption lines`);
    else toast.error(r.error ?? "Couldn't add captions");
  });

  async function transcribe() {
    if (!target || (target.type !== "video" && target.type !== "audio")) return;
    const m = models[0];
    try {
      const { job } = await api<{ job: AiJob }>("/api/ai/jobs", {
        method: "POST",
        body: { provider: m.provider, model: m.id, capability: "speech-to-text", projectId: useEditor.getState().projectId, input: { prompt: "", [target.type === "video" ? "videoAssetId" : "audioAssetId"]: target.assetId }, context: { clipId: target.id } },
      });
      setJobIds((j) => [...j, job.id]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const running = Object.values(jobs).find((j) => ["QUEUED", "RUNNING"].includes(j.status));
  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center gap-2 text-xs text-ink-300">
        <Captions className="h-4 w-4 text-accent-soft" /> Auto captions with word-level highlight
      </div>
      {!models.length ? (
        <Notice tone="warning" title="No speech-to-text provider connected">Add ELEVENLABS_API_KEY or FAL_KEY to transcribe speech. You can still type captions with the Text tools.</Notice>
      ) : !target ? (
        <p className="text-xs text-ink-400">Add a video or audio clip with speech first.</p>
      ) : (
        <>
          <div className="text-[11px] text-ink-400">
            Source: <span className="text-ink-100">{target.name || target.type}</span> {models[0].isMock ? <Badge>dev mock</Badge> : null}
          </div>
          <div>
            <div className="label mb-1">Style</div>
            <Segmented size="sm" value={style} onChange={setStyle} options={[{ value: "bold", label: "Bold" }, { value: "clean", label: "Clean" }, { value: "karaoke", label: "Karaoke" }]} />
          </div>
          {running ? <Progress value={running.progress} /> : null}
          <Button size="sm" variant="primary" className="w-full" loading={!!running} onClick={transcribe}>
            Generate captions
          </Button>
        </>
      )}
    </div>
  );
}
