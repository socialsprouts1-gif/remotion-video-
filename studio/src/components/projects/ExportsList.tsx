"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Download, Trash2, XCircle, Play } from "lucide-react";
import { api, formatBytes, timeAgo } from "@/lib/api";
import { Badge, Button, Empty, Modal, Progress, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import type { ExportJob } from "@/components/editor/ExportDialog";

export function ExportsList() {
  const [jobs, setJobs] = useState<ExportJob[] | null>(null);
  const [watch, setWatch] = useState<ExportJob | null>(null);
  const load = useCallback(() => api<{ exports: ExportJob[] }>("/api/exports").then((r) => setJobs(r.exports), () => setJobs([])), []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!jobs?.some((j) => j.status === "QUEUED" || j.status === "RUNNING")) return;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [jobs, load]);

  if (!jobs) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!jobs.length) return <Empty icon={<Download className="h-6 w-6" />} title="No exports yet">Open a project and press Export to render it.</Empty>;
  return (
    <div className="panel divide-y divide-white/[0.05] overflow-hidden">
      {jobs.map((j) => (
        <div key={j.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
          <div className="min-w-[200px] flex-1">
            <Link href={`/editor/${j.projectId}`} className="text-sm font-medium hover:underline">{j.projectName ?? "Project"}</Link>
            <div className="mt-0.5 text-xs text-ink-400">
              {j.settings.format.toUpperCase()} · {j.settings.resolution} · {j.settings.fps} fps · {j.settings.quality}
              {j.settings.aspectRatio !== "project" ? ` · ${j.settings.aspectRatio}` : ""} · {timeAgo(j.createdAt)}
              {j.outputBytes ? ` · ${formatBytes(j.outputBytes)}` : ""}
            </div>
            {j.status === "RUNNING" || j.status === "QUEUED" ? (
              <div className="mt-2 max-w-md">
                <Progress value={j.progress} />
                <div className="mt-1 text-[11px] text-ink-400">{j.stage}</div>
              </div>
            ) : null}
            {j.error ? <div className="mt-1 max-w-xl text-xs text-rose-300">{j.error}</div> : null}
          </div>
          <Badge tone={j.status === "SUCCEEDED" ? "success" : j.status === "FAILED" ? "danger" : j.status === "CANCELED" ? "default" : "info"}>{j.status.toLowerCase()}</Badge>
          <div className="flex gap-1.5">
            {j.downloadUrl && j.settings.format !== "mov" ? <Button size="sm" variant="ghost" icon={<Play className="h-3.5 w-3.5" />} onClick={() => setWatch(j)}>Watch</Button> : null}
            {j.downloadUrl ? <a href={j.downloadUrl} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink-750 px-3 text-xs hover:bg-ink-700"><Download className="h-3.5 w-3.5" /> Download</a> : null}
            {j.status === "RUNNING" || j.status === "QUEUED" ? (
              <Button size="sm" variant="danger" icon={<XCircle className="h-3.5 w-3.5" />} onClick={async () => { await api(`/api/exports/${j.id}/cancel`, { method: "POST" }).catch((e) => toast.error(e.message)); void load(); }}>Cancel</Button>
            ) : (
              <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={async () => { if (confirm("Delete this export?")) { await api(`/api/exports/${j.id}`, { method: "DELETE" }); void load(); } }} />
            )}
          </div>
        </div>
      ))}
      <Modal open={!!watch} onClose={() => setWatch(null)} title={watch?.projectName ?? "Export"} wide>
        {watch?.downloadUrl ? (watch.settings.format === "gif" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${watch.downloadUrl}?inline=1`} alt="" className="mx-auto max-h-[60vh]" />
        ) : <video src={`${watch.downloadUrl}?inline=1`} controls autoPlay className="mx-auto max-h-[60vh] w-full bg-black" />) : null}
      </Modal>
    </div>
  );
}
