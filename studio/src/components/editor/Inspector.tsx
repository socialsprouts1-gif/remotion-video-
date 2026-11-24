"use client";
import { Wand2, Trash2, RotateCcw, Shuffle } from "lucide-react";
import { findClip } from "@/lib/project/ops";
import { ANIMATION_PRESETS, TRANSITION_TYPES, type AnimationSpec, type Clip, type ClipOf, type Effects, type EasingName } from "@/lib/project/schema";
import { EASING_LABELS } from "@/lib/motion/easing";
import { PRESET_INFO } from "@/lib/motion/presets";
import { EFFECTS } from "@/lib/motion/effects";
import { FONT_LIBRARY_NAMES } from "@/lib/ai/fonts-list";
import { Button } from "@/components/ui";
import { useEditor } from "./store";
import { ColorInput, NumberInput, Row, Section, Select, Slider, useAnimatable } from "./inspector-fields";
import { ProjectSettingsPanel } from "./ProjectSettings";

const EASINGS = Object.keys(EASING_LABELS).map((k) => ({ value: k as EasingName, label: EASING_LABELS[k] }));

export function Inspector() {
  const doc = useEditor((s) => s.doc);
  const selection = useEditor((s) => s.selection);
  if (selection.length === 0) return <ProjectSettingsPanel />;
  if (selection.length > 1) return <MultiInspector ids={selection} />;
  const f = findClip(doc, selection[0]);
  if (!f) return <ProjectSettingsPanel />;
  return <ClipInspector key={f.clip.id} clip={f.clip} />;
}

function useUpdate(clip: Clip) {
  const dispatch = useEditor((s) => s.dispatch);
  return (patch: Record<string, unknown>, label?: string) => dispatch([{ op: "updateClip", clipId: clip.id, patch }], label);
}

function ClipInspector({ clip }: { clip: Clip }) {
  const update = useUpdate(clip);
  const fps = useEditor((s) => s.doc.settings.fps);
  return (
    <div className="text-xs">
      <div className="flex items-center gap-2 border-b border-white/[0.05] px-3 py-3">
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-300">{clip.type}</span>
        <input className="field-sm flex-1 font-medium" value={clip.name} placeholder="Layer name" onChange={(e) => update({ name: e.target.value }, "Rename layer")} />
      </div>
      <Section title="Timing">
        <Row label="Start">
          <NumberInput value={clip.start / fps} step={1 / fps} min={0} suffix="s" onChange={(v) => update({ start: Math.round(v * fps) }, "Timing")} />
        </Row>
        <Row label="Duration">
          <NumberInput value={clip.duration / fps} step={1 / fps} min={1 / fps} suffix="s" onChange={(v) => update({ duration: Math.max(1, Math.round(v * fps)) }, "Timing")} />
        </Row>
      </Section>

      {clip.type === "text" ? <TextSection clip={clip} /> : null}
      {clip.type === "shape" ? <ShapeSection clip={clip} /> : null}
      {clip.type === "solid" ? <SolidSection clip={clip} /> : null}
      {clip.type === "effect" ? <EffectSection clip={clip} /> : null}
      {clip.type === "scene" ? <SceneSection clip={clip} /> : null}
      {clip.type === "video" || clip.type === "audio" ? <MediaSection clip={clip} /> : null}
      {clip.type === "image" ? (
        <Section title="Image">
          <Row label="Fit">
            <Select value={clip.fit} options={["cover", "contain", "fill"] as const} onChange={(v) => update({ fit: v })} />
          </Row>
          <Row label="Ken Burns">
            <Slider value={clip.kenBurns} min={0} max={2} step={0.05} onChange={(v) => update({ kenBurns: v }, "Ken Burns")} />
          </Row>
        </Section>
      ) : null}
      {clip.type === "adjustment" ? (
        <Section title="Adjustment layer">
          <p className="text-[11px] leading-relaxed text-ink-400">Color settings below apply to every layer beneath this one while it is on screen.</p>
          <Row label="Letterbox">
            <Slider value={clip.letterbox} min={0} max={0.25} step={0.005} onChange={(v) => update({ letterbox: v }, "Letterbox")} />
          </Row>
        </Section>
      ) : null}

      {clip.type !== "audio" ? (
        <>
          <TransformSection clip={clip} />
          <ColorSection clip={clip} />
          <AnimationSection clip={clip} />
          <TransitionSection clip={clip} />
          <CropMaskSection clip={clip} />
        </>
      ) : (
        <AudioKeyframes clip={clip} />
      )}
    </div>
  );
}

function TransformSection({ clip }: { clip: Exclude<Clip, { type: "audio" }> }) {
  const update = useUpdate(clip);
  const t = clip.transform;
  const { width, height } = useEditor((s) => s.doc.settings);
  const setT = (k: keyof typeof t) => (v: number | string) => update({ transform: { [k]: v } }, `Transform ${k}`);
  const x = useAnimatable(clip, "x", t.x, setT("x"));
  const y = useAnimatable(clip, "y", t.y, setT("y"));
  const sc = useAnimatable(clip, "scale", t.scale, setT("scale"));
  const rot = useAnimatable(clip, "rotation", t.rotation, setT("rotation"));
  const op = useAnimatable(clip, "opacity", t.opacity, setT("opacity"));
  const ry = useAnimatable(clip, "rotateY", t.rotateY, setT("rotateY"));
  return (
    <Section
      title="Transform"
      right={
        <button title="Reset transform" className="text-ink-500 hover:text-white" onClick={() => update({ transform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, skewX: 0, rotateY: 0 } }, "Reset transform")}>
          <RotateCcw className="h-3 w-3" />
        </button>
      }
    >
      <Row label="Position" kf={x.button}>
        <NumberInput value={x.value as number} onChange={x.set} suffix="x" />
        <NumberInput value={y.value as number} onChange={y.set} suffix="y" />
        {y.button}
      </Row>
      <Row label="Scale" kf={sc.button}>
        <Slider value={sc.value as number} min={0} max={4} step={0.01} onChange={sc.set} />
      </Row>
      <Row label="Rotation" kf={rot.button}>
        <Slider value={rot.value as number} min={-360} max={360} step={1} onChange={rot.set} />
      </Row>
      <Row label="Opacity" kf={op.button}>
        <Slider value={op.value as number} min={0} max={1} step={0.01} onChange={op.set} />
      </Row>
      <Row label="3D turn" kf={ry.button}>
        <Slider value={ry.value as number} min={-180} max={180} step={1} onChange={ry.set} />
      </Row>
      <Row label="Box size">
        <NumberInput value={t.width ?? width} min={1} onChange={(v) => update({ transform: { width: Math.round(v) } }, "Box size")} suffix="w" precision={0} />
        <NumberInput value={t.height ?? height} min={1} onChange={(v) => update({ transform: { height: Math.round(v) } }, "Box size")} suffix="h" precision={0} />
      </Row>
      <Row label="Blend">
        <Select value={clip.blendMode} options={["normal", "screen", "multiply", "overlay", "lighten", "darken", "soft-light", "difference", "color-dodge"] as const} onChange={(v) => update({ blendMode: v })} />
      </Row>
    </Section>
  );
}

function ColorSection({ clip }: { clip: Exclude<Clip, { type: "audio" }> }) {
  const update = useUpdate(clip);
  const e = clip.effects;
  const setE = (k: keyof Effects) => (v: number | string) => update({ effects: { [k]: v } }, `Color ${k}`);
  const br = useAnimatable(clip, "brightness", e.brightness, setE("brightness"));
  const co = useAnimatable(clip, "contrast", e.contrast, setE("contrast"));
  const sa = useAnimatable(clip, "saturation", e.saturation, setE("saturation"));
  const bl = useAnimatable(clip, "blur", e.blur, setE("blur"));
  const simple: [keyof Effects, string, number, number, number][] = [
    ["exposure", "Exposure", -2, 2, 0.05],
    ["temperature", "Temperature", -1, 1, 0.01],
    ["tint", "Tint", -1, 1, 0.01],
    ["hue", "Hue", -180, 180, 1],
    ["sharpen", "Sharpen", 0, 1, 0.01],
    ["vignette", "Vignette", 0, 1, 0.01],
    ["grain", "Grain", 0, 1, 0.01],
    ["grayscale", "B&W", 0, 1, 0.01],
  ];
  return (
    <Section
      title="Color & effects"
      defaultOpen={clip.type === "video" || clip.type === "image" || clip.type === "adjustment"}
      right={
        <button title="Reset color" className="text-ink-500 hover:text-white" onClick={() => update({ effects: { brightness: 1, contrast: 1, saturation: 1, exposure: 0, temperature: 0, tint: 0, hue: 0, blur: 0, sharpen: 0, vignette: 0, grain: 0, grayscale: 0 } }, "Reset color")}>
          <RotateCcw className="h-3 w-3" />
        </button>
      }
    >
      <div className="flex flex-wrap gap-1 pb-1">
        {[
          ["Warm film", { temperature: 0.3, contrast: 1.08, saturation: 1.05, vignette: 0.25, grain: 0.2 }],
          ["Teal & orange", { temperature: 0.15, tint: -0.1, contrast: 1.15, saturation: 1.15 }],
          ["Cool night", { temperature: -0.4, brightness: 0.9, contrast: 1.1 }],
          ["Noir", { grayscale: 1, contrast: 1.3, vignette: 0.5 }],
          ["Vivid", { saturation: 1.35, contrast: 1.08 }],
          ["Faded", { contrast: 0.85, saturation: 0.75, exposure: 0.15 }],
        ].map(([name, patch]) => (
          <button key={name as string} className="rounded-md border border-white/[0.07] bg-ink-850 px-2 py-1 text-[10px] hover:border-accent/50" onClick={() => update({ effects: patch as object }, `Look: ${name}`)}>
            {name as string}
          </button>
        ))}
      </div>
      <Row label="Brightness" kf={br.button}>
        <Slider value={br.value as number} min={0} max={2} onChange={br.set} />
      </Row>
      <Row label="Contrast" kf={co.button}>
        <Slider value={co.value as number} min={0} max={2} onChange={co.set} />
      </Row>
      <Row label="Saturation" kf={sa.button}>
        <Slider value={sa.value as number} min={0} max={3} onChange={sa.set} />
      </Row>
      <Row label="Blur" kf={bl.button}>
        <Slider value={bl.value as number} min={0} max={60} step={0.5} onChange={bl.set} />
      </Row>
      {simple.map(([k, label, min, max, step]) => (
        <Row key={k} label={label}>
          <Slider value={e[k] as number} min={min} max={max} step={step} onChange={(v) => update({ effects: { [k]: v } }, `Color ${k}`)} />
        </Row>
      ))}
    </Section>
  );
}

function AnimationEditor({ spec, onChange, isText }: { spec: AnimationSpec; onChange: (s: AnimationSpec | null) => void; isText: boolean }) {
  const presets = ANIMATION_PRESETS.filter((p) => isText || !PRESET_INFO[p]?.text);
  return (
    <div className="space-y-2 rounded-lg border border-white/[0.06] bg-ink-850/60 p-2">
      <Row label="Preset">
        <Select value={spec.preset} options={presets.map((p) => ({ value: p, label: PRESET_INFO[p]?.label ?? p }))} onChange={(v) => onChange({ ...spec, preset: v })} />
        <button title="Remove" className="text-ink-500 hover:text-rose-300" onClick={() => onChange(null)}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </Row>
      <Row label="Duration">
        <NumberInput value={spec.duration} min={1} step={1} suffix="f" precision={0} onChange={(v) => onChange({ ...spec, duration: Math.max(1, Math.round(v)) })} />
        <NumberInput value={spec.delay} min={0} step={1} suffix="delay" precision={0} onChange={(v) => onChange({ ...spec, delay: Math.max(0, Math.round(v)) })} />
      </Row>
      <Row label="Easing">
        <Select value={typeof spec.easing === "string" ? spec.easing : "easeOutCubic"} options={EASINGS} onChange={(v) => onChange({ ...spec, easing: v })} />
      </Row>
      <Row label="Direction">
        <Select value={spec.direction} options={["up", "down", "left", "right"] as const} onChange={(v) => onChange({ ...spec, direction: v })} />
      </Row>
      <Row label="Intensity">
        <Slider value={spec.intensity} min={0} max={2} onChange={(v) => onChange({ ...spec, intensity: v })} />
      </Row>
      {isText && (spec.preset === "kinetic" || spec.preset === "typewriter") ? (
        <>
          <Row label="Split by">
            <Select value={spec.splitBy} options={["letter", "word", "line"] as const} onChange={(v) => onChange({ ...spec, splitBy: v })} />
          </Row>
          <Row label="Stagger">
            <Slider value={spec.stagger} min={0} max={12} step={0.5} onChange={(v) => onChange({ ...spec, stagger: v })} />
          </Row>
        </>
      ) : null}
    </div>
  );
}

function AnimationSection({ clip }: { clip: Exclude<Clip, { type: "audio" }> }) {
  const dispatch = useEditor((s) => s.dispatch);
  const set = (side: "in" | "out") => (a: AnimationSpec | null) => dispatch([{ op: "setAnimation", clipId: clip.id, side, animation: a }], `Animation ${side}`);
  const isText = clip.type === "text";
  const bakeable = [clip.animationIn, clip.animationOut].some((a) => a && PRESET_INFO[a.preset]?.bakeable);
  const def = (preset: AnimationSpec["preset"]): AnimationSpec => ({ preset, duration: 18, delay: 0, easing: "easeOutCubic", direction: "up", intensity: 1, stagger: 2, splitBy: isText ? "word" : "word" });
  return (
    <Section title="Animation">
      <div className="label">In</div>
      {clip.animationIn ? <AnimationEditor spec={clip.animationIn} isText={isText} onChange={set("in")} /> : <PresetPicker isText={isText} onPick={(p) => set("in")(def(p))} />}
      <div className="label pt-1">Out</div>
      {clip.animationOut ? <AnimationEditor spec={clip.animationOut} isText={isText} onChange={set("out")} /> : <PresetPicker isText={isText} onPick={(p) => set("out")({ ...def(p), easing: "easeInCubic" })} />}
      <div className="label pt-1">Loop</div>
      <Row label="Loop">
        <Select
          value={clip.loop?.preset ?? "none"}
          options={[{ value: "none", label: "None" }, ...["pulse", "float", "spin", "shake", "drift", "flicker"].map((v) => ({ value: v, label: v }))]}
          onChange={(v) => dispatch([{ op: "setLoop", clipId: clip.id, loop: v === "none" ? null : { preset: v as "pulse", period: clip.loop?.period ?? 60, intensity: clip.loop?.intensity ?? 1 } }])}
        />
      </Row>
      {clip.loop ? (
        <Row label="Period">
          <Slider value={clip.loop.period} min={4} max={300} step={1} onChange={(v) => dispatch([{ op: "setLoop", clipId: clip.id, loop: { ...clip.loop!, period: Math.round(v) } }], "Loop period")} />
        </Row>
      ) : null}
      {bakeable ? (
        <Button size="xs" variant="outline" className="w-full" icon={<Wand2 className="h-3 w-3" />} onClick={() => dispatch([{ op: "bakeAnimation", clipId: clip.id }])}>
          Convert presets to keyframes
        </Button>
      ) : null}
      <KeyframeList clip={clip} />
    </Section>
  );
}

function PresetPicker({ isText, onPick }: { isText: boolean; onPick: (p: AnimationSpec["preset"]) => void }) {
  const presets = ANIMATION_PRESETS.filter((p) => (isText || !PRESET_INFO[p]?.text) && !["pulse", "shake"].includes(p));
  return (
    <div className="flex flex-wrap gap-1">
      {presets.map((p) => (
        <button key={p} className="rounded-md border border-white/[0.07] bg-ink-850 px-2 py-1 text-[10px] text-ink-200 hover:border-accent/50 hover:text-white" onClick={() => onPick(p)}>
          {PRESET_INFO[p]?.label ?? p}
        </button>
      ))}
    </div>
  );
}

function KeyframeList({ clip }: { clip: Clip }) {
  const dispatch = useEditor((s) => s.dispatch);
  const entries = Object.entries(clip.keyframes).filter(([, l]) => l && l.length);
  if (!entries.length) return <p className="pt-1 text-[11px] text-ink-500">Tip: click a ◇ next to any property to start keyframing it at the playhead.</p>;
  return (
    <div className="space-y-1.5 pt-2">
      <div className="label">Keyframes</div>
      {entries.map(([prop, list]) => (
        <div key={prop} className="rounded-md border border-white/[0.06] p-1.5">
          <div className="mb-1 flex items-center justify-between text-[11px] font-medium">
            {prop}
            <button className="text-ink-500 hover:text-rose-300" onClick={() => dispatch([{ op: "clearKeyframes", clipId: clip.id, prop: prop as "x" }])} title="Clear">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          {list!.map((k) => (
            <div key={k.id} className="flex items-center gap-1 py-0.5">
              <button className="w-10 text-left font-mono text-[10px] text-glow-amber hover:underline" onClick={() => useEditor.getState().setPlayhead(clip.start + k.frame)}>
                f{k.frame}
              </button>
              <span className="w-14 truncate font-mono text-[10px] text-ink-300">{typeof k.value === "number" ? Math.round(k.value * 100) / 100 : k.value}</span>
              <select
                className="field-sm flex-1 py-0.5 text-[10px]"
                value={typeof k.easing === "string" ? k.easing : "easeInOut"}
                onChange={(e) => dispatch([{ op: "setKeyframe", clipId: clip.id, prop: prop as "x", frame: k.frame, value: k.value, easing: e.target.value as EasingName }], "Keyframe easing")}
              >
                {EASINGS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button className="text-ink-500 hover:text-rose-300" onClick={() => dispatch([{ op: "removeKeyframe", clipId: clip.id, prop: prop as "x", keyframeId: k.id }])}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function TransitionSection({ clip }: { clip: Exclude<Clip, { type: "audio" }> }) {
  const dispatch = useEditor((s) => s.dispatch);
  const set = (side: "in" | "out", type: string, duration?: number) =>
    dispatch([{ op: "setTransition", clipId: clip.id, side, transition: type === "none" ? null : { type: type as "fade", duration: duration ?? (side === "in" ? clip.transitionIn : clip.transitionOut)?.duration ?? 15, easing: "easeInOutCubic" } }], `Transition ${side}`);
  const opts = [{ value: "none", label: "None" }, ...TRANSITION_TYPES.map((t) => ({ value: t, label: t }))];
  return (
    <Section title="Transitions" defaultOpen={false}>
      {(["in", "out"] as const).map((side) => {
        const tr = side === "in" ? clip.transitionIn : clip.transitionOut;
        return (
          <Row key={side} label={side === "in" ? "In" : "Out"}>
            <Select value={tr?.type ?? "none"} options={opts} onChange={(v) => set(side, v)} />
            {tr ? <NumberInput className="max-w-[70px] flex-none" value={tr.duration} min={1} precision={0} suffix="f" onChange={(v) => set(side, tr.type, Math.max(1, Math.round(v)))} /> : null}
          </Row>
        );
      })}
    </Section>
  );
}

function CropMaskSection({ clip }: { clip: Exclude<Clip, { type: "audio" }> }) {
  const update = useUpdate(clip);
  const c = clip.crop;
  return (
    <Section title="Crop & mask" defaultOpen={false}>
      {(["top", "right", "bottom", "left"] as const).map((k) => (
        <Row key={k} label={`Crop ${k}`}>
          <Slider value={c[k]} min={0} max={50} step={0.5} onChange={(v) => update({ crop: { [k]: v } }, "Crop")} />
        </Row>
      ))}
      <Row label="Mask">
        <Select
          value={clip.mask?.shape ?? "none"}
          options={[{ value: "none", label: "None" }, { value: "rect", label: "Rectangle" }, { value: "ellipse", label: "Ellipse" }]}
          onChange={(v) => update({ mask: v === "none" ? null : { shape: v, x: 50, y: 50, width: 80, height: 80, radius: 24, feather: 10, invert: false } }, "Mask")}
        />
      </Row>
      {clip.mask ? (
        <>
          {(["x", "y", "width", "height"] as const).map((k) => (
            <Row key={k} label={`Mask ${k}`}>
              <Slider value={clip.mask![k]} min={0} max={100} step={0.5} onChange={(v) => update({ mask: { ...clip.mask!, [k]: v } }, "Mask")} />
            </Row>
          ))}
          <Row label={clip.mask.shape === "rect" ? "Radius" : "Feather"}>
            <Slider value={clip.mask.shape === "rect" ? clip.mask.radius : clip.mask.feather} min={0} max={clip.mask.shape === "rect" ? 300 : 100} step={1} onChange={(v) => update({ mask: { ...clip.mask!, [clip.mask!.shape === "rect" ? "radius" : "feather"]: v } }, "Mask")} />
          </Row>
          {clip.mask.shape === "ellipse" ? (
            <Row label="Invert">
              <input type="checkbox" checked={clip.mask.invert} onChange={(e) => update({ mask: { ...clip.mask!, invert: e.target.checked } })} />
            </Row>
          ) : null}
        </>
      ) : null}
    </Section>
  );
}

function TextSection({ clip }: { clip: ClipOf<"text"> }) {
  const update = useUpdate(clip);
  const s = clip.style;
  const setS = (k: keyof typeof s) => (v: unknown) => update({ style: { [k]: v } }, `Text ${k}`);
  const color = useAnimatable(clip, "color", s.color, setS("color"));
  return (
    <Section title="Text">
      <textarea className="field min-h-[64px] text-sm" value={clip.text} onChange={(e) => update({ text: e.target.value, words: null }, "Edit text")} />
      {clip.words ? <p className="text-[11px] text-ink-400">Word-timed captions ({clip.words.length} words). Editing the text removes word timing.</p> : null}
      <Row label="Font">
        <Select value={s.fontFamily} options={FONT_LIBRARY_NAMES} onChange={setS("fontFamily")} />
      </Row>
      <Row label="Size / weight">
        <NumberInput value={s.fontSize} min={4} precision={0} onChange={setS("fontSize")} suffix="px" />
        <Select value={String(s.fontWeight) as "400"} options={["300", "400", "500", "600", "700", "800", "900"] as const} onChange={(v) => setS("fontWeight")(Number(v))} />
      </Row>
      <Row label="Color" kf={color.button}>
        <ColorInput value={color.value as string} onChange={color.set} />
      </Row>
      <Row label="Align">
        <Select value={s.align} options={["left", "center", "right"] as const} onChange={setS("align")} />
        <Select value={s.textTransform} options={["none", "uppercase", "lowercase"] as const} onChange={setS("textTransform")} />
      </Row>
      <Row label="Spacing">
        <NumberInput value={s.letterSpacing} step={0.01} onChange={setS("letterSpacing")} suffix="em" />
        <NumberInput value={s.lineHeight} step={0.05} min={0.5} onChange={setS("lineHeight")} suffix="lh" />
      </Row>
      <Row label="Italic">
        <input type="checkbox" checked={s.italic} onChange={(e) => setS("italic")(e.target.checked)} />
      </Row>
      <Row label="Gradient">
        <input type="checkbox" checked={!!s.gradient} onChange={(e) => setS("gradient")(e.target.checked ? [s.color, "#8b7bff"] : null)} />
        {s.gradient ? (
          <>
            <ColorInput value={s.gradient[0]} onChange={(v) => setS("gradient")([v, s.gradient![1]])} />
            <ColorInput value={s.gradient[1]} onChange={(v) => setS("gradient")([s.gradient![0], v])} />
          </>
        ) : null}
      </Row>
      <Row label="Neon glow">
        <input type="checkbox" checked={!!s.glow} onChange={(e) => setS("glow")(e.target.checked ? "#ff4fd8" : null)} />
        {s.glow ? <ColorInput value={s.glow} onChange={setS("glow")} /> : null}
      </Row>
      <Row label="Outline">
        <NumberInput value={s.strokeWidth} min={0} step={0.5} onChange={(v) => update({ style: { strokeWidth: v, strokeColor: s.strokeColor ?? "#000000" } }, "Text outline")} suffix="px" />
        {s.strokeWidth > 0 ? <ColorInput value={s.strokeColor ?? "#000000"} onChange={setS("strokeColor")} /> : null}
      </Row>
      <Row label="3D extrude">
        <NumberInput value={s.extrude} min={0} max={40} precision={0} onChange={setS("extrude")} suffix="px" />
        {s.extrude > 0 ? <ColorInput value={s.extrudeColor} onChange={setS("extrudeColor")} /> : null}
      </Row>
      <Row label="Background">
        <input type="checkbox" checked={!!s.background} onChange={(e) => update({ style: { background: e.target.checked ? "#000000" : null, padding: e.target.checked ? Math.round(s.fontSize * 0.25) : 0 } }, "Text background")} />
        {s.background ? <ColorInput value={s.background} onChange={setS("background")} /> : null}
      </Row>
      {s.background ? (
        <Row label="Pad / radius">
          <NumberInput value={s.padding} min={0} precision={0} onChange={setS("padding")} />
          <NumberInput value={s.borderRadius} min={0} precision={0} onChange={setS("borderRadius")} />
        </Row>
      ) : null}
      <Row label="Shadow">
        <input type="checkbox" checked={!!s.shadow} onChange={(e) => setS("shadow")(e.target.checked ? "0 6px 30px rgba(0,0,0,0.5)" : null)} />
      </Row>
      {clip.words ? (
        <Row label="Highlight">
          <ColorInput value={clip.highlightColor} onChange={(v) => update({ highlightColor: v })} />
        </Row>
      ) : null}
    </Section>
  );
}

function ShapeSection({ clip }: { clip: ClipOf<"shape"> }) {
  const update = useUpdate(clip);
  const fill = useAnimatable(clip, "color", clip.fill, (v) => update({ fill: v }, "Shape fill"));
  return (
    <Section title="Shape">
      <Row label="Shape">
        <Select value={clip.shape} options={["rect", "ellipse", "triangle", "star", "line", "arrow", "ring"] as const} onChange={(v) => update({ shape: v })} />
      </Row>
      <Row label="Fill" kf={fill.button}>
        <ColorInput value={fill.value as string} onChange={fill.set} />
      </Row>
      <Row label="Gradient">
        <input type="checkbox" checked={!!clip.gradient} onChange={(e) => update({ gradient: e.target.checked ? [clip.fill, "#5ee1ff"] : null })} />
        {clip.gradient ? <ColorInput value={clip.gradient[1]} onChange={(v) => update({ gradient: [clip.gradient![0], v] }, "Gradient")} /> : null}
      </Row>
      <Row label="Stroke">
        <NumberInput value={clip.strokeWidth} min={0} precision={0} onChange={(v) => update({ strokeWidth: v, stroke: clip.stroke ?? "#ffffff" }, "Stroke")} />
        {clip.strokeWidth > 0 ? <ColorInput value={clip.stroke ?? "#ffffff"} onChange={(v) => update({ stroke: v }, "Stroke")} /> : null}
      </Row>
      {clip.shape === "rect" ? (
        <Row label="Radius">
          <Slider value={clip.radius} min={0} max={400} step={1} onChange={(v) => update({ radius: v }, "Radius")} />
        </Row>
      ) : null}
      {["line", "arrow", "ring"].includes(clip.shape) ? (
        <Row label="Draw on">
          <Slider value={clip.progress} min={0} max={1} onChange={(v) => update({ progress: v }, "Draw on")} />
        </Row>
      ) : null}
    </Section>
  );
}

function SolidSection({ clip }: { clip: ClipOf<"solid"> }) {
  const update = useUpdate(clip);
  const g = clip.gradient;
  return (
    <Section title="Background">
      <Row label="Color">
        <ColorInput value={clip.color} onChange={(v) => update({ color: v }, "Solid color")} />
      </Row>
      <Row label="Gradient">
        <Select
          value={g?.kind ?? "none"}
          options={[{ value: "none", label: "None" }, { value: "linear", label: "Linear" }, { value: "radial", label: "Radial" }]}
          onChange={(v) => update({ gradient: v === "none" ? null : { kind: v, angle: g?.angle ?? 135, stops: g?.stops ?? [[clip.color, 0], ["#8b7bff", 100]] } }, "Gradient")}
        />
      </Row>
      {g ? (
        <>
          {g.stops.map(([c, p], i) => (
            <Row key={i} label={`Stop ${i + 1}`}>
              <ColorInput value={c} onChange={(v) => update({ gradient: { ...g, stops: g.stops.map((s, j) => (j === i ? [v, s[1]] : s)) } }, "Gradient")} />
              <NumberInput className="max-w-[56px] flex-none" value={p} min={0} max={100} precision={0} onChange={(v) => update({ gradient: { ...g, stops: g.stops.map((s, j) => (j === i ? [s[0], v] : s)) } }, "Gradient")} />
            </Row>
          ))}
          {g.kind === "linear" ? (
            <Row label="Angle">
              <Slider value={g.angle} min={0} max={360} step={1} onChange={(v) => update({ gradient: { ...g, angle: v } }, "Gradient")} />
            </Row>
          ) : null}
          <Row label="Drift">
            <Slider value={clip.drift} min={0} max={4} step={0.1} onChange={(v) => update({ drift: v }, "Drift")} />
          </Row>
        </>
      ) : null}
    </Section>
  );
}

function EffectSection({ clip }: { clip: ClipOf<"effect"> }) {
  const update = useUpdate(clip);
  const def = EFFECTS[clip.effect];
  const p = clip.params;
  return (
    <Section title={def.label} right={<button title="New random seed" className="text-ink-500 hover:text-white" onClick={() => update({ seed: Math.floor(Math.random() * 10000) }, "Reseed")}><Shuffle className="h-3 w-3" /></button>}>
      <p className="text-[11px] text-ink-400">{def.description}</p>
      {def.params.map((d) => {
        const v = p[d.key] ?? d.default;
        const set = (nv: unknown) => update({ params: { [d.key]: nv } }, `${def.label} ${d.key}`);
        return (
          <Row key={d.key} label={d.label}>
            {d.type === "number" ? <Slider value={v as number} min={d.min} max={d.max} step={d.step ?? (d.max - d.min > 50 ? 1 : 0.01)} onChange={set} /> : null}
            {d.type === "color" ? <ColorInput value={v as string} onChange={set} /> : null}
            {d.type === "text" ? <input className="field-sm" value={v as string} onChange={(e) => set(e.target.value)} /> : null}
            {d.type === "select" ? <Select value={v as string} options={d.options} onChange={set} /> : null}
            {d.type === "boolean" ? <input type="checkbox" checked={v as boolean} onChange={(e) => set(e.target.checked)} /> : null}
            {d.type === "numbers" ? <input className="field-sm font-mono" defaultValue={(v as number[]).join(", ")} onBlur={(e) => set(e.target.value.split(",").map((x) => Number(x.trim())).filter((x) => Number.isFinite(x)))} /> : null}
            {d.type === "strings" ? <input className="field-sm font-mono" defaultValue={(v as string[]).join(", ")} onBlur={(e) => set(e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /> : null}
          </Row>
        );
      })}
    </Section>
  );
}

function SceneSection({ clip }: { clip: ClipOf<"scene"> }) {
  const update = useUpdate(clip);
  return (
    <Section title="Storyboard scene">
      <p className="text-[11px] leading-relaxed text-ink-400">This is a planned scene. Generate footage for it from the AI panel, or drop your own clip from Media onto this time range.</p>
      <Row label="Title">
        <input className="field-sm" value={clip.title} onChange={(e) => update({ title: e.target.value }, "Scene title")} />
      </Row>
      <div>
        <div className="label mb-1">Visual prompt</div>
        <textarea className="field min-h-[80px] text-xs" value={clip.visualPrompt} onChange={(e) => update({ visualPrompt: e.target.value }, "Scene prompt")} />
      </div>
      <Row label="Camera">
        <input className="field-sm" value={clip.camera} onChange={(e) => update({ camera: e.target.value }, "Scene camera")} placeholder="e.g. slow dolly-in" />
      </Row>
      <div>
        <div className="label mb-1">Description</div>
        <textarea className="field min-h-[56px] text-xs" value={clip.description} onChange={(e) => update({ description: e.target.value }, "Scene description")} />
      </div>
    </Section>
  );
}

function MediaSection({ clip }: { clip: ClipOf<"video"> | ClipOf<"audio"> }) {
  const update = useUpdate(clip);
  const dispatch = useEditor((s) => s.dispatch);
  const fps = useEditor((s) => s.doc.settings.fps);
  return (
    <Section title={clip.type === "video" ? "Video" : "Audio"}>
      <Row label="Speed">
        <Select value={String(clip.speed) as "1"} options={["0.25", "0.5", "0.75", "1", "1.25", "1.5", "2", "3", "4"].map((v) => ({ value: v as "1", label: `${v}×` }))} onChange={(v) => dispatch([{ op: "setSpeed", clipId: clip.id, speed: Number(v) }])} />
      </Row>
      <Row label="Volume">
        <Slider value={clip.volume} min={0} max={2} onChange={(v) => update({ volume: v }, "Volume")} />
      </Row>
      <Row label="Muted">
        <input type="checkbox" checked={clip.muted} onChange={(e) => update({ muted: e.target.checked })} />
      </Row>
      <Row label="Fade in/out">
        <NumberInput value={clip.fadeIn / fps} min={0} step={0.1} suffix="s" onChange={(v) => update({ fadeIn: Math.round(v * fps) }, "Audio fade")} />
        <NumberInput value={clip.fadeOut / fps} min={0} step={0.1} suffix="s" onChange={(v) => update({ fadeOut: Math.round(v * fps) }, "Audio fade")} />
      </Row>
      <Row label="Source in">
        <NumberInput value={clip.trimStart / fps} min={0} step={1 / fps} suffix="s" onChange={(v) => update({ trimStart: Math.max(0, Math.round(v * fps)) }, "Source in")} />
      </Row>
      {clip.type === "video" ? (
        <Row label="Fit">
          <Select value={clip.fit} options={["cover", "contain", "fill"] as const} onChange={(v) => update({ fit: v })} />
        </Row>
      ) : null}
      <p className="text-[11px] text-ink-500">Reverse playback isn&apos;t supported by the render pipeline yet.</p>
    </Section>
  );
}

function AudioKeyframes({ clip }: { clip: ClipOf<"audio"> }) {
  const update = useUpdate(clip);
  const vol = useAnimatable(clip, "volume", clip.volume, (v) => update({ volume: v }, "Volume"));
  return (
    <Section title="Volume automation">
      <Row label="Volume" kf={vol.button}>
        <Slider value={vol.value as number} min={0} max={2} onChange={vol.set} />
      </Row>
      <KeyframeList clip={clip} />
    </Section>
  );
}

function MultiInspector({ ids }: { ids: string[] }) {
  const dispatch = useEditor((s) => s.dispatch);
  return (
    <div className="p-4 text-xs">
      <div className="mb-3 font-semibold">{ids.length} layers selected</div>
      <div className="space-y-2">
        <Button size="sm" className="w-full" onClick={() => dispatch([{ op: "group", clipIds: ids }])}>Group</Button>
        <Button size="sm" className="w-full" onClick={() => dispatch(ids.map((id) => ({ op: "setTransition" as const, clipId: id, side: "in" as const, transition: { type: "fade" as const, duration: 12, easing: "easeInOutCubic" as const } })), "Fade in all")}>Fade in all</Button>
        <Button size="sm" className="w-full" onClick={() => dispatch(ids.map((id, i) => ({ op: "setAnimation" as const, clipId: id, side: "in" as const, animation: { preset: "slide" as const, duration: 16, delay: i * 4, easing: "easeOutCubic" as const, direction: "up" as const, intensity: 1, stagger: 2, splitBy: "word" as const } })), "Staggered slide-in")}>
          Staggered slide-in
        </Button>
        <Button size="sm" variant="danger" className="w-full" onClick={() => dispatch([{ op: "removeClips", clipIds: ids }])}>Delete</Button>
      </div>
    </div>
  );
}
