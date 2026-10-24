#!/usr/bin/env python3
"""Resolve captions + beats to edit time. Writes src/edit.json (read by the video and the score)."""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS = 30
IN, OUT = 0.10, 50.05      # trim the lead-in and tail of the VN export
END_CARD = 2.8
caps = json.load(open(os.path.join(ROOT, "src", "captions.json")))
beats = json.load(open(os.path.join(ROOT, "beats.json")))
f0, f1 = round(IN * FPS), round(OUT * FPS)
speech = (f1 - f0) / FPS
pieces = [{"src": "clips/main.mp4", "at": 0, "in": f0, "out": f1, "dur": speech}]
words = [{**w, "s": round(w["s"] - IN, 3), "e": round(w["e"] - IN, 3)} for w in caps]
S = lambda i: words[i]["s"]
ff = []
for w0, w1, scene in beats["ff"]:
    a = S(w0) - 0.12
    b = (S(w1 + 1) - 0.1) if w1 + 1 < len(words) and words[w1 + 1]["take"] == words[w1]["take"] else min(words[w1]["e"] + 0.25, speech)
    if ff and a < ff[-1]["b"] + 0.05:
        a = ff[-1]["b"]
    ff.append({"scene": scene, "a": round(a, 3), "b": round(b, 3), "w0": w0, "w1": w1})
edit = {
    "fps": FPS, "speech": round(speech, 3), "endCard": END_CARD, "duration": round(speech + END_CARD, 3),
    "frames": round((speech + END_CARD) * FPS), "pieces": pieces, "words": words, "ff": ff,
    "slam": [{"t": round(S(i), 3), "text": t, "tone": tone} for i, t, tone in beats["slam"]],
    "punch": [round(S(i), 3) for i in beats["punch"]],
    "cta": [{"t": round(S(i), 3), "kind": k} for i, k in beats["cta"]],
}
json.dump(edit, open(os.path.join(ROOT, "src", "edit.json"), "w"), indent=1)
ffd = sum(x["b"] - x["a"] for x in ff)
print(f"speech {speech:.2f}s + end {END_CARD}s; full-frame {ffd:.1f}s ({ffd / speech * 100:.0f}%)")
for x in ff:
    print(f"  {x['scene']:9s} {x['a']:6.2f}-{x['b']:6.2f}")
