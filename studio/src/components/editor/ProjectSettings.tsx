"use client";
import { useEditor } from "./store";
import { aspectOf } from "@/lib/project/factory";
import { ColorInput, Row, Section, Select } from "./inspector-fields";

export function ProjectSettingsPanel() {
  const doc = useEditor((s) => s.doc);
  const dispatch = useEditor((s) => s.dispatch);
  const { width, height, fps, durationInFrames, background } = doc.settings;
  const aspect = aspectOf(width, height);
  return (
    <div className="text-xs">
      <div className="border-b border-white/[0.05] px-3 py-3 font-semibold">Project</div>
      <Section title="Canvas">
        <Row label="Aspect">
          <Select
            value={aspect === "custom" ? ("16:9" as const) : aspect}
            options={["16:9", "9:16", "1:1", "4:5"] as const}
            onChange={(v) => dispatch([{ op: "changeAspect", aspect: v }], `Change aspect to ${v}`)}
          />
        </Row>
        <Row label="Size">
          <span className="font-mono text-ink-300">
            {width} × {height}
          </span>
        </Row>
        <Row label="Frame rate">
          <Select value={String(fps) as "30"} options={["24", "25", "30", "50", "60"] as const} onChange={(v) => dispatch([{ op: "setSettings", patch: { fps: Number(v) } }], `Frame rate ${v}`)} />
        </Row>
        <Row label="Duration">
          <span className="font-mono text-ink-300">{(durationInFrames / fps).toFixed(2)}s</span>
        </Row>
        <Row label="Background">
          <ColorInput value={background} onChange={(v) => dispatch([{ op: "setSettings", patch: { background: v } }], "Background")} />
        </Row>
      </Section>
      {doc.plan ? (
        <Section title="Creative direction">
          <div className="space-y-2 text-[11px] leading-relaxed text-ink-300">
            <div className="text-ink-100">{doc.plan.creativeDirection.summary}</div>
            <div><span className="text-ink-500">Style:</span> {doc.plan.creativeDirection.visualStyle}</div>
            <div><span className="text-ink-500">Music:</span> {doc.plan.creativeDirection.music}</div>
            <div><span className="text-ink-500">Pacing:</span> {doc.plan.creativeDirection.pacing}</div>
            <div className="flex gap-1">
              {doc.plan.creativeDirection.palette.map((c) => (
                <span key={c} className="h-5 w-5 rounded border border-white/10" style={{ background: c }} title={c} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}
      <Section title="Shortcuts" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-y-1 text-[11px] text-ink-300">
          {[
            ["Space", "Play / pause"],
            ["← / →", "Frame step (Shift = 1s)"],
            ["S", "Split at playhead"],
            ["Del", "Delete"],
            ["Shift+Del", "Ripple delete"],
            ["Ctrl+Z / Ctrl+Shift+Z", "Undo / redo"],
            ["Ctrl+C / V / D", "Copy / paste / duplicate"],
            ["Ctrl+G", "Group"],
            ["M", "Add marker"],
            ["Ctrl+wheel", "Zoom timeline"],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <span className="font-mono text-ink-200">{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
