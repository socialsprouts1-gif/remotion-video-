/**
 * Export maths with no Remotion imports, so web routes (estimate, download) stay
 * small enough for serverless hosts. The renderer itself lives in render-doc.ts.
 */
import type { Codec } from "@remotion/renderer";
import { EXPORT_RESOLUTIONS, type ExportSettings, type ProjectDoc } from "../../lib/project/schema";
import { applyCommands, retime } from "../../lib/project/ops";

export const CODECS: Record<ExportSettings["format"], { codec: Codec; ext: string; mime: string }> = {
  mp4: { codec: "h264", ext: "mp4", mime: "video/mp4" },
  webm: { codec: "vp8", ext: "webm", mime: "video/webm" },
  mov: { codec: "prores", ext: "mov", mime: "video/quicktime" },
  gif: { codec: "gif", ext: "gif", mime: "image/gif" },
};

export function outputInfo(format: ExportSettings["format"]) {
  return CODECS[format];
}

export const CRF: Record<ExportSettings["quality"], number> = { draft: 30, standard: 23, high: 18, master: 14 };

/** Prepare the doc for export: range, aspect, fps. Returns a new doc. */
export function prepareExportDoc(input: ProjectDoc, settings: ExportSettings): ProjectDoc {
  let doc: ProjectDoc = structuredClone(input);
  if (settings.aspectRatio !== "project") doc = applyCommands(doc, [{ op: "changeAspect", aspect: settings.aspectRatio }]).doc;
  if (settings.fps !== doc.settings.fps) retime(doc, settings.fps);
  return doc;
}

/** Output pixel size for a doc at a resolution class (short side = target). */
export function outputSize(doc: ProjectDoc, resolution: ExportSettings["resolution"]) {
  const short = EXPORT_RESOLUTIONS[resolution];
  const { width, height } = doc.settings;
  const scale = short / Math.min(width, height);
  const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  return { scale, width: even(width * scale), height: even(height * scale) };
}

export function estimateBytes(doc: ProjectDoc, settings: ExportSettings) {
  const { width, height } = outputSize(doc, settings.resolution);
  const seconds = doc.settings.durationInFrames / doc.settings.fps;
  const bppByQuality = { draft: 0.04, standard: 0.08, high: 0.13, master: 0.22 }[settings.quality];
  const motion = settings.fps / 30;
  let bits = width * height * settings.fps * bppByQuality * seconds * Math.sqrt(motion);
  if (settings.format === "mov") bits *= 8;
  if (settings.format === "gif") bits *= 3;
  if (settings.includeAudio) bits += 192_000 * seconds;
  return Math.round(bits / 8);
}

