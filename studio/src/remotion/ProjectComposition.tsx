import React from "react";
import { AbsoluteFill, Sequence, getRemotionEnvironment } from "remotion";
import type { ProjectDoc, Track, VisualClip } from "../lib/project/schema";
import { ClipLayer } from "./ClipLayer";
import { EffectContent } from "./effects";
import { fontsInDoc, useDocFonts } from "./fonts";
import { AdjustmentContent, AudioContent, ImageContent, SceneContent, ShapeContent, SolidContent, TextContent, VideoContent } from "./layers";

export interface CompositionProps {
  doc: ProjectDoc;
  watermark?: string | null;
  includeAudio?: boolean;
  [key: string]: unknown;
}

const VisualClipView: React.FC<{ clip: VisualClip; track: Track }> = ({ clip, track }) => (
  <ClipLayer clip={clip}>
    {({ motion, local }) => {
      switch (clip.type) {
        case "video":
          return <VideoContent clip={clip} track={track} />;
        case "image":
          return <ImageContent clip={clip} local={local} />;
        case "text":
          return <TextContent clip={clip} motion={motion} local={local} />;
        case "shape":
          return <ShapeContent clip={clip} local={local} />;
        case "solid":
          return <SolidContent clip={clip} local={local} />;
        case "adjustment":
          return <AdjustmentContent clip={clip} />;
        case "effect":
          return <EffectContent clip={clip} local={local} />;
        case "scene":
          return <SceneContent clip={clip} local={local} />;
      }
    }}
  </ClipLayer>
);

export const ProjectComposition: React.FC<CompositionProps> = ({ doc, watermark, includeAudio = true }) => {
  useDocFonts(fontsInDoc(doc));
  const { isPlayer } = getRemotionEnvironment();
  // tracks[0] is the top of the stack -> render bottom-up
  const ordered = [...doc.tracks].reverse();
  return (
    <AbsoluteFill style={{ background: doc.settings.background, overflow: "hidden" }}>
      {ordered.map((track) => {
        if (track.hidden) return null;
        return (
          <AbsoluteFill key={track.id}>
            {track.clips.map((clip) => {
              if (clip.type === "audio") {
                if (!includeAudio) return null;
                return (
                  <Sequence key={clip.id} from={clip.start} durationInFrames={clip.duration} layout="none">
                    <AudioContent clip={clip} track={track} />
                  </Sequence>
                );
              }
              return (
                <Sequence key={clip.id} from={clip.start} durationInFrames={clip.duration} premountFor={isPlayer && clip.type === "video" ? doc.settings.fps : undefined}>
                  {clip.type === "video" && !includeAudio ? <VisualClipView clip={{ ...clip, muted: true }} track={track} /> : <VisualClipView clip={clip} track={track} />}
                </Sequence>
              );
            })}
          </AbsoluteFill>
        );
      })}
      {watermark ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: Math.round(doc.settings.height * 0.03) }}>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: Math.round(Math.min(doc.settings.width, doc.settings.height) * 0.028),
              color: "rgba(255,255,255,0.75)",
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
              letterSpacing: "0.04em",
            }}
          >
            {watermark}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
