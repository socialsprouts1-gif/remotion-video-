import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import type { Clip, Effects } from "../lib/project/schema";
import { sampleNumber } from "../lib/motion/keyframes";
import { evaluateMotion, type Motion } from "../lib/motion/presets";

export interface LayerState {
  motion: Motion;
  local: number;
}

function filterFor(e: Effects, blur: number, brightness: number, contrast: number, saturation: number, svgId: string | null, glitch: number) {
  const parts: string[] = [];
  const b = brightness * Math.pow(2, e.exposure);
  if (b !== 1) parts.push(`brightness(${b.toFixed(3)})`);
  if (contrast !== 1) parts.push(`contrast(${contrast.toFixed(3)})`);
  if (saturation !== 1) parts.push(`saturate(${saturation.toFixed(3)})`);
  if (e.hue) parts.push(`hue-rotate(${e.hue}deg)`);
  if (e.grayscale) parts.push(`grayscale(${e.grayscale})`);
  if (blur > 0.01) parts.push(`blur(${blur.toFixed(2)}px)`);
  if (svgId) parts.push(`url(#${svgId})`);
  if (glitch > 0.01) {
    const g = (glitch * 14).toFixed(1);
    parts.push(`drop-shadow(${g}px 0 0 rgba(255,0,90,0.85)) drop-shadow(-${g}px 0 0 rgba(0,240,255,0.85))`);
  }
  return parts.length ? parts.join(" ") : undefined;
}

/** SVG color-matrix / convolution filter for temperature, tint and sharpen. */
export const ColorFilterDefs: React.FC<{ id: string; e: Effects }> = ({ id, e }) => {
  const t = e.temperature;
  const ti = e.tint;
  const r = 1 + 0.18 * t + 0.06 * ti;
  const g = 1 - 0.1 * ti;
  const b = 1 - 0.18 * t + 0.06 * ti;
  const k = e.sharpen * 1.2;
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`} result="graded" />
        {k > 0 ? (
          <feConvolveMatrix in="graded" order="3" preserveAlpha="true" kernelMatrix={`0 ${-k} 0 ${-k} ${1 + 4 * k} ${-k} 0 ${-k} 0`} />
        ) : null}
      </filter>
    </svg>
  );
};

export const GrainOverlay: React.FC<{ amount: number; id: string }> = ({ amount, id }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: amount * 0.5, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const VignetteOverlay: React.FC<{ amount: number }> = ({ amount }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) ${Math.round(60 - amount * 35)}%, rgba(0,0,0,${(0.35 + amount * 0.6).toFixed(2)}) 100%)`,
    }}
  />
);

/**
 * Positions a visual clip and applies keyframes, presets, transitions, crop,
 * mask, blend mode and color effects. Children render the clip content filling
 * the layer box.
 */
export const ClipLayer: React.FC<{ clip: Exclude<Clip, { type: "audio" }>; children: (s: LayerState) => React.ReactNode; isolateFilter?: boolean }> = ({ clip, children }) => {
  const local = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const kf = clip.keyframes;
  const t = clip.transform;
  const motion = evaluateMotion(clip, local, width, height);

  const x = sampleNumber(kf, "x", local, t.x) + motion.dx;
  const y = sampleNumber(kf, "y", local, t.y) + motion.dy;
  const scale = sampleNumber(kf, "scale", local, t.scale) * motion.scale;
  const sx = sampleNumber(kf, "scaleX", local, t.scaleX);
  const sy = sampleNumber(kf, "scaleY", local, t.scaleY);
  const rotation = sampleNumber(kf, "rotation", local, t.rotation) + motion.rotation;
  const opacity = Math.max(0, Math.min(1, sampleNumber(kf, "opacity", local, t.opacity) * motion.opacity));
  const skewX = sampleNumber(kf, "skewX", local, t.skewX) + motion.skewX;
  const rotateY = sampleNumber(kf, "rotateY", local, t.rotateY) + motion.rotateY;
  const e = clip.effects;
  const blur = sampleNumber(kf, "blur", local, e.blur) + motion.blur;
  const brightness = sampleNumber(kf, "brightness", local, e.brightness) * motion.brightness;
  const contrast = sampleNumber(kf, "contrast", local, e.contrast);
  const saturation = sampleNumber(kf, "saturation", local, e.saturation);

  const needsSvg = e.temperature !== 0 || e.tint !== 0 || e.sharpen > 0;
  const svgId = needsSvg ? `cf-${clip.id}` : null;

  // glitch jitter
  let jx = 0;
  let jy = 0;
  if (motion.glitch > 0.01) {
    jx = (random(`gx-${clip.id}-${local}`) - 0.5) * 60 * motion.glitch;
    jy = (random(`gy-${clip.id}-${local}`) - 0.5) * 10 * motion.glitch;
  }

  const boxW = t.width ?? width;
  const boxH = t.height ?? height;
  const cr = clip.crop;
  const cropPath = cr.top || cr.right || cr.bottom || cr.left ? `inset(${cr.top}% ${cr.right}% ${cr.bottom}% ${cr.left}%)` : null;

  let maskImage: string | undefined;
  if (clip.mask) {
    const m = clip.mask;
    const f = Math.max(0.01, m.feather);
    if (m.shape === "ellipse") {
      const inner = `rgba(0,0,0,${m.invert ? 0 : 1})`;
      const outer = `rgba(0,0,0,${m.invert ? 1 : 0})`;
      maskImage = `radial-gradient(ellipse ${m.width / 2}% ${m.height / 2}% at ${m.x}% ${m.y}%, ${inner} ${Math.max(0, 100 - f)}%, ${outer} 100%)`;
    }
  }
  const rectMask = clip.mask && clip.mask.shape === "rect" && !clip.mask.invert
    ? `inset(${Math.max(0, clip.mask.y - clip.mask.height / 2)}% ${Math.max(0, 100 - clip.mask.x - clip.mask.width / 2)}% ${Math.max(0, 100 - clip.mask.y - clip.mask.height / 2)}% ${Math.max(0, clip.mask.x - clip.mask.width / 2)}% round ${clip.mask.radius}px)`
    : null;

  const clipPath = motion.clipPath ?? cropPath ?? rectMask ?? undefined;
  const filter = filterFor(e, blur, brightness, contrast, saturation, svgId, motion.glitch);

  return (
    <AbsoluteFill style={{ mixBlendMode: clip.blendMode === "normal" ? undefined : clip.blendMode, pointerEvents: "none", perspective: rotateY ? 1600 : undefined }}>
      {svgId ? <ColorFilterDefs id={svgId} e={e} /> : null}
      <div
        style={{
          position: "absolute",
          left: (width - boxW) / 2,
          top: (height - boxH) / 2,
          width: boxW,
          height: boxH,
          opacity,
          transform: `translate(${x + jx}px, ${y + jy}px) rotate(${rotation}deg) ${rotateY ? `rotateY(${rotateY}deg)` : ""} ${skewX ? `skewX(${skewX}deg)` : ""} scale(${scale * sx}, ${scale * sy})`,
          transformOrigin: "50% 50%",
          filter,
          clipPath,
          WebkitMaskImage: maskImage,
          maskImage,
          overflow: clip.type === "text" ? "visible" : "hidden",
          willChange: "transform",
        }}
      >
        {children({ motion, local })}
        {e.vignette > 0 ? <VignetteOverlay amount={e.vignette} /> : null}
        {e.grain > 0 ? <GrainOverlay amount={e.grain} id={`gr-${clip.id}`} /> : null}
      </div>
    </AbsoluteFill>
  );
};
