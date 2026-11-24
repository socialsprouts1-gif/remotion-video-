"use client";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface Toast { id: number; tone: "success" | "error" | "info"; text: string }
const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; drop: (id: number) => void }>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), t.tone === "error" ? 7000 : 3500);
  },
  drop: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (text: string) => useToasts.getState().push({ tone: "success", text }),
  error: (text: string) => useToasts.getState().push({ tone: "error", text }),
  info: (text: string) => useToasts.getState().push({ tone: "info", text }),
};

export function Toaster() {
  const { toasts, drop } = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} onClick={() => drop(t.id)} className="pointer-events-auto panel flex items-start gap-2.5 bg-ink-850 px-4 py-3 text-sm">
            {t.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : t.tone === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />}
            <span className="text-ink-100">{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
