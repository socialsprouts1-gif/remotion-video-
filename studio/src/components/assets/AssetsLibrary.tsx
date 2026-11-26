"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Image as ImageIcon, Music, Sparkles, Trash2, UploadCloud, Clapperboard } from "lucide-react";
import { api, formatBytes, formatDuration, timeAgo } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Badge, Button, Empty, Modal, Progress, Segmented, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useAssets, type Asset } from "@/components/editor/assets-store";
import { useUploader } from "@/components/editor/panels/MediaPanel";
import { newDocument } from "@/lib/project/factory";
import { applyCommands } from "@/lib/project/ops";
import { clipFromAsset } from "@/components/editor/assets-store";

export async function createProjectFromAsset(a: Asset) {
  const aspect = a.width && a.height ? (a.height > a.width * 1.2 ? "9:16" : Math.abs(a.width - a.height) < a.width * 0.1 ? "1:1" : "16:9") : "16:9";
  const base = newDocument({ aspect });
  const video = base.tracks.find((t) => t.kind === (a.kind === "AUDIO" ? "audio" : "video"))!;
  const { doc } = applyCommands(base, [{ op: "addClip", trackId: video.id, clip: clipFromAsset(a, 0, base.settings.fps, base.settings) }]);
  const r = await api<{ id: string }>("/api/projects", { method: "POST", body: { name: a.name.replace(/\.[a-z0-9]+$/i, ""), doc } });
  return r.id;
}

export function AssetsLibrary() {
  const { assets, loaded, load } = useAssets();
  const [kind, setKind] = useState<"all" | "VIDEO" | "IMAGE" | "AUDIO">("all");
  const [open, setOpen] = useState<Asset | null>(null);
  const { upload, uploads } = useUploader();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (params.get("upload") === "1") setTimeout(() => fileRef.current?.click(), 300);
  }, [params]);

  async function remove(a: Asset) {
    if (!confirm(`Delete “${a.name}”? Projects using it will show a missing-media gap.`)) return;
    try {
      await api(`/api/assets/${a.id}`, { method: "DELETE" });
      useAssets.setState({ assets: assets.filter((x) => x.id !== a.id) });
      setOpen(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const shown = assets.filter((a) => kind === "all" || a.kind === kind);
  return (
    <div
      onDragOver={(e) => e.dataTransfer.types.includes("Files") && e.preventDefault()}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        void upload(e.dataTransfer.files);
      }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Segmented value={kind} onChange={setKind} options={[{ value: "all", label: "All" }, { value: "VIDEO", label: "Video" }, { value: "IMAGE", label: "Images" }, { value: "AUDIO", label: "Audio" }]} />
        <Button variant="primary" icon={<UploadCloud className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>Upload</Button>
        <input ref={fileRef} type="file" multiple accept="video/*,audio/*,image/*" className="hidden" onChange={async (e) => {
          if (!e.target.files) return;
          const files = e.target.files;
          const done = await upload(files);
          e.target.value = "";
          if (params.get("upload") === "1" && done.length === 1 && done[0].kind === "VIDEO") {
            const id = await createProjectFromAsset(done[0]);
            router.push(`/editor/${id}`);
          }
        }} />
      </div>
      {uploads.length ? (
        <div className="mb-6 space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="panel p-3">
              <div className="mb-1.5 flex justify-between text-xs"><span>{u.name}</span><span className="text-ink-400">{u.stage} · {Math.round(u.progress * 100)}%</span></div>
              <Progress value={u.progress} />
            </div>
          ))}
        </div>
      ) : null}
      {!loaded ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : shown.length === 0 ? (
        <Empty icon={<UploadCloud className="h-6 w-6" />} title="No assets yet" action={<Button onClick={() => fileRef.current?.click()}>Upload files</Button>}>
          Drop video, audio or images anywhere on this page.
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((a) => (
            <button key={a.id} onClick={() => setOpen(a)} className="group overflow-hidden rounded-xl border border-white/[0.06] bg-ink-850 text-left transition hover:border-accent/40">
              <div className="flex aspect-video items-center justify-center bg-black/40">
                {a.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.poster} alt="" className="h-full w-full object-cover" />
                ) : a.kind === "AUDIO" ? <Music className="h-6 w-6 text-emerald-300/70" /> : a.kind === "IMAGE" ? <ImageIcon className="h-6 w-6" /> : <Film className="h-6 w-6" />}
              </div>
              <div className="p-2.5">
                <div className="flex items-center gap-1 truncate text-xs font-medium">{a.source.startsWith("ai:") ? <Sparkles className="h-3 w-3 shrink-0 text-accent-soft" /> : null}{a.name}</div>
                <div className="mt-0.5 text-[11px] text-ink-400">{a.kind.toLowerCase()} · {formatBytes(a.sizeBytes)}{a.durationSec ? ` · ${formatDuration(a.durationSec)}` : ""}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""} wide footer={open ? (
        <>
          <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(open)}>Delete</Button>
          {open.kind !== "AUDIO" ? <Button variant="primary" icon={<Clapperboard className="h-4 w-4" />} onClick={async () => { const id = await createProjectFromAsset(open); router.push(`/editor/${id}`); }}>Edit in new project</Button> : null}
        </>
      ) : null}>
        {open ? (
          <div className="space-y-3">
            <div className="flex justify-center overflow-hidden rounded-lg bg-black">
              {open.kind === "VIDEO" ? <video src={open.src} controls className={cn("max-h-[55vh]")} /> : open.kind === "AUDIO" ? <audio src={open.src} controls className="w-full p-4" /> : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.src} alt="" className="max-h-[55vh]" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-ink-300">
              <Badge>{open.mimeType}</Badge>
              {open.width ? <Badge>{open.width}×{open.height}</Badge> : null}
              {open.durationSec ? <Badge>{formatDuration(open.durationSec)}</Badge> : null}
              {open.fps ? <Badge>{Math.round(open.fps * 100) / 100} fps</Badge> : null}
              <Badge>{formatBytes(open.sizeBytes)}</Badge>
              <Badge tone={open.source.startsWith("ai:") ? "accent" : "default"}>{open.source}</Badge>
              <Badge>{timeAgo(open.createdAt)}</Badge>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
