import { z } from "zod";
import { EditCommand, allClips, applyCommands } from "../../lib/project/ops";
import { ANIMATION_PRESETS, EFFECT_KINDS, TRANSITION_TYPES, type ProjectDoc } from "../../lib/project/schema";
import { localAssistant, type AssistantContext, type AssistantPlan } from "../../lib/ai/local-assistant";
import { FONT_LIBRARY_NAMES } from "../../lib/ai/fonts-list";
import { EDITING_PLAYBOOK, MOTION_PLAYBOOK } from "../../lib/ai/playbooks";
import { llmConfigured, llmJson } from "./llm";

const SYSTEM = `You are the editing assistant inside Lumora Studio, a professional video editor. You do not chat about edits — you perform them by emitting editing commands that the editor applies (with preview and undo).

Coordinate system: frames at the project fps; clip "start"/"duration" in timeline frames; keyframe "frame" is relative to clip start. transform.x/y are pixel offsets from canvas centre; transform.width/height = layer box in px (null = full frame). tracks[0] is the TOP layer.

Available commands (JSON objects with "op"):
- {"op":"addClip","trackId"?:string,"clip":{"type":"text"|"shape"|"solid"|"effect"|"adjustment"|"image"|"video"|"audio", ...fields}} — omit trackId to auto-place on a suitable track
   text fields: text, style{fontFamily,fontSize,fontWeight,color,align,letterSpacing,lineHeight,textTransform,strokeColor,strokeWidth,shadow,glow,gradient:[c1,c2],background,padding,borderRadius,extrude,extrudeColor}
   shape fields: shape("rect"|"ellipse"|"triangle"|"star"|"line"|"arrow"|"ring"), fill, gradient, stroke, strokeWidth, radius, progress
   solid fields: color, gradient{kind:"linear"|"radial",angle,stops:[[color,percent],...]}, drift
   effect fields: effect (one of ${EFFECT_KINDS.join(", ")}), params{...}, seed
   adjustment fields: effects{...}, letterbox (0..0.25)
   image/video/audio clips need an existing assetId+src from the project — never invent asset ids.
   common fields: name, start, duration, transform{x,y,scale,rotation,opacity,width,height}, effects{brightness,contrast,saturation,exposure,temperature,tint,hue,blur,sharpen,vignette,grain,grayscale}, blendMode, keyframes{prop:[{id,frame,value,easing}]}, animationIn/animationOut{preset,duration,delay,easing,direction,intensity,stagger,splitBy}, loop{preset,period,intensity}, transitionIn/transitionOut{type,duration,easing}
- {"op":"updateClip","clipId","patch":{...partial clip fields; transform/effects/style/params are merged}}
- {"op":"updateClips","clipIds"?:[...],"types"?:[...],"patch":{...}}
- {"op":"removeClips","clipIds":[...],"ripple"?:bool}
- {"op":"moveClip","clipId","start","trackId"?}
- {"op":"trimClip","clipId","edge":"start"|"end","frame":<absolute timeline frame>}
- {"op":"splitAt","frame","clipIds"?} / {"op":"splitClip","clipId","frame"}
- {"op":"duplicateClips","clipIds","offset"?}
- {"op":"setKeyframe","clipId","prop":"x"|"y"|"scale"|"scaleX"|"scaleY"|"rotation"|"opacity"|"blur"|"brightness"|"contrast"|"saturation"|"volume"|"color"|"skewX"|"rotateY","frame","value","easing"?}
- {"op":"clearKeyframes","clipId","prop"?}
- {"op":"setTransition","clipId","side":"in"|"out","transition":{"type":one of ${TRANSITION_TYPES.join("|")},"duration","easing"}|null}
- {"op":"setAnimation","clipId","side":"in"|"out","animation":{"preset":one of ${ANIMATION_PRESETS.join("|")},"duration","delay","easing","direction","intensity","stagger","splitBy"}|null}
- {"op":"setLoop","clipId","loop":{"preset":"pulse"|"float"|"spin"|"shake"|"drift"|"flicker","period","intensity"}|null}
- {"op":"setSpeed","clipId","speed"} (video/audio only; changes duration)
- {"op":"changeAspect","aspect":"16:9"|"9:16"|"1:1"|"4:5"}
- {"op":"setSettings","patch":{"background"?,"fps"?}}
- {"op":"closeGaps","trackId"?} / {"op":"addMarker","frame","label"} / {"op":"addTrack","kind","name"?}
- {"op":"group","clipIds"} / {"op":"updateTrack","trackId","patch":{name,locked,hidden,muted,volume}}

Easing names: linear, easeIn, easeOut, easeInOut, easeInCubic, easeOutCubic, easeInOutCubic, easeOutBack, spring, bounce, elastic, hold.
Fonts available: ${FONT_LIBRARY_NAMES.join(", ")}.

${EDITING_PLAYBOOK}

${MOTION_PLAYBOOK}

Rules:
- If the user selected clips, "this"/"it" means the selection. Otherwise act on the whole project sensibly.
- Some requests need AI media models (background removal, object removal, face blur, tracking, upscaling, stabilization, transcription/subtitles, voiceover, music generation, sound effects). Do NOT fake them with overlays. List them in "requires" with capability ids: background-removal, object-removal, face-blur, motion-tracking, video-upscale, stabilization, silence-removal, speech-to-text, text-to-speech, music, sound-effect.
- Prefer a few precise commands over many. Use real clip ids from the project.
- "reply" is 1-3 sentences describing what you changed (or why you couldn't).

Return ONLY JSON: {"reply": string, "commands": EditCommand[], "requires": [{"capability": string, "reason": string, "clipId"?: string}]}`;

function summarize(doc: ProjectDoc) {
  return {
    settings: doc.settings,
    tracks: doc.tracks.map((t) => ({
      id: t.id,
      name: t.name,
      kind: t.kind,
      locked: t.locked,
      hidden: t.hidden,
      clips: t.clips.map((c) => {
        const base: Record<string, unknown> = { id: c.id, type: c.type, name: c.name, start: c.start, duration: c.duration, transform: c.transform };
        if (c.type === "text") Object.assign(base, { text: c.text, style: { fontFamily: c.style.fontFamily, fontSize: c.style.fontSize, color: c.style.color } });
        if (c.type === "video" || c.type === "audio") Object.assign(base, { speed: c.speed, volume: c.volume, muted: c.muted, assetId: c.assetId });
        if (c.type === "effect") Object.assign(base, { effect: c.effect, params: c.params });
        if (c.type === "scene") Object.assign(base, { title: c.title });
        if (c.transitionIn) base.transitionIn = c.transitionIn.type;
        if (c.animationIn) base.animationIn = c.animationIn.preset;
        const kf = Object.keys(c.keyframes).filter((k) => c.keyframes[k as keyof typeof c.keyframes]?.length);
        if (kf.length) base.keyframedProps = kf;
        return base;
      }),
    })),
    markers: doc.markers,
  };
}

const Response = z.object({
  reply: z.string(),
  commands: z.array(EditCommand),
  requires: z.array(z.object({ capability: z.string(), reason: z.string(), clipId: z.string().optional() })).default([]),
});

export async function planEdits(instruction: string, ctx: AssistantContext): Promise<AssistantPlan & { preview: { warnings: string[]; created: string[] } }> {
  let plan: AssistantPlan;
  if (llmConfigured()) {
    const user = JSON.stringify({ instruction, selection: ctx.selection, playheadFrame: ctx.playhead, project: summarize(ctx.doc) });
    const res = await llmJson({ system: SYSTEM, user, schema: Response, effort: "low", maxTokens: 16000 });
    plan = { ...res, engine: "claude" };
  } else {
    plan = localAssistant(instruction, ctx);
  }
  // dry-run so we never hand the client commands that fail
  const known = new Set(allClips(ctx.doc).map((c) => c.id));
  plan.commands = plan.commands.filter((c) => !("clipId" in c) || known.has((c as { clipId: string }).clipId));
  // apply one by one so a single bad command doesn't sink the whole plan
  const kept: typeof plan.commands = [];
  const warnings: string[] = [];
  let doc = ctx.doc;
  const created: string[] = [];
  for (const cmd of plan.commands) {
    try {
      const r = applyCommands(doc, [cmd]);
      doc = r.doc;
      created.push(...r.created);
      warnings.push(...r.warnings);
      kept.push(cmd);
    } catch (e) {
      warnings.push(`Skipped ${cmd.op}: ${(e as Error).message.slice(0, 120)}`);
    }
  }
  plan.commands = kept;
  return { ...plan, preview: { warnings, created } };
}
