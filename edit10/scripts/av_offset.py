#!/usr/bin/env python3
"""Measure audio/video sync: mouth-region motion vs. voice loudness, cross-correlated.
A positive lag means the audio arrives later than the lips."""
import subprocess, sys, json
import numpy as np, cv2

SRC = sys.argv[1]
FPS = 60
cap = cv2.VideoCapture(SRC)
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
box, prev, motion, opening = None, None, [], []
i = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(fr, (540, 960)), cv2.COLOR_BGR2GRAY)
    if i % 30 == 0 or box is None:
        f = casc.detectMultiScale(g, 1.1, 5, minSize=(80, 80))
        if len(f):
            nb = max(f, key=lambda r: r[2] * r[3])
            box = nb if box is None else (0.7 * np.array(box) + 0.3 * np.array(nb)).astype(int)
    if box is None:
        motion.append(0); opening.append(0); i += 1; continue
    x, y, w, h = box
    m = g[y + int(h * 0.68): y + int(h * 0.98), x + int(w * 0.25): x + int(w * 0.75)].astype(np.float32)
    m = cv2.resize(m, (64, 32))
    motion.append(0 if prev is None else float(np.abs(m - prev).mean()))
    # dark pixels inside the mouth box ~ open mouth
    opening.append(float((m < np.percentile(m, 15) + 8).mean()))
    prev = m; i += 1
n = len(motion)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, "<i2") / 32768
hop = 48000 // FPS
env = np.array([np.sqrt((a[k * hop:(k + 1) * hop] ** 2).mean() + 1e-12) for k in range(n)])
env = 20 * np.log10(env)
def z(v):
    v = np.asarray(v, float); v = v - np.convolve(v, np.ones(61) / 61, "same"); return (v - v.mean()) / (v.std() + 1e-9)
def best(sig):
    s, e = z(sig), z(env)
    lags = range(-30, 31)
    c = [np.mean(s[max(0, -L):n - max(0, L)] * e[max(0, L):n - max(0, -L)]) for L in lags]
    k = int(np.argmax(c)); return list(lags)[k], c[k], c
for name, sig in [("motion", motion), ("opening", opening)]:
    L, c, cs = best(np.convolve(sig, np.ones(3) / 3, "same"))
    print(f"{name}: best lag {L:+d} frames ({L / FPS * 1000:+.0f} ms), corr {c:.3f}, corr@0 {cs[30]:.3f}")
# per-segment check (does drift change over time?)
seg = n // 4
for q in range(4):
    sl = slice(q * seg, (q + 1) * seg)
    s, e = z(np.convolve(motion, np.ones(3) / 3, "same")[sl]), z(env[sl])
    m_ = len(s)
    c = [np.mean(s[max(0, -L):m_ - max(0, L)] * e[max(0, L):m_ - max(0, -L)]) for L in range(-30, 31)]
    print(f"  quarter {q + 1}: lag {int(np.argmax(c)) - 30:+d} frames, corr {max(c):.3f}")
