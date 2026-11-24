/**
 * Server-side rendering of a ProjectDoc with Remotion. Used by the render worker.
 * The same composition (src/remotion) powers the in-browser preview player.
 */
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { makeCancelSignal, renderMedia, selectComposition, type Codec } from "@remotion/renderer";
import { EXPORT_RESOLUTIONS, type ExportSettings, type ProjectDoc } from "../../lib/project/schema";
import { applyCommands, retime, reframe } from "../../lib/project/ops";
import { ASPECTS } from "../../lib/project/schema";

let bundlePromise: Promise<string> | null = null;

export function getBundle(): Promise<string> {
  if (!bundlePromise) {
    const root = process.cwd();
    bundlePromise = bundle({
      entryPoint: path.join(root, "src/remotion/index.ts"),
      outDir: path.join(root, ".remotion-bundle"),
      publicDir: path.join(root, "public"),
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          alias: { ...(config.resolve?.alias ?? {}), "@": path.join(root, "src") },
        },
      }),
    }).catch((e) => {
      bundlePromise = null;
      throw e;
    });
  }
  return bundlePromise;
}

const CODECS: Record<ExportSettings["format"], { codec: Codec; ext: string; mime: string }> = {
  mp4: { codec: "h264", ext: "mp4", mime: "video/mp4" },
  webm: { codec: "vp8", ext: "webm", mime: "video/webm" },
  mov: { codec: "prores", ext: "mov", mime: "video/quicktime" },
  gif: { codec: "gif", ext: "gif", mime: "image/gif" },
};

export function outputInfo(format: ExportSettings["format"]) {
  return CODECS[format];
}

const CRF: Record<ExportSettings["quality"], number> = { draft: 30, standard: 23, high: 18, master: 14 };

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

export interface RenderOptions {
  doc: ProjectDoc;
  settings: ExportSettings;
  outFile: string;
  watermark: string | null;
  onProgress?: (p: { progress: number; stage: string }) => void;
  shouldCancel?: () => boolean;
}

export async function renderProject(opts: RenderOptions) {
  const { settings } = opts;
  const doc = prepareExportDoc(opts.doc, settings);
  const serveUrl = await getBundle();
  opts.onProgress?.({ progress: 0.02, stage: "Preparing composition" });
  const inputProps = { doc, watermark: opts.watermark, includeAudio: settings.includeAudio };
  const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
  const composition = await selectComposition({ serveUrl, id: "Project", inputProps, browserExecutable });
  const { scale } = outputSize(doc, settings.resolution);
  const { cancelSignal, cancel } = makeCancelSignal();
  const timer = setInterval(() => {
    if (opts.shouldCancel?.()) cancel();
  }, 1000);
  const info = CODECS[settings.format];
  fs.mkdirSync(path.dirname(opts.outFile), { recursive: true });
  const range = settings.range
    ? ([Math.max(0, settings.range.start), Math.min(doc.settings.durationInFrames - 1, settings.range.end)] as [number, number])
    : undefined;
  try {
    await renderMedia({
      serveUrl,
      composition,
      inputProps,
      codec: info.codec,
      outputLocation: opts.outFile,
      browserExecutable,
      scale,
      frameRange: range ?? null,
      crf: info.codec === "h264" || info.codec === "vp8" ? CRF[settings.quality] : undefined,
      proResProfile: info.codec === "prores" ? (settings.quality === "master" ? "4444" : "hq") : undefined,
      pixelFormat: info.codec === "prores" ? (settings.quality === "master" ? "yuva444p10le" : "yuv422p10le") : info.codec === "gif" ? undefined : "yuv420p",
      muted: !settings.includeAudio || info.codec === "gif",
      concurrency: Number(process.env.RENDER_CONCURRENCY || 2),
      everyNthFrame: info.codec === "gif" ? 2 : 1,
      imageFormat: "jpeg",
      jpegQuality: settings.quality === "draft" ? 70 : 92,
      cancelSignal,
      timeoutInMilliseconds: 60000,
      chromiumOptions: { gl: "swangle" },
      onProgress: ({ progress, stitchStage }) => {
        opts.onProgress?.({ progress: 0.05 + progress * 0.93, stage: stitchStage === "muxing" ? "Muxing audio" : progress < 1 ? "Rendering frames" : "Encoding" });
      },
    });
  } finally {
    clearInterval(timer);
  }
  return { mime: info.mime, ext: info.ext, size: fs.statSync(opts.outFile).size };
}

export { ASPECTS, reframe };
