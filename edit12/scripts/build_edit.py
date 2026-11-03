#!/usr/bin/env python3
"""Timeline for picture and score: words, cue words (src/cues.json), durations. Writes src/edit.json."""
import json, os, subprocess
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS, END_CARD = 30, 1.8
words = json.load(open(os.path.join(ROOT, "src", "words.json")))
cues = json.load(open(os.path.join(ROOT, "src", "cues.json")))
clip = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                             os.path.join(ROOT, "public", "clips", "main.mp4")], capture_output=True, text=True).stdout)
speech = round(min(clip - 0.05, words[-1]["e"] + 0.5) * FPS) / FPS
for k, v in cues.items():
    assert 0 <= v < len(words), k
edit = {"fps": FPS, "speech": speech, "endCard": END_CARD, "duration": speech + END_CARD, "frames": round((speech + END_CARD) * FPS),
        "words": [{**w, "i": i} for i, w in enumerate(words)], "cues": {k: words[v]["s"] for k, v in cues.items()}, "cueWord": cues}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"), ensure_ascii=False)
print(f"{len(words)} words, picture {speech:.2f}s + end card {END_CARD}s = {edit['frames']} frames")
print({k: f"{words[v]['w']}@{words[v]['s']:.2f}" for k, v in cues.items()})
