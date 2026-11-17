#!/usr/bin/env python3
"""Soft-focus background + cutout, from the tone-mapped clip (work/sdr.mp4).
- public/clips/main.mp4: him, his hands and the desk/laptop sharp; the patterned wall blurred, muted and lifted toward a
  light neutral, like a shallow-focus lens. The matte is smoothed over time so the edge never flickers.
- public/clips/person.webm: him alone with alpha (no desk), for words that sit behind his head."""
import os, subprocess
import numpy as np, cv2, mediapipe as mp
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
V = mp.tasks.vision
seg = V.ImageSegmenter.create_from_options(V.ImageSegmenterOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=os.path.join(ROOT, "work", "selfie_segmenter.tflite")),
    running_mode=V.RunningMode.VIDEO, output_confidence_masks=True))
cap = cv2.VideoCapture(os.path.join(ROOT, "work", "sdr.mp4"))
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = 1080, 1920
LIMIT = int(37.4 * fps)   # first half only (+ a little tail)
desk = np.clip((np.arange(H) - 1360) / 110, 0, 1)[:, None]   # desk + laptop stay sharp
upper = np.clip((1360 - np.arange(H)) / 120, 0, 1)[:, None]  # cutout for type-behind: upper body only
tone = np.array([228, 226, 222], np.float32)                  # light warm-neutral the wall drifts toward
comp = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                         "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
                         "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", os.path.join(ROOT, "public", "clips", "main.mp4")], stdin=subprocess.PIPE)
alpha = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                          "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "6M", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1",
                          os.path.join(ROOT, "public", "clips", "person.webm")], stdin=subprocess.PIPE)
prev, i = None, 0
while i < LIMIT:
    ok, fr = cap.read()
    if not ok: break
    rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
    r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(i * 1000 / fps))
    m = cv2.resize(r.confidence_masks[0].numpy_view(), (W, H), interpolation=cv2.INTER_LINEAR)
    m = prev * 0.45 + m * 0.55 if prev is not None else m
    prev = m
    a = cv2.GaussianBlur(np.clip((m - 0.35) / 0.35, 0, 1), (0, 0), 3.0)
    keep = np.maximum(a[..., None], desk[..., None] if desk.ndim == 2 else desk)
    keep = keep if keep.ndim == 3 else keep[..., None]
    f = fr.astype(np.float32)
    bg = cv2.GaussianBlur(f, (0, 0), 22)
    grey = bg.mean(axis=2, keepdims=True)
    bg = bg * 0.45 + grey * 0.55                    # mute the wall's colour
    bg = bg * 0.62 + tone[::-1] * 0.38              # lift toward a light neutral
    out = f * keep + bg * (1 - keep)
    comp.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    pa = (a * upper[:, 0][:, None] * 255).astype(np.uint8) if False else (a * upper * 255).astype(np.uint8)
    alpha.stdin.write(np.dstack([rgb, pa[..., 0] if pa.ndim == 3 else pa]).tobytes())
    i += 1
comp.stdin.close(); alpha.stdin.close(); comp.wait(); alpha.wait()
print(i, "frames processed")
