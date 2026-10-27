#!/usr/bin/env python3
"""Cut pauses, map captions to edit time, and store a per-frame voice envelope (for the waveform).
Writes src/edit.json."""
import json, os, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS, IN, OUT, KEEP, END_CARD = 30, 0.0, 56.36, 0.07, 2.8
# silence between takes (speech end -> next speech start) and the one long breath in take 1
SPANS = [(0.09, 5.42), (5.85, 9.94), (10.51, 13.70), (14.31, 18.29), (19.00, 23.99), (24.58, 28.30), (28.83, 32.19),
         (32.64, 36.56), (37.16, 42.31), (43.17, 46.21), (46.35, 49.40), (49.70, 52.48), (53.13, 55.81)]
# nothing is cut: every take plays in full so no word is clipped
CUT = []
caps = json.load(open(os.path.join(ROOT, "src", "captions.json")))

spans, cur = [], IN
for p0, p1 in CUT:
    spans.append((cur, p0 + KEEP)); cur = p1 - KEEP
spans.append((cur, OUT))
pieces, t = [], 0.0
for s0, s1 in spans:
    f0, f1 = round(s0 * FPS), round(s1 * FPS)
    pieces.append({"src": "clips/main.mp4", "at": round(t, 4), "in": f0, "out": f1, "dur": round((f1 - f0) / FPS, 4)})
    t += (f1 - f0) / FPS
speech = t


def to_edit(ts):
    best = None
    for p in pieces:
        s0, s1 = p["in"] / FPS, p["out"] / FPS
        if s0 <= ts <= s1:
            return p["at"] + ts - s0
        d, v = (s0 - ts, p["at"]) if ts < s0 else (ts - s1, p["at"] + p["dur"])
        if best is None or d < best[0]:
            best = (d, v)
    return best[1]


words = [{**w, "s": round(to_edit(w["s"]), 3), "e": round(to_edit(w["e"]), 3)} for w in caps]

# voice envelope per output frame (0..1)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public/clips/main.mp4"), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype="<i2") / 32768
envs = []
for p in pieces:
    for f in range(p["in"], p["out"]):
        seg = x[int(f / FPS * 16000): int((f + 1) / FPS * 16000)]
        envs.append(float(np.sqrt((seg ** 2).mean())) if len(seg) else 0.0)
envs = np.array(envs)
envs = np.clip(envs / np.percentile(envs, 97), 0, 1)
edit = {"fps": FPS, "speech": round(speech, 3), "endCard": END_CARD, "duration": round(speech + END_CARD, 3),
        "frames": round((speech + END_CARD) * FPS), "pieces": pieces, "words": words, "env": [round(v, 3) for v in envs]}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"))
print(f"{len(pieces)} pieces, speech {speech:.2f}s (cut {OUT - IN - speech:.2f}s of pauses), total {speech + END_CARD:.2f}s")
