#!/usr/bin/env python3
"""Mouth opening per frame for the passenger (the larger, nearer face) in the paragliding clip.
The face is only ~50 px wide, so each frame is cropped (170 px box following the face) and upscaled 5x.
Of the faces found, the one nearest the passenger's last position is kept (the pilot is behind him).
Writes work/mouth.json."""
import json, os, sys
import numpy as np, cv2, mediapipe as mp
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
V = mp.tasks.vision
lm = V.FaceLandmarker.create_from_options(V.FaceLandmarkerOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=os.path.join(ROOT, "work", "face_landmarker.task")),
    running_mode=V.RunningMode.VIDEO, output_face_blendshapes=True, num_faces=2,
    min_face_detection_confidence=0.3, min_face_presence_confidence=0.3, min_tracking_confidence=0.3))
cap = cv2.VideoCapture(os.path.join(ROOT, "footage", "IMG_6161.mp4"))
fps = cap.get(cv2.CAP_PROP_FPS)
rows, i = [], 0
cx, cy, B, S = 410.0, 150.0, 170, 5
while True:
    ok, fr = cap.read()
    if not ok: break
    H, Wd = fr.shape[:2]
    x0 = int(min(max(0, cx - B / 2), Wd - B)); y0 = int(min(max(0, cy - B / 2), H - B))
    crop = cv2.resize(fr[y0:y0 + B, x0:x0 + B], None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
    r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)), int(i * 1000 / fps))
    best = None
    for k, p in enumerate(r.face_landmarks):
        pts = np.array([[q.x, q.y] for q in p]) * B + [x0, y0]
        c = pts.mean(0)
        d = np.hypot(c[0] - cx, c[1] - cy)
        if best is None or d < best[0]: best = (d, k, pts)
    if best and best[0] < 45:
        _, k, pts = best
        face_h = abs(pts[152, 1] - pts[10, 1]) + 1e-6
        bs = {b.category_name: b.score for b in r.face_blendshapes[k]}
        cx, cy = 0.6 * cx + 0.4 * pts[:, 0].mean(), 0.6 * cy + 0.4 * pts[:, 1].mean()
        rows.append({"t": round(i / fps, 3), "ok": 1, "jaw": round(bs.get("jawOpen", 0), 4), "gap": round(abs(pts[14, 1] - pts[13, 1]) / face_h, 4),
                     "cx": round(float(pts[:, 0].mean()), 1), "cy": round(float(pts[:, 1].mean()), 1), "w": round(float(np.ptp(pts[:, 0])), 1)})
    else:
        rows.append({"t": round(i / fps, 3), "ok": 0})
    i += 1
json.dump({"fps": fps, "rows": rows}, open(os.path.join(ROOT, "work", "mouth.json"), "w"))
ok = [r for r in rows if r["ok"]]
print(f"{len(rows)} frames @ {fps:.3f}, face found {len(ok) / len(rows):.0%}, face width median {np.median([r['w'] for r in ok]):.0f}px")
