#!/usr/bin/env python3
"""Word timings + timeline. One continuous take, nothing is cut.
Words are fitted to the speech between real pauses (scripts/fit_segments.py), then spread
inside each stretch by syllables. Writes src/edit.json."""
import json, os, re, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS, END_CARD = 30, 2.6
SRC = os.path.join(ROOT, "public", "clips", "main.mp4")
D = json.load(open(os.path.join(ROOT, "src", "segs.json")))
words, S = D["words"], D["syl"]
raw0 = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x0 = np.frombuffer(raw0, dtype="<i2") / 32768
env10 = np.sqrt(np.convolve(x0 ** 2, np.ones(320) / 320, "same")[::160])
db10 = 20 * np.log10(env10 + 1e-6)
caps = []
for a, b, i, j in D["segs"]:
    # place words only on voiced 10 ms frames inside the phrase, so micro-pauses stay silent
    f0, f1 = int(a * 100), int(b * 100)
    seg = db10[f0:f1]
    v = seg > (np.percentile(seg, 20) + 5)
    v = np.convolve(v.astype(float), np.ones(5) / 5, "same") > 0.3
    if v.sum() < 5:
        v[:] = True
    cum = np.concatenate([[0], np.cumsum(v)])
    total = cum[-1]
    to_time = lambda u: (f0 + int(np.searchsorted(cum, u * total))) / 100
    ws = list(range(i, j))
    wt = [S[k] + 0.35 for k in ws]
    tot = sum(wt)
    acc = 0.0
    for k, wv in zip(ws, wt):
        s0, s1 = to_time(acc / tot), to_time((acc + wv) / tot)
        caps.append({"w": words[k], "s": round(s0, 3), "e": round(max(s1, s0 + 0.08), 3), "i": k, "take": 0})
        acc += wv
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SRC], capture_output=True, text=True).stdout)
speech = round(int(dur * FPS) / FPS, 4)
pieces = [{"src": "clips/main.mp4", "at": 0, "in": 0, "out": int(dur * FPS), "dur": speech}]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype="<i2") / 32768
env = [float(np.sqrt((x[int(f / FPS * 16000): int((f + 1) / FPS * 16000)] ** 2).mean() + 1e-12)) if int(f / FPS * 16000) < len(x) - 10 else 0.0 for f in range(int(dur * FPS))]
env = np.clip(np.array(env) / np.percentile(env, 97), 0, 1)
edit = {"fps": FPS, "speech": speech, "endCard": END_CARD, "duration": speech + END_CARD, "frames": round((speech + END_CARD) * FPS),
        "pieces": pieces, "words": caps, "env": [round(v, 3) for v in env]}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"))
print(f"{len(caps)} words, video {speech:.2f}s + end card {END_CARD}s")
