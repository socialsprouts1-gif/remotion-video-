#!/usr/bin/env python3
"""Timeline: which part of the clip plays under which part of the voiceover, at what speed, and where the
vertical crop sits (following his face). Writes src/edit.json.

Lip-synced pieces were placed by cross-correlating his mouth opening (work/mouth.json) with the voiceover
loudness: the hook fits the clip from 4.19 s at 1.0x, "Work smarter. Grow faster!" fits from 14.9 s at 0.95x.
Everything else plays where his face is turned away (no lips to match), slowed to fill the line."""
import json, os
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS = 30
SRC_W = 848                     # source width; the clip in public/clips is the same picture at 4x
words = json.load(open(os.path.join(ROOT, "src", "words.json")))
W = lambda i: words[i]["s"]

# (output start, output end, source start, playback rate, label)
SEGS = [
    (0.0, 4.40, 3.99, 1.0, "hook (lip-synced)"),
    (4.40, 9.90, 0.0, 3.9 / 5.5, "jump line over the view (slow motion)"),
    (9.90, 14.95, 8.39, 4.21 / 5.05, "what we do (looking away)"),
    (14.95, 16.90, 14.90, 0.95, "work smarter, grow faster (lip-synced)"),
]
END = 16.90                     # end card from here
TOTAL = round((words[-1]["e"] + 0.9) * FPS) / FPS

m = json.load(open(os.path.join(ROOT, "work", "mouth.json")))
rows = m["rows"]
t = np.array([r["t"] for r in rows]); ok = np.array([r["ok"] for r in rows]) == 1
cx = np.interp(t, t[ok], np.array([r.get("cx", 0) for r in rows])[ok])
k = np.ones(25) / 25            # ~1 s smoothing so the crop glides, never jitters
cx = np.convolve(np.pad(cx, 12, mode="edge"), k, "valid")

def src_time(T):
    for a, b, s0, r, _ in SEGS:
        if a <= T < b: return s0 + (T - a) * r
    return SEGS[-1][2] + (SEGS[-1][1] - SEGS[-1][0]) * SEGS[-1][3]

frames = round(TOTAL * FPS)
crop = []
for f in range(frames):
    st = src_time(f / FPS)
    x = float(np.interp(st, t, cx)) + 25        # a little toward his body, so the canopy lines and legs read
    crop.append(round(min(max(x, 135), SRC_W - 135), 1))
edit = {"fps": FPS, "frames": frames, "duration": TOTAL, "end": END, "srcW": SRC_W,
        "segs": [{"a": a, "b": b, "src": s0, "rate": round(r, 4), "label": l} for a, b, s0, r, l in SEGS],
        "words": [{**w, "i": i} for i, w in enumerate(words)], "cropX": crop}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"), ensure_ascii=False)
for a, b, s0, r, l in SEGS:
    print(f"out {a:5.2f}-{b:5.2f}  src {s0:5.2f}-{s0 + (b - a) * r:5.2f}  x{r:.2f}  {l}")
print(f"end card {END}-{TOTAL:.2f}s, {frames} frames")
