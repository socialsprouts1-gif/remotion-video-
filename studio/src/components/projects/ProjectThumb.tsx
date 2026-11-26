"use client";
import { Thumbnail } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { ProjectComposition } from "@/remotion/ProjectComposition";
import type { ProjectDoc } from "@/lib/project/schema";

/** Live thumbnail rendered from the project document (same composition as export). */
export function ProjectThumb({ doc, className }: { doc: ProjectDoc; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const { width, height, fps, durationInFrames } = doc.settings;
  const frame = Math.min(durationInFrames - 1, Math.round(fps * 1.5));
  return (
    <div ref={ref} className={className} style={{ aspectRatio: `${width}/${height}`, background: doc.settings.background }}>
      {visible ? (
        <Thumbnail
          component={ProjectComposition}
          inputProps={{ doc }}
          compositionWidth={width}
          compositionHeight={height}
          durationInFrames={Math.max(1, durationInFrames)}
          fps={fps}
          frameToDisplay={Math.max(0, frame)}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  );
}
