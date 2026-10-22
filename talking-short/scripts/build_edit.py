#!/usr/bin/env python3
"""Lay the clips end to end (trimmed to speech) and resolve captions + graphic cues to edit time.

Writes src/edit.json, read by the video (src/Film.tsx) and the music/SFX script (scripts/make_score.py).
"""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS = 30
HEAD, TAIL = 0.08, 0.14  # handles so no word is clipped
END_CARD = 3.6
trims = json.load(open(os.path.join(ROOT, "trims.json")))["clips"]
caps = json.load(open(os.path.join(ROOT, "src", "captions.json")))
cues = json.load(open(os.path.join(ROOT, "cues.json")))

clips, words, hits = [], [], []
t = 0.0
for name in caps:
    a, b = trims[name]
    a = max(0.0, a - HEAD)
    b = b + TAIL
    f_in, f_out = round(a * FPS), round(b * FPS)
    dur = (f_out - f_in) / FPS
    clips.append({"name": name, "src": f"clips/{name}.mp4", "at": round(t, 4), "in": f_in, "out": f_out, "dur": round(dur, 4)})
    off = t - f_in / FPS
    for i, w in enumerate(caps[name]):
        words.append({"w": w["w"], "s": round(w["s"] + off, 3), "e": round(w["e"] + off, 3), "k": w["k"], "clip": len(clips) - 1, "i": i})
    for wi, cue in cues.get(name, []):
        hits.append({"cue": cue, "t": round(caps[name][wi]["s"] + off, 3), "clip": len(clips) - 1})
    t += dur

edit = {"fps": FPS, "speech": round(t, 3), "endCard": END_CARD, "duration": round(t + END_CARD, 3), "frames": round((t + END_CARD) * FPS), "clips": clips, "words": words, "hits": hits}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"), indent=1)
print(f"speech {t:.2f}s + end card {END_CARD}s = {t + END_CARD:.2f}s, {len(words)} words, {len(hits)} cues")
