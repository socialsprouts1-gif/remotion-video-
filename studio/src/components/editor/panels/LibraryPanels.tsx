"use client";
import { Circle, Square, Star, Triangle, ArrowRight, Minus, CircleDot, SlidersHorizontal } from "lucide-react";
import { EFFECTS, defaultParams, type EffectDef } from "@/lib/motion/effects";
import { EFFECT_KINDS } from "@/lib/project/schema";
import { toast } from "@/components/ui/toast";
import { useEditor } from "../store";

type ClipSpec = Record<string, unknown> & { type: string };

function addClip(spec: ClipSpec, label: string) {
  const st = useEditor.getState();
  const r = st.dispatch([{ op: "addClip", clip: { start: st.playhead, ...spec }, avoidOverlap: true }], label);
  if (r.ok) st.select(r.created);
  else toast.error(r.error ?? "Couldn't add");
}

function Tile({ spec, label, children, className }: { spec: () => ClipSpec; label: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      draggable
      onDragStart={(e) => e.dataTransfer.setData("application/x-lumora-clip", JSON.stringify(spec()))}
      onClick={() => addClip(spec(), `Add ${label}`)}
      className={`group flex flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-ink-850 text-left transition hover:border-accent/50 ${className ?? ""}`}
    >
      {children}
      <span className="truncate px-2 py-1.5 text-[10px] text-ink-300 group-hover:text-white">{label}</span>
    </button>
  );
}

function useCanvas() {
  const { width, height, fps } = useEditor((s) => s.doc.settings);
  return { w: width, h: height, s: Math.min(width, height), fps };
}

export function TextPanel() {
  const { w, h, s, fps } = useCanvas();
  const presets: { label: string; preview: React.ReactNode; spec: () => ClipSpec }[] = [
    { label: "Headline", preview: <span className="font-display text-lg font-extrabold">Headline</span>, spec: () => ({ type: "text", name: "Headline", text: "Your headline", duration: fps * 3, style: { fontFamily: "Syne", fontSize: Math.round(s * 0.1), fontWeight: 800 }, animationIn: { preset: "kinetic", duration: 20, splitBy: "word" } }) },
    { label: "Subtitle", preview: <span className="text-sm font-medium text-ink-200">Subtitle text</span>, spec: () => ({ type: "text", name: "Subtitle", text: "Supporting line", duration: fps * 3, transform: { y: Math.round(h * 0.12) }, style: { fontFamily: "Inter", fontSize: Math.round(s * 0.045), fontWeight: 500, color: "#d6dae3" }, animationIn: { preset: "fade", duration: 14 } }) },
    { label: "Kinetic letters", preview: <span className="text-base font-black tracking-widest">K I N E T I C</span>, spec: () => ({ type: "text", name: "Kinetic", text: "MOVE FAST", duration: fps * 3, style: { fontFamily: "Unbounded", fontSize: Math.round(s * 0.11), fontWeight: 900 }, animationIn: { preset: "kinetic", duration: 24, splitBy: "letter", stagger: 1.5 }, animationOut: { preset: "blur-reveal", duration: 10 } }) },
    { label: "Typewriter", preview: <span className="font-mono text-xs">type_writer▍</span>, spec: () => ({ type: "text", name: "Typewriter", text: "Typed one letter at a time", duration: fps * 4, style: { fontFamily: "JetBrains Mono", fontSize: Math.round(s * 0.05), fontWeight: 400 }, animationIn: { preset: "typewriter", duration: fps * 2, splitBy: "letter" } }) },
    { label: "Neon", preview: <span className="text-base font-bold text-pink-300" style={{ textShadow: "0 0 8px #ff4fd8" }}>NEON</span>, spec: () => ({ type: "text", name: "Neon", text: "NEON NIGHTS", duration: fps * 3, style: { fontFamily: "Bebas Neue", fontSize: Math.round(s * 0.14), color: "#ffe6fb", glow: "#ff4fd8", letterSpacing: 0.06 }, loop: { preset: "flicker", period: 40, intensity: 1 }, animationIn: { preset: "glitch", duration: 12 } }) },
    { label: "3D extruded", preview: <span className="text-base font-black" style={{ textShadow: "1px 1px 0 #333,2px 2px 0 #333,3px 3px 0 #333" }}>3D TEXT</span>, spec: () => ({ type: "text", name: "3D text", text: "BOLD 3D", duration: fps * 3, style: { fontFamily: "Anton", fontSize: Math.round(s * 0.16), color: "#ffd84d", extrude: 10, extrudeColor: "#a8461f" }, animationIn: { preset: "flip-3d", duration: 20, easing: "easeOutBack" } }) },
    { label: "Gradient", preview: <span className="bg-gradient-to-r from-white to-violet-400 bg-clip-text text-base font-extrabold text-transparent">Gradient</span>, spec: () => ({ type: "text", name: "Gradient title", text: "Gradient title", duration: fps * 3, style: { fontFamily: "Montserrat", fontSize: Math.round(s * 0.1), fontWeight: 900, gradient: ["#ffffff", "#8b7bff"] }, animationIn: { preset: "reveal", duration: 18, direction: "left" } }) },
    { label: "Serif elegant", preview: <span className="font-serif text-base italic">Elegant</span>, spec: () => ({ type: "text", name: "Serif title", text: "Quietly luxurious", duration: fps * 3, style: { fontFamily: "Playfair Display", fontSize: Math.round(s * 0.09), fontWeight: 400, italic: true }, animationIn: { preset: "blur-reveal", duration: 24 } }) },
    { label: "Caption box", preview: <span className="rounded bg-black px-1.5 py-0.5 text-xs font-bold">CAPTION</span>, spec: () => ({ type: "text", name: "Caption", text: "Social caption", duration: fps * 3, transform: { y: Math.round(h * 0.3) }, style: { fontFamily: "Poppins", fontSize: Math.round(s * 0.06), fontWeight: 800, background: "#000000", padding: Math.round(s * 0.015), borderRadius: 12 }, animationIn: { preset: "pop", duration: 10, easing: "easeOutBack" } }) },
    { label: "Lower-third text", preview: <span className="border-l-2 border-violet-400 pl-1.5 text-xs font-bold">Name Surname</span>, spec: () => ({ type: "text", name: "Name", text: "Name Surname", duration: fps * 4, transform: { x: Math.round(-w * 0.27), y: Math.round(h * 0.33), width: Math.round(w * 0.4), height: Math.round(h * 0.1) }, style: { fontFamily: "Inter", fontSize: Math.round(s * 0.045), fontWeight: 700, align: "left" }, animationIn: { preset: "slide", duration: 14, direction: "right" } }) },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {presets.map((p) => (
        <Tile key={p.label} label={p.label} spec={p.spec}>
          <div className="flex h-16 items-center justify-center overflow-hidden bg-black/30 px-2">{p.preview}</div>
        </Tile>
      ))}
    </div>
  );
}

const SHAPES = [
  { shape: "rect", icon: Square },
  { shape: "ellipse", icon: Circle },
  { shape: "triangle", icon: Triangle },
  { shape: "star", icon: Star },
  { shape: "line", icon: Minus },
  { shape: "arrow", icon: ArrowRight },
  { shape: "ring", icon: CircleDot },
] as const;

export function ElementsPanel() {
  const { w, h, s, fps } = useCanvas();
  const groups = new Map<string, EffectDef[]>();
  for (const k of EFFECT_KINDS) {
    const d = EFFECTS[k];
    groups.set(d.category, [...(groups.get(d.category) ?? []), d]);
  }
  const effectSpec = (d: EffectDef) => (): ClipSpec => ({
    type: "effect",
    effect: d.kind,
    name: d.label,
    duration: fps * 5,
    params: defaultParams(d.kind),
    blendMode: d.blendMode ?? "normal",
    seed: Math.floor(Math.random() * 1000),
    transform: d.box ? { width: Math.round((d.box.width / 1920) * w), height: Math.round((d.box.height / 1080) * h), y: d.box.y ? Math.round((d.box.y / 1080) * h) : 0 } : {},
  });
  return (
    <div className="space-y-4 p-3">
      <div>
        <div className="label mb-2">Shapes</div>
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map(({ shape, icon: Icon }) => (
            <Tile
              key={shape}
              label={shape}
              spec={() => ({
                type: "shape",
                shape,
                name: shape,
                duration: fps * 4,
                fill: "#8b7bff",
                transform: { width: Math.round(s * (shape === "line" || shape === "arrow" ? 0.4 : 0.25)), height: Math.round(s * (shape === "line" || shape === "arrow" ? 0.08 : 0.25)) },
                animationIn: { preset: "pop", duration: 12, easing: "easeOutBack" },
                ...(shape === "line" || shape === "arrow" || shape === "ring" ? { keyframes: { scaleX: [] } } : {}),
              })}
            >
              <div className="flex h-10 items-center justify-center bg-black/30">
                <Icon className="h-4 w-4 text-accent-soft" />
              </div>
            </Tile>
          ))}
        </div>
      </div>
      <div>
        <div className="label mb-2">Backgrounds & layers</div>
        <div className="grid grid-cols-2 gap-2">
          <Tile label="Solid color" spec={() => ({ type: "solid", name: "Solid", duration: fps * 5, color: "#11131a" })}>
            <div className="h-12 bg-[#11131a]" />
          </Tile>
          <Tile label="Gradient" spec={() => ({ type: "solid", name: "Gradient", duration: fps * 5, color: "#0b0d12", gradient: { kind: "linear", angle: 135, stops: [["#1b1440", 0], ["#0b2a3a", 100]] }, drift: 1 })}>
            <div className="h-12 bg-gradient-to-br from-[#1b1440] to-[#0b2a3a]" />
          </Tile>
          <Tile label="Adjustment layer" spec={() => ({ type: "adjustment", name: "Adjustment", duration: fps * 5, effects: { contrast: 1.1 } })}>
            <div className="flex h-12 items-center justify-center bg-gradient-to-r from-amber-500/20 to-cyan-500/20">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
          </Tile>
          <Tile label="Letterbox" spec={() => ({ type: "adjustment", name: "Letterbox", duration: fps * 5, letterbox: 0.1 })}>
            <div className="flex h-12 flex-col justify-between bg-ink-700">
              <div className="h-2 bg-black" />
              <div className="h-2 bg-black" />
            </div>
          </Tile>
        </div>
      </div>
      {[...groups.entries()].map(([cat, defs]) => (
        <div key={cat}>
          <div className="label mb-2">{cat}</div>
          <div className="grid grid-cols-2 gap-2">
            {defs.map((d) => (
              <Tile key={d.kind} label={d.label} spec={effectSpec(d)}>
                <div className="flex h-12 items-center justify-center bg-gradient-to-br from-accent/10 to-glow-cyan/5 px-2 text-center text-[9px] leading-tight text-ink-400">{d.description}</div>
              </Tile>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
