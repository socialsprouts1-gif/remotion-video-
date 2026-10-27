#!/usr/bin/env python3
"""Word timings + timeline. One continuous take, nothing is cut.
Words are fitted to the speech between real pauses (scripts/fit_segments.py), then spread
inside each stretch by syllables. Writes src/edit.json."""
import json, os, re, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS, END_CARD = 30, 1.6
SRC = os.path.join(ROOT, "public", "clips", "main.mp4")
D = json.load(open(os.path.join(ROOT, "src", "segs.json")))
words, S = D["words"], D["syl"]
caps = []
for a, b, i, j in D["segs"]:
    ws = list(range(i, j))
    wt = [S[k] + 0.35 for k in ws]
    gap = [0.5 if re.search(r"[.,?!]$", words[k]) else 0 for k in ws]
    tot = sum(wt) + sum(gap[:-1])
    t = a
    for n, k in enumerate(ws):
        d = (b - a) * wt[n] / tot
        caps.append({"w": words[k], "s": round(t, 3), "e": round(t + d, 3), "i": k, "take": 0})
        t += d + (b - a) * gap[n] / tot
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SRC], capture_output=True, text=True).stdout)
speech = round(int(dur * FPS) / FPS, 4)
pieces = [{"src": "clips/main.mp4", "at": 0, "in": 0, "out": int(dur * FPS), "dur": speech}]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype="<i2") / 32768
env = [float(np.sqrt((x[int(f / FPS * 16000): int((f + 1) / FPS * 16000)] ** 2).mean() + 1e-12)) for f in range(int(dur * FPS))]
env = np.clip(np.array(env) / np.percentile(env, 97), 0, 1)
edit = {"fps": FPS, "speech": speech, "endCard": END_CARD, "duration": speech + END_CARD, "frames": round((speech + END_CARD) * FPS),
        "pieces": pieces, "words": caps, "env": [round(v, 3) for v in env]}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"))
print(f"{len(caps)} words, video {speech:.2f}s + end card {END_CARD}s")
