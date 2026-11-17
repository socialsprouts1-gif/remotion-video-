#!/usr/bin/env python3
"""Track lip opening per frame with MediaPipe face landmarks, then cross-correlate it
with the voice loudness to measure audio/video offset. Writes work/lips.json."""
import json, os, subprocess, sys
import numpy as np, cv2, mediapipe as mp

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = sys.argv[1]
V = mp.tasks.vision
lm = V.FaceLandmarker.create_from_options(V.FaceLandmarkerOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=os.path.join(ROOT, "work", "face_landmarker.task")),
    running_mode=V.RunningMode.VIDEO, output_face_blendshapes=True, num_faces=1))
cap = cv2.VideoCapture(SRC)
FPS = cap.get(cv2.CAP_PROP_FPS)
gap, jaw, ok_ = [], [], []
i = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    rgb = cv2.cvtColor(cv2.resize(fr, (540, 960)), cv2.COLOR_BGR2RGB)
    r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(i * 1000 / FPS))
    if r.face_landmarks:
        p = r.face_landmarks[0]
        face = abs(p[152].y - p[10].y) + 1e-6
        gap.append(abs(p[14].y - p[13].y) / face)
        bs = {b.category_name: b.score for b in r.face_blendshapes[0]}
        jaw.append(bs.get("jawOpen", 0)); ok_.append(1)
    else:
        gap.append(np.nan); jaw.append(np.nan); ok_.append(0)
    i += 1
n = len(gap)
gap = np.array(gap); jaw = np.array(jaw)
for v in (gap, jaw):
    bad = np.isnan(v); v[bad] = np.interp(np.flatnonzero(bad), np.flatnonzero(~bad), v[~bad]) if bad.any() else v[bad]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, "<i2") / 32768
hop = int(48000 / FPS)
env = np.array([np.sqrt((a[k * hop:(k + 1) * hop] ** 2).mean() + 1e-12) for k in range(n)])
env_db = 20 * np.log10(env)
speech = (env_db > -30).astype(float)
def z(v):
    v = np.asarray(v, float); return (v - v.mean()) / (v.std() + 1e-9)
def xc(s, e, R=40):
    m = len(s); s, e = z(s), z(e)
    return [float(np.mean(s[max(0, -L):m - max(0, L)] * e[max(0, L):m - max(0, -L)])) for L in range(-R, R + 1)]
print(f"{n} frames @ {FPS:.0f} fps, face found in {sum(ok_) / n:.0%}")
for name, sig in [("lip gap", gap), ("jawOpen", jaw)]:
    for ename, e in [("loudness", env_db), ("speech on/off", speech)]:
        c = xc(sig, e); k = int(np.argmax(c)) - 40
        print(f"{name} vs {ename}: best lag {k:+d} fr ({k / FPS * 1000:+.0f} ms) corr {max(c):.3f} (at 0: {c[40]:.3f})")
q = n // 5
for j in range(5):
    sl = slice(j * q, (j + 1) * q); c = xc(jaw[sl], env_db[sl]); k = int(np.argmax(c)) - 40
    print(f"  part {j + 1} ({j * q / FPS:4.1f}-{(j + 1) * q / FPS:4.1f}s): lag {k:+d} fr ({k / FPS * 1000:+.0f} ms) corr {max(c):.3f}")
json.dump({"fps": FPS, "jaw": [round(float(v), 4) for v in jaw], "gap": [round(float(v), 5) for v in gap], "env_db": [round(float(v), 2) for v in env_db]},
          open(os.path.join(ROOT, "work", "lips.json"), "w"))
