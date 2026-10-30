#!/usr/bin/env python3
"""Caption words in output time (voiceover time minus the 0.55 s trimmed from its start).
Timings: Whisper word timestamps on the voiceover (work/vo_asr.json). Text: what was said, spelled like the script."""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TRIM = 0.55
asr = json.load(open(os.path.join(ROOT, "work", "vo_asr.json")))
FIX = {"5": None, ",000": "5,000", "hoon…": "hoon...", "Neuraxine": "Neuraxine"}
out = []
for k, w in enumerate(asr):
    txt = w["w"]
    if txt == "5" and k + 1 < len(asr) and asr[k + 1]["w"] == ",000":
        continue
    if txt == ",000":
        txt, s = "5,000", asr[k - 1]["s"]
    else:
        s = w["s"]
    out.append({"w": FIX.get(txt) or txt, "s": round(s - TRIM, 3), "e": round(w["e"] - TRIM, 3)})
for i, w in enumerate(out):     # no overlaps, every word on screen at least 80 ms
    nx = out[i + 1]["s"] if i + 1 < len(out) else w["e"] + 0.4
    w["e"] = round(max(w["s"] + 0.08, min(w["e"], nx)), 3)
json.dump(out, open(os.path.join(ROOT, "src", "words.json"), "w"), ensure_ascii=False, indent=0)
print(" ".join(f"{i}:{w['w']}@{w['s']:.2f}" for i, w in enumerate(out)))
