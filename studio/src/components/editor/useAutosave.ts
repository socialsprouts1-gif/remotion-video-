"use client";
import { useEffect, useRef } from "react";
import { api, ApiError } from "@/lib/api";
import { useEditor } from "./store";

/** Debounced autosave with optimistic concurrency (server rejects stale revisions with 409). */
export function useAutosave(delayMs = 1200) {
  const doc = useEditor((s) => s.doc);
  const saveState = useEditor((s) => s.saveState);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<Promise<void> | null>(null);

  async function doSave(opts: { kind?: "snapshot" | "ai"; label?: string }) {
    const st = useEditor.getState();
    if (st.saveState === "conflict") return;
    const docAtSave = st.doc;
    st.setSaveState("saving");
    try {
      const r = await api<{ revision: number }>(`/api/projects/${st.projectId}`, { method: "PUT", body: { revision: st.revision, document: docAtSave, name: st.name, ...opts } });
      const now = useEditor.getState();
      useEditor.setState({ revision: r.revision, saveState: now.doc === docAtSave && now.name === st.name ? "saved" : "dirty", saveError: null });
    } catch (e) {
      const err = e as ApiError;
      useEditor.getState().setSaveState(err.status === 409 ? "conflict" : "error", err.message);
    }
  }

  /** Save now and resolve when the latest state is persisted (serialised with any save in flight). */
  async function saveNow(opts: { kind?: "snapshot" | "ai"; label?: string } = {}) {
    if (timer.current) clearTimeout(timer.current);
    while (inflight.current) await inflight.current;
    const s = useEditor.getState().saveState;
    if (s === "saved" && !opts.kind) return;
    inflight.current = doSave(opts).finally(() => {
      inflight.current = null;
    });
    await inflight.current;
  }

  useEffect(() => {
    if (saveState !== "dirty") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveNow(), delayMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, saveState, delayMs]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      const s = useEditor.getState().saveState;
      if (s === "dirty" || s === "saving") {
        e.preventDefault();
        void saveNow();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { saveNow };
}
