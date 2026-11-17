#!/usr/bin/env python3
"""Timeline for picture and score (first half): words, cuts in the first half, voice loudness. Writes src/edit.json."""
import json, os, subprocess
import numpy as np
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS, END = 30, 37.0
words = json.load(open(os.path.join(ROOT, "src", "words.json")))
cuts = [c for c in json.load(open(os.path.join(ROOT, "work", "cuts.json"))) if c < END - 0.5]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public", "audio", "voice.wav"), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, "<i2") / 32768
n = int(END * FPS)
env = np.array([np.sqrt((x[int(f / FPS * 16000):int((f + 1) / FPS * 16000)] ** 2).mean() + 1e-12) for f in range(n)])
env = np.clip(env / np.percentile(env, 97), 0, 1)
edit = {"fps": FPS, "duration": END, "frames": n, "speech": END, "endCard": 0, "words": [{**w, "i": i} for i, w in enumerate(words)], "cuts": cuts,
        "env": [round(float(v), 3) for v in env]}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"), ensure_ascii=False)
print(len(words), "words", n, "frames, cuts", cuts)
