#!/usr/bin/env python3
"""Cut him out of every frame (MediaPipe selfie segmenter) so type can sit *behind* him.
The matte is smoothed over time (no edge flicker), tightened, feathered, and limited to the upper body
(below the chest the laptop confuses the model, and no type sits there). Writes public/clips/person.webm
(VP9 with alpha)."""
import os, subprocess, sys
import numpy as np, cv2, mediapipe as mp
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
V = mp.tasks.vision
seg = V.ImageSegmenter.create_from_options(V.ImageSegmenterOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=os.path.join(ROOT, "work", "selfie_segmenter.tflite")),
    running_mode=V.RunningMode.VIDEO, output_confidence_masks=True))
cap = cv2.VideoCapture(os.path.join(ROOT, "public", "clips", "main.mp4"))
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = 1080, 1920
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "6M", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1",
                        os.path.join(ROOT, "public", "clips", "person.webm")], stdin=subprocess.PIPE)
fade = np.clip((1300 - np.arange(H)) / 150, 0, 1)[:, None]      # keep the matte to the upper body
prev, i = None, 0
while True:
    ok, fr = cap.read()
    if not ok: break
    rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
    r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(i * 1000 / fps))
    m = cv2.resize(r.confidence_masks[0].numpy_view(), (W, H), interpolation=cv2.INTER_LINEAR)
    m = prev * 0.45 + m * 0.55 if prev is not None else m
    prev = m
    a = np.clip((m - 0.35) / 0.35, 0, 1)
    a = cv2.GaussianBlur(a, (0, 0), 2.2) * fade
    out = np.dstack([rgb, (a * 255).astype(np.uint8)])
    enc.stdin.write(out.tobytes())
    i += 1
enc.stdin.close(); enc.wait()
print(i, "frames matted")
