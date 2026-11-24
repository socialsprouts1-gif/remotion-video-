"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, XCircle } from "lucide-react";
import { api, formatBytes } from "@/lib/api";
import type { ExportSettings } from "@/lib/project/schema";
import { Badge, Button, Field, Modal, Notice, Progress, Segmented } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useEditor } from "./store";

export interface ExportJob { id: string; status: string; progress: number; stage: string | null; error: string | null; settings: ExportSettings; outputBytes: number | null; downloadUrl: string | null; createdAt: string; projectName?: string | null; projectId?: string }

export function ExportDialog({ open, onClose, saveNow }: { open: boolean; onClose: () => void; saveNow: () => Promise<void> }) {
  const projectId = useEditor((s) => s.projectId);
  const fps = useEditor((s) => s.doc.settings.fps);
  const [s, setS] = useState<ExportSettings>({ format: "mp4", resolution: "1080p", fps: ([24, 25, 30, 50, 60].includes(fps) ? fps : 30) as 30, aspectRatio: "project", quality: "high", watermark: false, watermarkText: "Made with Lumora", includeAudio: true, range: null });
  const [estimate, setEstimate] = useState<{ bytes: number; width: number; height: number; durationSec: number } | null>(null);
  const [job, setJob] = useState<ExportJob | null>(null);
  const [busy, setBusy] = useState(false);
  const saveState = useEditor((st) => st.saveState);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      api<typeof estimate>("/api/exports/estimate", { method: "POST", body: { projectId, settings: s } }).then(setEstimate, () => setEstimate(null));
    }, 250);
    return () => clearTimeout(t);
  }, [open, s, projectId, saveState]);

  useEffect(() => {
    if (!job || ["SUCCEEDED", "FAILED", "CANCELED"].includes(job.status)) return;
    const t = setInterval(async () => {
      try {
        const r = await api<{ export: ExportJob }>(`/api/exports/${job.id}`);
        setJob(r.export);
        if (r.export.status === "SUCCEEDED") toast.success("Export finished");
      } catch {
        /* retry */
      }
    }, 1500);
    return () => clearInterval(t);
  }, [job]);

  async function start() {
    setBusy(true);
    try {
      // render exactly what's on screen: flush unsaved edits first
      await saveNow();
      if (useEditor.getState().saveState === "conflict" || useEditor.getState().saveState === "error") throw new Error(useEditor.getState().saveError ?? "Save failed — can't export unsaved changes");
      const r = await api<{ export: ExportJob }>("/api/exports", { method: "POST", body: { projectId, settings: s } });
      setJob(r.export);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = <K extends keyof ExportSettings>(k: K, v: ExportSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const active = job && ["QUEUED", "RUNNING"].includes(job.status);

  return (
    <Modal open={open} onClose={onClose} title="Export video" wide>
      {job ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{job.stage ?? job.status}</div>
            <Badge tone={job.status === "SUCCEEDED" ? "success" : job.status === "FAILED" ? "danger" : "info"}>{job.status.toLowerCase()}</Badge>
          </div>
          <Progress value={job.progress} />
          <div className="text-xs text-ink-400">
            {job.settings.format.toUpperCase()} · {job.settings.resolution} · {job.settings.fps} fps {job.outputBytes ? `· ${formatBytes(job.outputBytes)}` : ""}
          </div>
          {job.status === "QUEUED" ? <p className="text-xs text-ink-400">Waiting for a render worker. If this doesn&apos;t start, make sure <code className="text-ink-200">npm run worker</code> is running.</p> : null}
          {job.error ? <Notice tone="danger" title="Render failed">{job.error}</Notice> : null}
          <p className="text-xs text-ink-400">Rendering runs in the background — you can keep editing or close this dialog. Progress is also in <Link href="/exports" className="text-accent-soft hover:underline">Export history</Link>.</p>
          <div className="flex gap-2">
            {job.downloadUrl ? (
              <a href={job.downloadUrl} className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-glow hover:bg-accent-soft">
                <Download className="h-4 w-4" /> Download
              </a>
            ) : null}
            {active ? (
              <Button variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={async () => { await api(`/api/exports/${job.id}/cancel`, { method: "POST" }); setJob({ ...job, status: "CANCELED", stage: "Canceled" }); }}>
                Cancel render
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setJob(null)}>New export</Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Format">
              <div><Segmented value={s.format} onChange={(v) => set("format", v)} options={[{ value: "mp4", label: "MP4" }, { value: "webm", label: "WebM" }, { value: "mov", label: "MOV (ProRes)" }, { value: "gif", label: "GIF" }]} /></div>
            </Field>
            <Field label="Resolution">
              <div><Segmented value={s.resolution} onChange={(v) => set("resolution", v)} options={[{ value: "720p", label: "720p" }, { value: "1080p", label: "1080p" }, { value: "2k", label: "2K" }, { value: "4k", label: "4K" }]} /></div>
            </Field>
            <Field label="Frame rate">
              <div><Segmented value={String(s.fps)} onChange={(v) => set("fps", Number(v) as 30)} options={["24", "25", "30", "50", "60"].map((v) => ({ value: v, label: v }))} /></div>
            </Field>
            <Field label="Aspect ratio" hint={s.aspectRatio !== "project" ? "Layers are re-framed automatically for this export." : undefined}>
              <div><Segmented value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} options={[{ value: "project", label: "Project" }, { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" }, { value: "4:5", label: "4:5" }]} /></div>
            </Field>
            <Field label="Quality">
              <div><Segmented value={s.quality} onChange={(v) => set("quality", v)} options={[{ value: "draft", label: "Draft" }, { value: "standard", label: "Standard" }, { value: "high", label: "High" }, { value: "master", label: "Master" }]} /></div>
            </Field>
            <Field label="Options">
              <div className="space-y-1.5 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={s.includeAudio} onChange={(e) => set("includeAudio", e.target.checked)} /> Include audio</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={s.watermark} onChange={(e) => set("watermark", e.target.checked)} /> Watermark</label>
                {s.watermark ? <input className="field-sm" value={s.watermarkText} onChange={(e) => set("watermarkText", e.target.value)} /> : null}
              </div>
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-ink-850 px-4 py-3">
            <div className="text-xs text-ink-300">
              {estimate ? (
                <>
                  Output <span className="text-white">{estimate.width}×{estimate.height}</span> · {estimate.durationSec.toFixed(1)}s · estimated <span className="text-white">~{formatBytes(estimate.bytes)}</span>
                </>
              ) : (
                "Estimating…"
              )}
            </div>
            <Button variant="primary" loading={busy} onClick={start} icon={<Download className="h-4 w-4" />}>
              Render
            </Button>
          </div>
          <p className="text-[11px] text-ink-500">The export is rendered on the server from this exact project document — same composition as the preview. Free plans are limited to 1080p and include a watermark.</p>
        </div>
      )}
    </Modal>
  );
}
