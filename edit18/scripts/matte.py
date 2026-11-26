#!/usr/bin/env python3
"""public/clips/person.webm: the presenters alone with alpha (MediaPipe selfie segmenter, smoothed over time),
so big titles can sit behind them. Same frames as public/clips/main.mp4."""
import os, subprocess
import numpy as np, cv2, mediapipe as mp
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
V = mp.tasks.vision
seg = V.ImageSegmenter.create_from_options(V.ImageSegmenterOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=os.path.join(ROOT, "work", "selfie_segmenter.tflite")),
    running_mode=V.RunningMode.VIDEO, output_confidence_masks=True))
cap = cv2.VideoCapture(os.path.join(ROOT, "public", "clips", "main.mp4"))
fps = cap.get(cv2.CAP_PROP_FPS); W, H = 1080, 1920
out = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1",
                        os.path.join(ROOT, "public", "clips", "person.webm")], stdin=subprocess.PIPE)
prev, i = None, 0
while True:
    ok, fr = cap.read()
    if not ok: break
    rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
    r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(i * 1000 / fps))
    m = cv2.resize(r.confidence_masks[0].numpy_view(), (W, H), interpolation=cv2.INTER_LINEAR)
    m = prev * 0.4 + m * 0.6 if prev is not None else m
    prev = m
    a = cv2.GaussianBlur(np.clip((m - 0.4) / 0.3, 0, 1), (0, 0), 2.0)
    out.stdin.write(np.dstack([rgb, (a * 255).astype(np.uint8)]).tobytes())
    i += 1
out.stdin.close(); out.wait(); print(i, "frames")
