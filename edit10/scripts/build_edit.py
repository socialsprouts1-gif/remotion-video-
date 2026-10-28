#!/usr/bin/env python3
"""Timeline for the picture and the score: words (src/words.json), cue words (src/cues.json),
voice loudness per frame and durations. Writes src/edit.json."""
import json, os, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS, END_CARD, TAIL = 30, 2.8, 0.5
words = json.load(open(os.path.join(ROOT, "src", "words.json")))
cues = json.load(open(os.path.join(ROOT, "src", "cues.json")))
VOICE = os.path.join(ROOT, "public", "audio", "voice.wav")
CLIP = os.path.join(ROOT, "public", "clips", "main.mp4")
clip = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", CLIP], capture_output=True, text=True).stdout)
speech = round(min(clip - 0.05, words[-1]["e"] + TAIL) * FPS) / FPS     # picture holds a beat after the last word
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", VOICE, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, "<i2") / 32768
n = int(speech * FPS)
env = np.array([np.sqrt((x[int(f / FPS * 16000):int((f + 1) / FPS * 16000)] ** 2).mean() + 1e-12) for f in range(n)])
env = np.clip(env / np.percentile(env, 97), 0, 1)
edit = {"fps": FPS, "speech": speech, "endCard": END_CARD, "duration": speech + END_CARD, "frames": round((speech + END_CARD) * FPS),
        "words": [{**w, "i": i} for i, w in enumerate(words)], "cues": {k: words[v]["s"] for k, v in cues.items()},
        "cueWord": cues, "env": [round(float(v), 3) for v in env]}
for k, v in cues.items():
    assert 0 <= v < len(words), k
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"), ensure_ascii=False)
print(f"{len(words)} words, picture {speech:.2f}s + end card {END_CARD}s = {edit['frames']} frames")
print({k: f"{words[v]['w']}@{words[v]['s']:.2f}" for k, v in cues.items()})
