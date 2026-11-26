/**
 * Server-side rendering of a ProjectDoc with Remotion. Used by the render worker.
 * The same composition (src/remotion) powers the in-browser preview player.
 */
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { makeCancelSignal, renderMedia, selectComposition } from "@remotion/renderer";
import type { ExportSettings, ProjectDoc } from "../../lib/project/schema";
import { CODECS, CRF, outputSize, prepareExportDoc } from "./export-math";
export { estimateBytes, outputInfo, outputSize, prepareExportDoc } from "./export-math";

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

