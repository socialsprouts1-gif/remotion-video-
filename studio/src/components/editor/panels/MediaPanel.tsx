"use client";
import { useEffect, useRef, useState } from "react";
import { Film, Image as ImageIcon, Music, Plus, Search, Sparkles, UploadCloud } from "lucide-react";
import { formatBytes, formatDuration } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/cn";
import { Progress, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useEditor } from "../store";
import { clipFromAsset, useAssets, type Asset } from "../assets-store";

export function useUploader() {
  const add = useAssets((s) => s.add);
  const [uploads, setUploads] = useState<{ id: string; name: string; progress: number; stage: string }[]>([]);
  async function upload(files: FileList | File[]) {
    const results: Asset[] = [];
    for (const file of Array.from(files)) {
      const id = `${file.name}-${Date.now()}`;
      setUploads((u) => [...u, { id, name: file.name, progress: 0, stage: "Starting" }]);
      try {
        const a = await uploadFile(file, (progress, stage) => setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress, stage } : x))));
        add(a);
        results.push(a);
        toast.success(`Uploaded ${file.name}`);
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`);
      } finally {
        setUploads((u) => u.filter((x) => x.id !== id));
      }
    }
    return results;
  }
  return { upload, uploads };
}

export function MediaPanel() {
  const { assets, loaded, load } = useAssets();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "VIDEO" | "IMAGE" | "AUDIO">("all");
  const { upload, uploads } = useUploader();
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (!loaded) load().catch((e) => toast.error(e.message));
  }, [loaded, load]);

  const add = (a: Asset) => {
    const st = useEditor.getState();
    const clip = clipFromAsset(a, st.playhead, st.doc.settings.fps, st.doc.settings);
    // if a storyboard scene is selected, footage replaces it in place
    const sel = st.selection.length === 1 ? st.doc.tracks.flatMap((t) => t.clips).find((c) => c.id === st.selection[0]) : null;
    if (sel?.type === "scene" && a.kind !== "AUDIO") {
      const r = st.dispatch(
        [
          { op: "addClip", clip: { ...clip, start: sel.start, duration: Math.min(clip.duration, sel.duration), transitionIn: sel.transitionIn, transitionOut: sel.transitionOut, name: `${sel.title} — ${a.name}` } },
          { op: "removeClips", clipIds: [sel.id] },
        ],
        "Replace scene with footage",
      );
      if (r.ok) st.select(r.created);
      return;
    }
    const r = st.dispatch([{ op: "addClip", clip, avoidOverlap: true }], `Add ${a.kind.toLowerCase()}`);
    if (r.ok) st.select(r.created);
    else toast.error(r.error ?? "Couldn't add");
  };

  const shown = assets.filter((a) => (kind === "all" || a.kind === kind) && a.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div
      className={cn("flex h-full flex-col", over && "bg-accent/5")}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setOver(false);
        void upload(e.dataTransfer.files);
      }}
    >
      <div className="space-y-2 p-3">
        <button onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 py-4 text-xs text-ink-300 transition hover:border-accent/50 hover:text-white">
          <UploadCloud className="h-5 w-5" />
          Upload or drop video, audio, images
          <span className="text-[10px] text-ink-500">Chunked & resumable · up to 4 GB</span>
        </button>
        <input ref={fileRef} type="file" multiple accept="video/*,audio/*,image/*" className="hidden" onChange={(e) => e.target.files && upload(e.target.files).then(() => (e.target.value = ""))} />
        {uploads.map((u) => (
          <div key={u.id} className="rounded-lg bg-ink-850 p-2">
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="truncate">{u.name}</span>
              <span className="shrink-0 text-ink-400 tabular-nums">{u.stage} · {Math.round(u.progress * 100)}%</span>
            </div>
            <Progress value={u.progress} />
          </div>
        ))}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-ink-850 px-2">
          <Search className="h-3.5 w-3.5 text-ink-500" />
          <input className="w-full bg-transparent py-1.5 text-xs outline-none" placeholder="Search media" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(["all", "VIDEO", "IMAGE", "AUDIO"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={cn("rounded-md px-2 py-1 text-[10px] font-medium", kind === k ? "bg-white/10 text-white" : "text-ink-400 hover:text-white")}>
              {k === "all" ? "All" : k[0] + k.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {!loaded ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : shown.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-500">No media yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {shown.map((a) => (
              <div
                key={a.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-lumora-asset", JSON.stringify(a));
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="group relative cursor-grab overflow-hidden rounded-lg border border-white/[0.06] bg-ink-850"
                title={`${a.name} · ${formatBytes(a.sizeBytes)}`}
              >
                <div className="flex aspect-video items-center justify-center bg-black/40">
                  {a.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.poster} alt="" className="h-full w-full object-cover" draggable={false} />
                  ) : a.kind === "AUDIO" ? (
                    <Music className="h-5 w-5 text-emerald-300/70" />
                  ) : a.kind === "IMAGE" ? (
                    <ImageIcon className="h-5 w-5 text-ink-400" />
                  ) : (
                    <Film className="h-5 w-5 text-ink-400" />
                  )}
                </div>
                <div className="flex items-center gap-1 px-1.5 py-1">
                  {a.source.startsWith("ai:") ? <Sparkles className="h-2.5 w-2.5 shrink-0 text-accent-soft" /> : null}
                  <span className="truncate text-[10px] text-ink-200">{a.name}</span>
                  {a.durationSec ? <span className="ml-auto text-[9px] text-ink-500">{formatDuration(a.durationSec)}</span> : null}
                </div>
                <button onClick={() => add(a)} title="Add at playhead" className="absolute right-1 top-1 rounded-md bg-black/70 p-1 opacity-0 transition group-hover:opacity-100">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
