"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bot, Download, Film, History, LayoutGrid, Redo2, Type, Undo2, Cloud, CloudOff, Loader2, AlertTriangle } from "lucide-react";
import type { ProjectDoc } from "@/lib/project/schema";
import { clipEnd, findClip } from "@/lib/project/ops";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui";
import { useEditor } from "./store";
import { useAutosave } from "./useAutosave";
import { Preview } from "./Preview";
import { Timeline } from "./Timeline";
import { Inspector } from "./Inspector";
import { MediaPanel } from "./panels/MediaPanel";
import { ElementsPanel, TextPanel } from "./panels/LibraryPanels";
import { AIPanel } from "./panels/AIPanel";
import { ExportDialog } from "./ExportDialog";
import { VersionsDialog } from "./VersionsDialog";
import { ErrorBoundary } from "./ErrorBoundary";

type LeftTab = "media" | "text" | "elements" | "ai";
const TABS: { id: LeftTab; label: string; icon: typeof Film }[] = [
  { id: "media", label: "Media", icon: Film },
  { id: "text", label: "Text", icon: Type },
  { id: "elements", label: "Motion", icon: LayoutGrid },
  { id: "ai", label: "AI", icon: Bot },
];

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement;
  return t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable;
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const st = useEditor.getState();
      const mod = e.metaKey || e.ctrlKey;
      const fps = st.doc.settings.fps;
      const k = e.key.toLowerCase();
      if (k === " ") {
        e.preventDefault();
        st.setPlaying(!st.playing);
      } else if (mod && k === "z") {
        e.preventDefault();
        e.shiftKey ? st.redo() : st.undo();
      } else if (mod && k === "y") {
        e.preventDefault();
        st.redo();
      } else if (mod && k === "c") st.copy();
      else if (mod && k === "v") st.paste();
      else if (mod && k === "d") {
        e.preventDefault();
        if (st.selection.length) {
          const r = st.dispatch([{ op: "duplicateClips", clipIds: st.selection }]);
          if (r.ok) st.select(r.created);
        }
      } else if (mod && k === "g") {
        e.preventDefault();
        const g = st.selection.length ? findClip(st.doc, st.selection[0])?.clip.groupId : null;
        if (e.shiftKey && g) st.dispatch([{ op: "ungroup", groupId: g }]);
        else if (st.selection.length > 1) st.dispatch([{ op: "group", clipIds: st.selection }]);
      } else if (mod && k === "a") {
        e.preventDefault();
        st.select(st.doc.tracks.flatMap((t) => t.clips.map((c) => c.id)));
      } else if (k === "delete" || k === "backspace") {
        if (st.selection.length) st.dispatch([{ op: "removeClips", clipIds: st.selection, ripple: e.shiftKey }]);
      } else if (k === "s" && !mod) st.dispatch([{ op: "splitAt", frame: st.playhead, clipIds: st.selection.length ? st.selection : undefined }]);
      else if (k === "m" && !mod) st.dispatch([{ op: "addMarker", frame: st.playhead, label: `Marker ${st.doc.markers.length + 1}` }]);
      else if (k === "arrowleft") {
        e.preventDefault();
        st.setPlayhead(st.playhead - (e.shiftKey ? fps : 1));
      } else if (k === "arrowright") {
        e.preventDefault();
        st.setPlayhead(st.playhead + (e.shiftKey ? fps : 1));
      } else if (k === "home") st.setPlayhead(0);
      else if (k === "end") st.setPlayhead(st.doc.settings.durationInFrames - 1);
      else if (k === "escape") st.select([]);
      else if (k === "=" || k === "+") st.setZoom(st.pxPerFrame * 1.3);
      else if (k === "-") st.setZoom(st.pxPerFrame / 1.3);
      else if (k === "arrowup" || k === "arrowdown") {
        // jump to previous / next edit point
        e.preventDefault();
        const pts = [...new Set(st.doc.tracks.flatMap((t) => t.clips.flatMap((c) => [c.start, clipEnd(c)])))].sort((a, b) => a - b);
        const next = k === "arrowdown" ? pts.find((p) => p > st.playhead) : [...pts].reverse().find((p) => p < st.playhead);
        if (next !== undefined) st.setPlayhead(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function SaveIndicator() {
  const s = useEditor((st) => st.saveState);
  const err = useEditor((st) => st.saveError);
  const map = {
    saved: { icon: <Cloud className="h-3.5 w-3.5" />, text: "Saved", cls: "text-ink-400" },
    dirty: { icon: <Cloud className="h-3.5 w-3.5" />, text: "Unsaved", cls: "text-ink-300" },
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "Saving…", cls: "text-ink-300" },
    error: { icon: <CloudOff className="h-3.5 w-3.5" />, text: "Save failed — retrying on next edit", cls: "text-rose-300" },
    conflict: { icon: <AlertTriangle className="h-3.5 w-3.5" />, text: "Changed elsewhere — reload", cls: "text-amber-300" },
  }[s];
  return (
    <span className={cn("hidden items-center gap-1.5 text-[11px] md:flex", map.cls)} title={err ?? undefined}>
      {map.icon}
      {map.text}
    </span>
  );
}

export function Editor({ project, access }: { project: { id: string; name: string; revision: number; document: ProjectDoc }; access: string }) {
  const ready = useEditor((s) => s.projectId === project.id && !!s.doc);
  const name = useEditor((s) => s.name);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const undoLabel = useEditor((s) => s.past[s.past.length - 1]?.label);
  const [tab, setTab] = useState<LeftTab>("media");
  const [exportOpen, setExportOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const { saveNow } = useAutosave();
  useShortcuts();

  useEffect(() => {
    useEditor.getState().init({ projectId: project.id, name: project.name, revision: project.revision, doc: project.document, access });
    // fit timeline to project length
    const w = Math.max(600, window.innerWidth - 600);
    useEditor.getState().setZoom(w / Math.max(1, project.document.settings.durationInFrames + project.document.settings.fps * 2));
  }, [project, access]);

  useEffect(() => {
    if (project.document.plan) setTab("ai");
  }, [project.document.plan]);

  if (!ready) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-ink-400" /></div>;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink-950">
      {/* top bar */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-ink-900/80 px-2 sm:px-3">
        <Link href="/projects" className="rounded-md p-1.5 text-ink-300 hover:bg-white/5 hover:text-white" title="Back to projects">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <input
          className="w-40 min-w-0 rounded-md bg-transparent px-2 py-1 text-sm font-medium outline-none hover:bg-white/[0.04] focus:bg-ink-850 sm:w-64"
          value={name}
          onChange={(e) => useEditor.getState().setName(e.target.value)}
          aria-label="Project name"
        />
        <SaveIndicator />
        <div className="ml-auto flex items-center gap-1">
          <IconButton title={canUndo ? `Undo ${undoLabel} (Ctrl+Z)` : "Undo"} disabled={!canUndo} onClick={() => useEditor.getState().undo()}>
            <Undo2 className="h-4 w-4" />
          </IconButton>
          <IconButton title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={() => useEditor.getState().redo()}>
            <Redo2 className="h-4 w-4" />
          </IconButton>
          <IconButton title="Version history" onClick={() => setVersionsOpen(true)}>
            <History className="h-4 w-4" />
          </IconButton>
          {access === "view" || access === "comment" ? <span className="px-2 text-[11px] text-amber-300">View only</span> : null}
          <Button variant="primary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => setExportOpen(true)} className="ml-1">
            Export
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* left panel */}
        <aside className="flex h-64 shrink-0 border-b border-white/[0.06] bg-ink-900/60 lg:h-auto lg:w-[300px] lg:border-b-0 lg:border-r">
          <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-white/[0.05] py-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex w-11 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[9px] font-medium transition", tab === t.id ? "bg-white/[0.07] text-white" : "text-ink-400 hover:text-white")}>
                <t.icon className={cn("h-4 w-4", tab === t.id && "text-accent-soft")} />
                {t.label}
              </button>
            ))}
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto">
            <ErrorBoundary name="panel">
              {tab === "media" ? <MediaPanel /> : tab === "text" ? <TextPanel /> : tab === "elements" ? <ElementsPanel /> : <AIPanel />}
            </ErrorBoundary>
          </div>
        </aside>

        {/* centre: preview + timeline */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-[220px] flex-[1.25]">
            <ErrorBoundary name="preview">
              <Preview />
            </ErrorBoundary>
          </div>
          <div className="min-h-[200px] flex-1 border-t border-white/[0.06]">
            <ErrorBoundary name="timeline">
              <Timeline />
            </ErrorBoundary>
          </div>
        </div>

        {/* inspector */}
        <aside className="h-72 shrink-0 overflow-y-auto border-t border-white/[0.06] bg-ink-900/60 lg:h-auto lg:w-[300px] lg:border-l lg:border-t-0">
          <ErrorBoundary name="inspector">
            <Inspector />
          </ErrorBoundary>
        </aside>
      </div>

      {exportOpen ? <ExportDialog open onClose={() => setExportOpen(false)} saveNow={() => saveNow()} /> : null}
      {versionsOpen ? <VersionsDialog open onClose={() => setVersionsOpen(false)} saveNow={(o) => saveNow(o)} /> : null}
    </div>
  );
}
