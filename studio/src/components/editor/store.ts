"use client";
import { create } from "zustand";
import { applyCommands, describeCommand, findClip, allClips, type EditCommand } from "@/lib/project/ops";
import type { Clip, ProjectDoc } from "@/lib/project/schema";
import { nanoid } from "@/lib/id";

const HISTORY_LIMIT = 200;
let lastEdit = { label: "", at: 0 };

export type SaveState = "saved" | "dirty" | "saving" | "error" | "conflict";

interface HistoryEntry {
  doc: ProjectDoc;
  label: string;
}

export interface EditorState {
  projectId: string;
  name: string;
  revision: number;
  doc: ProjectDoc;
  /** AI preview: a proposed doc shown in the player until accepted/rejected */
  previewDoc: ProjectDoc | null;
  past: HistoryEntry[];
  future: HistoryEntry[];
  selection: string[];
  selectedTrack: string | null;
  playhead: number;
  playing: boolean;
  pxPerFrame: number;
  snapping: boolean;
  saveState: SaveState;
  saveError: string | null;
  clipboard: Clip[];
  access: string;

  init(p: { projectId: string; name: string; revision: number; doc: ProjectDoc; access: string }): void;
  dispatch(cmds: EditCommand[], label?: string): { ok: boolean; created: string[]; error?: string };
  /** replace the doc without history (used for live drags; call commitLive afterwards) */
  setLive(doc: ProjectDoc): void;
  undo(): void;
  redo(): void;
  select(ids: string[], additive?: boolean): void;
  selectTrack(id: string | null): void;
  setPlayhead(f: number): void;
  setPlaying(p: boolean): void;
  setZoom(px: number): void;
  setSnapping(s: boolean): void;
  setPreview(doc: ProjectDoc | null): void;
  copy(): void;
  paste(): void;
  markSaved(revision: number): void;
  setSaveState(s: SaveState, err?: string | null): void;
  setName(n: string): void;
}

export const useEditor = create<EditorState>((set, get) => ({
  projectId: "",
  name: "",
  revision: 0,
  doc: null as unknown as ProjectDoc,
  previewDoc: null,
  past: [],
  future: [],
  selection: [],
  selectedTrack: null,
  playhead: 0,
  playing: false,
  pxPerFrame: 4,
  snapping: true,
  saveState: "saved",
  saveError: null,
  clipboard: [],
  access: "edit",

  init: (p) => set({ ...p, past: [], future: [], selection: [], playhead: 0, saveState: "saved", previewDoc: null }),

  dispatch(cmds, label) {
    if (!cmds.length) return { ok: true, created: [] };
    const { doc, past, access } = get();
    if (access === "view" || access === "comment") return { ok: false, created: [], error: "You have view-only access to this project" };
    try {
      const r = applyCommands(doc, cmds);
      const lbl = label ?? describeCommand(cmds[0], doc);
      // coalesce rapid repeated edits (slider drags, typing) into one undo step
      const now = Date.now();
      const coalesce = lastEdit.label === lbl && now - lastEdit.at < 700 && past.length > 0;
      lastEdit = { label: lbl, at: now };
      set({
        doc: r.doc,
        past: coalesce ? past : [...past.slice(-HISTORY_LIMIT + 1), { doc, label: lbl }],
        future: [],
        saveState: "dirty",
        // drop selections of clips that no longer exist
        selection: get().selection.filter((id) => !!findClip(r.doc, id)),
      });
      return { ok: true, created: r.created };
    } catch (e) {
      return { ok: false, created: [], error: (e as Error).message };
    }
  },

  setLive: (doc) => set({ doc, saveState: "dirty" }),

  undo() {
    const { past, future, doc } = get();
    const prev = past[past.length - 1];
    if (!prev) return;
    set({ doc: prev.doc, past: past.slice(0, -1), future: [{ doc, label: prev.label }, ...future], saveState: "dirty" });
  },
  redo() {
    const { past, future, doc } = get();
    const next = future[0];
    if (!next) return;
    set({ doc: next.doc, future: future.slice(1), past: [...past, { doc, label: next.label }], saveState: "dirty" });
  },

  select(ids, additive) {
    const { doc, selection } = get();
    // selecting a grouped clip selects its whole group
    const expanded = new Set<string>();
    for (const id of ids) {
      const f = findClip(doc, id);
      if (f?.clip.groupId) allClips(doc).filter((c) => c.groupId === f.clip.groupId).forEach((c) => expanded.add(c.id));
      else expanded.add(id);
    }
    if (additive) {
      const cur = new Set(selection);
      for (const id of expanded) cur.has(id) ? cur.delete(id) : cur.add(id);
      set({ selection: [...cur] });
    } else set({ selection: [...expanded] });
  },
  selectTrack: (id) => set({ selectedTrack: id }),
  setPlayhead: (f) => set({ playhead: Math.max(0, Math.min(get().doc.settings.durationInFrames - 1, Math.round(f))) }),
  setPlaying: (p) => set({ playing: p }),
  setZoom: (px) => set({ pxPerFrame: Math.max(0.15, Math.min(40, px)) }),
  setSnapping: (s) => set({ snapping: s }),
  setPreview: (doc) => set({ previewDoc: doc }),

  copy() {
    const { doc, selection } = get();
    set({ clipboard: allClips(doc).filter((c) => selection.includes(c.id)).map((c) => structuredClone(c)) });
  },
  paste() {
    const { clipboard, playhead } = get();
    if (!clipboard.length) return;
    const minStart = Math.min(...clipboard.map((c) => c.start));
    const cmds: EditCommand[] = clipboard.map((c) => ({ op: "addClip", clip: { ...c, id: nanoid(), start: playhead + (c.start - minStart), groupId: null }, avoidOverlap: true }));
    const r = get().dispatch(cmds, `Paste ${clipboard.length} clip(s)`);
    if (r.ok) set({ selection: r.created });
  },

  markSaved: (revision) => set({ revision, saveState: get().saveState === "saving" ? "saved" : get().saveState, saveError: null }),
  setSaveState: (s, err = null) => set({ saveState: s, saveError: err }),
  setName: (n) => set({ name: n, saveState: "dirty" }),
}));

export function selectedClips(s: Pick<EditorState, "doc" | "selection">): Clip[] {
  return allClips(s.doc).filter((c) => s.selection.includes(c.id));
}
