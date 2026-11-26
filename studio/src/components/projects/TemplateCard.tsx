"use client";
import { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { ProjectComposition } from "@/remotion/ProjectComposition";
import { buildTemplate, type TemplateInfo } from "@/lib/templates";
import { Badge } from "@/components/ui";
import { NewProjectDialog } from "./NewProjectDialog";
import { ProjectThumb } from "./ProjectThumb";

/** Template card with a live preview that plays on hover (rendered from the template's real document). */
export function TemplateCard({ t }: { t: TemplateInfo }) {
  const doc = useMemo(() => buildTemplate(t.id, "16:9"), [t.id]);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="group block w-full text-left">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] bg-black transition group-hover:border-accent/40 group-hover:shadow-glow">
          {hover ? (
            <Player component={ProjectComposition} inputProps={{ doc }} compositionWidth={doc.settings.width} compositionHeight={doc.settings.height} fps={doc.settings.fps} durationInFrames={doc.settings.durationInFrames} autoPlay loop style={{ width: "100%", height: "100%" }} />
          ) : (
            <ProjectThumb doc={doc} className="h-full w-full" />
          )}
          <div className="absolute left-2 top-2">
            <Badge className="bg-black/60 backdrop-blur">{t.durationSec}s</Badge>
          </div>
        </div>
        <div className="mt-2.5 px-0.5">
          <div className="text-sm font-medium">{t.name}</div>
          <div className="text-xs text-ink-400">{t.category}</div>
        </div>
      </button>
      {open ? <NewProjectDialog open onClose={() => setOpen(false)} templateId={t.id} templateName={t.name} defaultAspect={t.defaultAspect} /> : null}
    </>
  );
}
