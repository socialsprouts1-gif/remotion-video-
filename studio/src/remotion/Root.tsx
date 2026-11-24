import React from "react";
import { Composition } from "remotion";
import { newDocument } from "../lib/project/factory";
import { ProjectComposition, type CompositionProps } from "./ProjectComposition";

/** Render entry: the worker passes `{ doc, watermark }` as inputProps; metadata comes from the doc. */
export const Root: React.FC = () => (
  <Composition
    id="Project"
    component={ProjectComposition}
    defaultProps={{ doc: newDocument(), watermark: null, includeAudio: true } satisfies CompositionProps}
    calculateMetadata={({ props }) => ({
      width: props.doc.settings.width,
      height: props.doc.settings.height,
      fps: props.doc.settings.fps,
      durationInFrames: Math.max(1, props.doc.settings.durationInFrames),
    })}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={300}
  />
);
