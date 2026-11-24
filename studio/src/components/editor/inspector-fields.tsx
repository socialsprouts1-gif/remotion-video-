"use client";
import { useRef, useState } from "react";
import { ChevronDown, Diamond } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AnimatableProp, Clip } from "@/lib/project/schema";
import { sampleNumber, sampleString } from "@/lib/motion/keyframes";
import { useEditor } from "./store";

export function Section({ title, children, defaultOpen = true, right }: { title: string; children: React.ReactNode; defaultOpen?: boolean; right?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.05]">
      <div className="flex items-center px-3 py-2.5">
        <button className="flex flex-1 items-center gap-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-300 hover:text-white" onClick={() => setOpen(!open)}>
          <ChevronDown className={cn("h-3 w-3 transition", !open && "-rotate-90")} />
          {title}
        </button>
        {right}
      </div>
      {open ? <div className="space-y-2.5 px-3 pb-3">{children}</div> : null}
    </div>
  );
}

export function Row({ label, children, kf }: { label: string; children: React.ReactNode; kf?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex w-[84px] shrink-0 items-center gap-1 text-[11px] text-ink-300">
        {kf}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </div>
  );
}

/** Number input with drag-to-scrub on the label area. */
export function NumberInput({ value, onChange, step = 1, min, max, suffix, precision = 2, className }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string; precision?: number; className?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const drag = useRef<{ x: number; v: number } | null>(null);
  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v));
  const round = (v: number) => Math.round(v * 10 ** precision) / 10 ** precision;
  return (
    <div className={cn("flex min-w-0 flex-1 items-center rounded-md border border-white/[0.07] bg-ink-850 focus-within:border-accent/60", className)}>
      <span
        className="cursor-ew-resize select-none px-1.5 text-[10px] text-ink-500"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, v: value };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          onChange(round(clamp(drag.current.v + ((e.clientX - drag.current.x) / 2) * step)));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        ⇔
      </span>
      <input
        className="w-full min-w-0 bg-transparent py-1 pr-1 text-xs tabular-nums outline-none"
        value={draft ?? String(round(value))}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== null) {
            const n = Number(draft);
            if (Number.isFinite(n)) onChange(clamp(n));
            setDraft(null);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "ArrowUp") onChange(round(clamp(value + step * (e.shiftKey ? 10 : 1))));
          if (e.key === "ArrowDown") onChange(round(clamp(value - step * (e.shiftKey ? 10 : 1))));
        }}
      />
      {suffix ? <span className="pr-1.5 text-[10px] text-ink-500">{suffix}</span> : null}
    </div>
  );
}

export function Slider({ value, onChange, min, max, step = 0.01 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <>
      <input type="range" className="min-w-0 flex-1" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <NumberInput className="max-w-[64px] flex-none" value={value} onChange={onChange} step={step} min={min} max={max} />
    </>
  );
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hex = value.startsWith("#") && (value.length === 7 || value.length === 4) ? value : "#ffffff";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <input type="color" value={hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex} onChange={(e) => onChange(e.target.value)} className="h-6 w-8 shrink-0 cursor-pointer" />
      <input className="field-sm font-mono" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Select<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[] | readonly T[]; onChange: (v: T) => void }) {
  const opts = (options as (T | { value: T; label: string })[]).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <select className="field-sm" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Animatable property binding. When the property has keyframes, edits write a
 * keyframe at the playhead; otherwise they change the base value.
 */
export function useAnimatable(clip: Clip, prop: AnimatableProp, base: number | string, setBase: (v: number | string) => void) {
  const playhead = useEditor((s) => s.playhead);
  const dispatch = useEditor((s) => s.dispatch);
  const local = Math.max(0, Math.min(clip.duration - 1, playhead - clip.start));
  const list = clip.keyframes[prop] ?? [];
  const animated = list.length > 0;
  const value = typeof base === "number" ? sampleNumber(clip.keyframes, prop, local, base) : sampleString(clip.keyframes, prop, local, base);
  const atFrame = list.find((k) => k.frame === local);
  const set = (v: number | string) => {
    if (animated) dispatch([{ op: "setKeyframe", clipId: clip.id, prop, frame: local, value: v }], `Keyframe ${prop}`);
    else setBase(v);
  };
  const toggle = () => {
    if (!animated) dispatch([{ op: "setKeyframe", clipId: clip.id, prop, frame: local, value }], `Animate ${prop}`);
    else if (atFrame) dispatch([{ op: "removeKeyframe", clipId: clip.id, prop, keyframeId: atFrame.id }], `Remove ${prop} keyframe`);
    else dispatch([{ op: "setKeyframe", clipId: clip.id, prop, frame: local, value }], `Keyframe ${prop}`);
  };
  const playheadInClip = playhead >= clip.start && playhead < clip.start + clip.duration;
  const button = (
    <button
      title={!animated ? `Animate ${prop} (add keyframe at playhead)` : atFrame ? "Remove keyframe" : "Add keyframe at playhead"}
      onClick={toggle}
      disabled={!playheadInClip}
      className="rounded p-0.5 text-ink-500 hover:text-glow-amber disabled:opacity-30"
    >
      <Diamond className={cn("h-3 w-3", animated && "text-glow-amber", atFrame && "fill-glow-amber")} />
    </button>
  );
  return { value, set, button, animated, local };
}
