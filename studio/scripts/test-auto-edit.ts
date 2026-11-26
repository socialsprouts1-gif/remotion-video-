/** Integration test: ingest sample footage, run Auto Edit (basic engine without a key), render the result. */
import path from "node:path";
import fs from "node:fs";
import { db } from "../src/server/db";
import { ingestFile } from "../src/server/services/assets";
import { runAutoEdit } from "../src/server/ai/auto-edit-runner";
import { renderProject } from "../src/server/render/render-doc";
import { resolveMediaForRender } from "../src/server/services/exports";
import { ExportSettings, ProjectDoc } from "../src/lib/project/schema";
import { analyzeFootage } from "../src/server/media/analyze";

async function main() {
const sample = process.argv[2];
const user = await db.user.upsert({ where: { email: "autoedit-test@lumora.local" }, update: {}, create: { email: "autoedit-test@lumora.local", name: "AE test" } });
const tmp = path.resolve("storage/.scratch/test-src.mov");
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.copyFileSync(sample, tmp);
const an = await analyzeFootage(tmp, { workDir: "storage/.scratch/an", maxFrames: 4, withBeats: true });
console.log("analysis:", { dur: an.durationSec, scenes: an.scenes.length, silences: an.silences.length, beats: an.beats.length, bpm: an.bpm, frames: an.frames.length });
const asset = await ingestFile({ ownerId: user.id, file: tmp, name: "sample.mov", mime: "video/quicktime" });
for (const styleId of ["reels", "cinematic"]) {
  const job = await db.aiJob.create({ data: { ownerId: user.id, capability: "auto-edit", provider: "lumora", model: "auto-edit", input: { assetIds: [asset.id], styleId, aspect: "9:16", targetDurationSec: 10, captions: true, prompt: "" } } });
  await runAutoEdit(job.id);
  const done = await db.aiJob.findUniqueOrThrow({ where: { id: job.id } });
  const out = done.output as { projectId: string; summary: string; notes: string[] };
  const proj = await db.project.findUniqueOrThrow({ where: { id: out.projectId } });
  const doc = ProjectDoc.parse(proj.document);
  console.log(styleId, done.status, out.summary, out.notes, "clips:", doc.tracks.map((t) => `${t.name}:${t.clips.length}`).join(" "), "dur", (doc.settings.durationInFrames / 30).toFixed(1));
  if (styleId === "reels") {
    const r = await renderProject({ doc: resolveMediaForRender(doc), settings: ExportSettings.parse({ resolution: "720p", quality: "draft" }), outFile: "storage/auto-edit-test.mp4", watermark: null });
    console.log("rendered", r);
  }
}
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
