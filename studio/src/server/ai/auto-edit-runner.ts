/**
 * Auto Edit job (runs in the worker): analyse footage → (transcribe) → Claude
 * looks at frames + analysis and plans the edit → build an editable project.
 */
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type Anthropic from "@anthropic-ai/sdk";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../db";
import { storage, scratchDir } from "../storage";
import { analyzeFootage, type FootageAnalysis } from "../media/analyze";
import { FFMPEG } from "../media/probe";
import { createProject } from "../services/projects";
import { llmConfigured, llmJson } from "./llm";
import { providerFetch } from "./types";
import { EDITING_PLAYBOOK, STYLE_PROFILE_GUIDE } from "../../lib/ai/playbooks";
import { BUILTIN_STYLES, StyleProfile, builtinStyle } from "../../lib/ai/edit-styles";
import { EditPlan, basicEditPlan, buildEditDoc, type SourceInfo } from "../../lib/ai/auto-edit";
import { wordsFromTranscript, type Word } from "../../lib/ai/captions";
import { nanoid } from "../../lib/id";

const run = promisify(execFile);

export const AutoEditInput = z.object({
  assetIds: z.array(z.string()).min(1).max(12),
  styleId: z.string().default("reels"),
  prompt: z.string().max(12000).default(""),
  referenceAssetId: z.string().nullable().optional(),
  musicAssetId: z.string().nullable().optional(),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:5"]).default("9:16"),
  targetDurationSec: z.number().min(3).max(600).nullable().optional(),
  captions: z.boolean().default(true),
});
export type AutoEditInput = z.infer<typeof AutoEditInput>;

async function setStage(jobId: string, stage: string, progress: number) {
  const j = await db.aiJob.findUnique({ where: { id: jobId }, select: { output: true, status: true } });
  if (j?.status === "CANCELED") throw new Error("canceled");
  await db.aiJob.update({ where: { id: jobId }, data: { progress, output: { ...((j?.output as object) ?? {}), stage } as Prisma.InputJsonValue } });
}

async function resolveStyle(ownerId: string, styleId: string): Promise<StyleProfile> {
  if (styleId.startsWith("custom:")) {
    const s = await db.editStyle.findFirst({ where: { id: styleId.slice(7), ownerId } });
    if (s) return StyleProfile.parse(s.profile);
  }
  return builtinStyle(styleId) ?? BUILTIN_STYLES[1];
}

/** Speech-to-text on a local file with ElevenLabs Scribe (word timestamps). Returns null when unavailable. */
async function transcribe(file: string, workDir: string): Promise<Word[] | null> {
  if (!process.env.ELEVENLABS_API_KEY) return null;
  const audio = path.join(workDir, `audio-${nanoid()}.mp3`);
  await run(FFMPEG, ["-v", "error", "-y", "-i", file, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "48k", audio], { timeout: 10 * 60_000 });
  const form = new FormData();
  form.append("model_id", process.env.ELEVENLABS_STT_MODEL || "scribe_v1");
  form.append("file", new Blob([await fs.readFile(audio)]), "audio.mp3");
  const res = await providerFetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }, body: form, timeoutMs: 15 * 60_000 });
  return wordsFromTranscript(await res.json());
}

function analysisSummary(a: FootageAnalysis, words?: Word[] | null) {
  return {
    durationSec: Math.round(a.durationSec * 100) / 100,
    resolution: a.width && a.height ? `${a.width}x${a.height}` : null,
    hasAudio: a.hasAudio,
    shotChangesSec: a.scenes.slice(0, 200),
    silencesSec: a.silences.slice(0, 200),
    transcript: words?.length ? words.slice(0, 4000).map((w) => `[${w.start.toFixed(2)}] ${w.text}`).join(" ") : null,
  };
}

const ClaudeResponse = z.object({ plan: EditPlan, styleProfile: StyleProfile.nullable().optional() });

const SYSTEM = `You are Lumora's senior video editor. You receive raw footage (analysis data + sampled frames you can see) and produce a precise edit plan as JSON. The app turns your plan into an editable timeline, so be exact with times.

${EDITING_PLAYBOOK}

${STYLE_PROFILE_GUIDE}

OUTPUT — return ONLY JSON:
{
  "plan": {
    "title": string, "summary": string (2-3 sentences: what you kept and why),
    "segments": [ { "source": <index of the source video>, "start": <sec in source>, "end": <sec in source>, "reason": string (≤6 words), "speed": 0.25-4, "zoom": "none"|"punch-in"|"slow-push"|"pull-out", "transition": null | "fade"|"slide-left"|"slide-right"|"slide-up"|"slide-down"|"zoom-in"|"zoom-out"|"wipe-left"|"wipe-right"|"circle"|"blur"|"glitch"|"flash"|"spin" } ],   // in TIMELINE order
    "titles": [ { "text": string, "at": <sec on the final timeline>, "duration": <sec>, "kind": "headline"|"lower-third"|"caption"|"cta" } ],
    "grade": { "brightness"?, "contrast"?, "saturation"?, "temperature"?(-1..1), "tint"?(-1..1), "vignette"?(0..1), "grain"?(0..1) },
    "overlays": [ "film-grain"|"light-leak"|"light-streaks"|"particles"|"glitch"|"scanlines" ],
    "letterbox": 0-0.15, "keepOriginalAudio": boolean, "musicVolume": 0-1
  },
  "styleProfile": null | { ...only when a REFERENCE video was provided: "name","description","avgShotSec","cutOnBeat","transitions","zoom","grade","letterbox","overlays","captions":"none"|"bold"|"clean"|"karaoke","textStyle":{"headlineFont","bodyFont","color","accent","uppercase"},"removeSilences","structure","notes" }
}
Rules:
- start/end must be inside each source's duration; prefer boundaries at shot changes, silences or word boundaries (use transcript timestamps; never cut inside a word).
- Total timeline length (sum of (end-start)/speed) must match the target duration within ±10% when one is given.
- Don't add titles that repeat what's being said; captions are added automatically from the transcript when the style uses them.
- Use only fonts: Inter, Space Grotesk, Montserrat, Poppins, Manrope, Syne, Bebas Neue, Oswald, Anton, Unbounded, Playfair Display, DM Serif Display, Cormorant Garamond, JetBrains Mono, Caveat.`;

export async function runAutoEdit(jobId: string) {
  const job = await db.aiJob.findUniqueOrThrow({ where: { id: jobId } });
  const input = AutoEditInput.parse(job.input);
  const work = scratchDir("auto-edit", job.id);
  const cleanups: (() => Promise<void>)[] = [];
  const notes: string[] = [];
  try {
    await db.aiJob.update({ where: { id: jobId }, data: { status: "RUNNING", attempts: { increment: 1 }, progress: 0.03, output: { stage: "Preparing footage" } } });
    const style = await resolveStyle(job.ownerId, input.styleId);
    const assets = await db.asset.findMany({ where: { id: { in: input.assetIds }, ownerId: job.ownerId } });
    const ordered = input.assetIds.map((id) => assets.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a && a.kind === "VIDEO");
    if (!ordered.length) throw new Error("No usable video files found");

    // 1. analyse sources
    const sources: SourceInfo[] = [];
    const analyses: FootageAnalysis[] = [];
    const framesPer = Math.max(4, Math.floor(24 / ordered.length));
    for (const [i, a] of ordered.entries()) {
      await setStage(jobId, `Analysing footage ${i + 1}/${ordered.length} (shots, silences, frames)`, 0.05 + (0.35 * i) / ordered.length);
      const local = await storage().toLocalFile(a.storageKey);
      cleanups.push(local.cleanup);
      const an = await analyzeFootage(local.path, { workDir: path.join(work, `src${i}`), maxFrames: llmConfigured() ? framesPer : 0 });
      let words: Word[] | null = null;
      if (input.captions && style.captions !== "none" && an.hasAudio) {
        await setStage(jobId, `Transcribing speech ${i + 1}/${ordered.length}`, 0.08 + (0.35 * i) / ordered.length);
        try {
          words = await transcribe(local.path, work);
          if (!words) notes.push("Captions skipped: add ELEVENLABS_API_KEY for automatic transcription.");
        } catch (e) {
          notes.push(`Transcription failed: ${(e as Error).message.slice(0, 120)}`);
        }
      }
      analyses.push(an);
      sources.push({ assetId: a.id, src: `/api/media/${a.id}`, name: a.name, durationSec: an.durationSec, hasAudio: an.hasAudio, silences: an.silences, scenes: an.scenes, words });
    }

    // 2. music + reference
    let music = null;
    if (input.musicAssetId) {
      const m = await db.asset.findFirst({ where: { id: input.musicAssetId, ownerId: job.ownerId } });
      if (m) {
        await setStage(jobId, "Detecting music beats", 0.42);
        const local = await storage().toLocalFile(m.storageKey);
        cleanups.push(local.cleanup);
        const an = await analyzeFootage(local.path, { workDir: path.join(work, "music"), maxFrames: 0, withBeats: true });
        music = { assetId: m.id, src: `/api/media/${m.id}`, durationSec: an.durationSec, beats: an.beats };
        if (an.bpm) notes.push(`Music tempo ≈ ${an.bpm} BPM; cuts synced to beats.`);
      }
    }
    let reference: FootageAnalysis | null = null;
    if (input.referenceAssetId) {
      const r = await db.asset.findFirst({ where: { id: input.referenceAssetId, ownerId: job.ownerId } });
      if (r) {
        await setStage(jobId, "Studying the reference video's style", 0.46);
        const local = await storage().toLocalFile(r.storageKey);
        cleanups.push(local.cleanup);
        reference = await analyzeFootage(local.path, { workDir: path.join(work, "ref"), maxFrames: llmConfigured() ? 10 : 0, withBeats: true });
      }
    }

    // 3. plan
    let plan: EditPlan;
    let styleProfile: StyleProfile | null = null;
    let engine: string;
    if (llmConfigured()) {
      await setStage(jobId, "Claude is watching your footage and planning the edit", 0.55);
      const content: Anthropic.ContentBlockParam[] = [
        {
          type: "text",
          text: JSON.stringify({
            userBrief: input.prompt || "(no extra instructions — follow the style)",
            style,
            targetDurationSec: input.targetDurationSec ?? null,
            aspectRatio: input.aspect,
            music: music ? { durationSec: music.durationSec, beatsSec: music.beats.slice(0, 400) } : null,
            sources: analyses.map((a, i) => ({ index: i, name: sources[i].name, ...analysisSummary(a, sources[i].words) })),
            reference: reference ? { durationSec: reference.durationSec, shotChangesSec: reference.scenes, avgShotSec: reference.avgShotSec, beatsSec: reference.beats.slice(0, 200), bpm: reference.bpm } : null,
          }),
        },
      ];
      for (const [i, a] of analyses.entries())
        for (const f of a.frames) {
          content.push({ type: "text", text: `Source ${i} frame at ${f.t.toFixed(1)}s:` });
          content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: (await fs.readFile(f.file)).toString("base64") } });
        }
      if (reference)
        for (const f of reference.frames) {
          content.push({ type: "text", text: `REFERENCE frame at ${f.t.toFixed(1)}s (style only, don't copy content):` });
          content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: (await fs.readFile(f.file)).toString("base64") } });
        }
      content.push({ type: "text", text: "Now return the JSON edit plan." });
      const r = await llmJson({ system: SYSTEM, user: content, schema: ClaudeResponse, effort: "medium", maxTokens: 32000 });
      plan = r.plan;
      styleProfile = r.styleProfile ?? null;
      engine = "claude";
    } else {
      await setStage(jobId, "Building the edit (basic editor, no AI)", 0.6);
      plan = basicEditPlan(sources, style, input.targetDurationSec ?? null);
      engine = "basic-editor";
      notes.push("Basic auto edit (no AI): connect Claude for edits that understand your footage.");
    }

    // 4. build project
    await setStage(jobId, "Building your timeline", 0.9);
    const doc = buildEditDoc({ plan, style, sources, music, aspect: input.aspect, targetDurationSec: input.targetDurationSec ?? null });
    doc.aiHistory.push({ id: nanoid(), at: new Date().toISOString(), kind: "assistant", prompt: `Auto Edit · ${style.name}${input.prompt ? ` · ${input.prompt.slice(0, 500)}` : ""}`, summary: plan.summary, engine });
    const project = await createProject(job.ownerId, plan.title || `${style.name} edit`, doc);
    await db.aiJob.update({
      where: { id: jobId },
      data: { status: "SUCCEEDED", progress: 1, projectId: project.id, output: { stage: "Done", projectId: project.id, summary: plan.summary, engine, notes, styleProfile } as unknown as Prisma.InputJsonValue },
    });
  } catch (e) {
    if ((e as Error).message === "canceled") return;
    throw e;
  } finally {
    for (const c of cleanups) await c().catch(() => undefined);
    await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
  }
}
