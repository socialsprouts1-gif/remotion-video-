import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCommands, allClips, findClip } from "../src/lib/project/ops";
import { newDocument } from "../src/lib/project/factory";
import { sampleNumber, mixColor } from "../src/lib/motion/keyframes";
import { ease } from "../src/lib/motion/easing";
import { evaluateMotion } from "../src/lib/motion/presets";
import { basicPlan } from "../src/lib/ai/basic-planner";
import { planToDoc } from "../src/lib/ai/plan-to-doc";
import { localAssistant } from "../src/lib/ai/local-assistant";
import { captionClips, wordsFromTranscript } from "../src/lib/ai/captions";
import { TEMPLATES, buildTemplate } from "../src/lib/templates";
import { composeMotion } from "../src/lib/ai/motion-composer";
import { ProjectDoc } from "../src/lib/project/schema";

const video = (start = 0, duration = 90) => ({ type: "video", assetId: "a1", src: "/api/media/a1", start, duration, sourceDuration: 300 });

test("addClip auto-places and recomputes duration", () => {
  const { doc, created } = applyCommands(newDocument(), [{ op: "addClip", clip: video(0, 120) }]);
  assert.equal(created.length, 1);
  assert.equal(doc.settings.durationInFrames, 120);
  assert.equal(findClip(doc, created[0])!.track.kind, "video");
});

test("overlapping add creates a new track instead of overlapping", () => {
  let { doc } = applyCommands(newDocument(), [{ op: "addClip", clip: video(0, 100) }]);
  doc = applyCommands(doc, [{ op: "addClip", clip: video(50, 100) }]).doc;
  const vids = doc.tracks.filter((t) => t.kind === "video" && t.clips.length);
  assert.equal(vids.length, 2);
});

test("split keeps source continuity (trimStart advances by speed)", () => {
  let r = applyCommands(newDocument(), [{ op: "addClip", clip: { ...video(10, 100), speed: 2 } }]);
  const id = r.created[0];
  r = applyCommands(r.doc, [{ op: "splitClip", clipId: id, frame: 40 }]);
  const right = findClip(r.doc, r.created[0])!.clip;
  const left = findClip(r.doc, id)!.clip;
  assert.equal(left.duration, 30);
  assert.equal(right.start, 40);
  assert.equal(right.duration, 70);
  assert.equal(right.type === "video" && right.trimStart, 60);
});

test("trim end is clamped to source length", () => {
  let r = applyCommands(newDocument(), [{ op: "addClip", clip: video(0, 90) }]);
  const id = r.created[0];
  r = applyCommands(r.doc, [{ op: "trimClip", clipId: id, edge: "end", frame: 10_000 }]);
  assert.equal(findClip(r.doc, id)!.clip.duration, 300);
});

test("setSpeed preserves source length", () => {
  let r = applyCommands(newDocument(), [{ op: "addClip", clip: video(0, 100) }]);
  const id = r.created[0];
  r = applyCommands(r.doc, [{ op: "setSpeed", clipId: id, speed: 2 }]);
  assert.equal(findClip(r.doc, id)!.clip.duration, 50);
});

test("ripple delete closes the gap", () => {
  let r = applyCommands(newDocument(), [{ op: "addClip", clip: video(0, 50) }]);
  const a = r.created[0];
  r = applyCommands(r.doc, [{ op: "addClip", trackId: findClip(r.doc, a)!.track.id, clip: video(50, 50) }]);
  const b = r.created[0];
  r = applyCommands(r.doc, [{ op: "removeClips", clipIds: [a], ripple: true }]);
  assert.equal(findClip(r.doc, b)!.clip.start, 0);
});

test("keyframes interpolate with easing and colors mix", () => {
  const kf = { x: [{ id: "a", frame: 0, value: 0, easing: "linear" as const }, { id: "b", frame: 10, value: 100, easing: "linear" as const }] };
  assert.equal(sampleNumber(kf, "x", 5, 0), 50);
  assert.equal(sampleNumber(kf, "x", 20, 0), 100);
  assert.equal(mixColor("#000000", "#ffffff", 0.5), "rgba(128,128,128,1.000)");
  assert.ok(ease("easeOutBack", 0.6) > 1);
  assert.equal(ease("hold", 0.99), 0);
});

test("presets: fade-in starts transparent", () => {
  const { doc, created } = applyCommands(newDocument(), [{ op: "addClip", clip: { type: "text", text: "hi", start: 0, duration: 60, animationIn: { preset: "fade", duration: 10 } } }]);
  const c = findClip(doc, created[0])!.clip;
  assert.equal(evaluateMotion(c, 0, 1920, 1080).opacity, 0);
  assert.equal(evaluateMotion(c, 30, 1920, 1080).opacity, 1);
});

test("bakeAnimation turns presets into keyframes", () => {
  let r = applyCommands(newDocument(), [{ op: "addClip", clip: { type: "text", text: "hi", start: 0, duration: 60, animationIn: { preset: "pop", duration: 10 } } }]);
  const id = r.created[0];
  r = applyCommands(r.doc, [{ op: "bakeAnimation", clipId: id }]);
  const c = findClip(r.doc, id)!.clip;
  assert.equal(c.animationIn, null);
  assert.equal(c.keyframes.scale?.length, 2);
});

test("changeAspect reframes and fps retime scales frames", () => {
  let r = applyCommands(newDocument(), [{ op: "addClip", clip: { ...video(30, 60), transform: { x: 100 } } }]);
  r = applyCommands(r.doc, [{ op: "changeAspect", aspect: "9:16" }, { op: "setSettings", patch: { fps: 60 } }]);
  assert.equal(r.doc.settings.width, 1080);
  assert.equal(r.doc.settings.height, 1920);
  const c = allClips(r.doc)[0];
  assert.equal(c.start, 60);
  assert.equal(c.duration, 120);
});

test("basic planner reads duration and platform; plan builds a valid doc", () => {
  const plan = basicPlan("Make a 15-second TikTok reel for my coffee shop");
  assert.equal(plan.durationSec, 15);
  assert.equal(plan.aspectRatio, "9:16");
  const doc = planToDoc(plan);
  assert.equal(doc.settings.width, 1080);
  assert.ok(Math.abs(doc.settings.durationInFrames - 15 * 30) <= 30);
  assert.ok(allClips(doc).some((c) => c.type === "scene"));
});

test("local assistant: warmer grade falls back to an adjustment layer when nothing is gradeable", () => {
  const doc = newDocument();
  const plan = localAssistant("make the color grading warmer", { doc, selection: [], playhead: 0 });
  assert.equal(plan.engine, "local-parser");
  assert.equal(plan.commands[0].op, "addClip");
  applyCommands(doc, plan.commands);
});

test("local assistant reports model-only requests instead of faking them", () => {
  const plan = localAssistant("remove the background from this clip", { doc: newDocument(), selection: [], playhead: 0 });
  assert.equal(plan.commands.length, 0);
  assert.equal(plan.requires[0].capability, "background-removal");
});

test("captions: transcript words become timed caption clips", () => {
  const words = wordsFromTranscript({ words: [{ text: "hello", start: 0, end: 0.4, type: "word" }, { text: " ", start: 0.4, end: 0.45, type: "spacing" }, { text: "world", start: 0.5, end: 1, type: "word" }] });
  assert.equal(words.length, 2);
  const clips = captionClips(words, { fps: 30, offsetFrames: 30, trimStartFrames: 0, speed: 1, style: {}, y: 0, width: 800 });
  assert.equal(clips.length, 1);
  assert.equal(clips[0].start, 30);
  assert.equal(clips[0].words.length, 2);
});

test("every template builds a valid doc in every aspect without overlapping clips", () => {
  for (const t of TEMPLATES)
    for (const a of ["16:9", "9:16", "1:1", "4:5"] as const) {
      const d = ProjectDoc.parse(buildTemplate(t.id, a));
      for (const tr of d.tracks) {
        const cs = [...tr.clips].sort((x, y) => x.start - y.start);
        for (let i = 1; i < cs.length; i++) assert.ok(cs[i].start >= cs[i - 1].start + cs[i - 1].duration, `${t.id} ${tr.name} overlaps`);
      }
    }
});

test("motion composer produces applicable commands", () => {
  const { commands } = composeMotion('3D metallic logo reveal "NOVA" with particles', { width: 1920, height: 1080, fps: 30, durationSec: 5 });
  const { doc } = applyCommands(newDocument(), commands);
  assert.ok(allClips(doc).some((c) => c.type === "text" && c.text === "NOVA"));
});
