#!/usr/bin/env python3
"""Caption words with timings, from three Whisper passes (work/asr.json for 6.1-33 s, work/asr_fix.json for the opening
and the call to action, which the long pass skipped or translated). Text is what he says, spelled like the script.
Writes src/words.json."""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
main = json.load(open(os.path.join(ROOT, "work", "asr.json")))
fix = json.load(open(os.path.join(ROOT, "work", "asr_fix.json")))
SPELL = {"Newrexin.": "Neuraxine.", "Neuraxine.": "Neuraxine.", "dunga.": "dunga.", "DM": "DM"}
raw = [w for w in fix["hook_full"] if w["w"] != "In" and w["s"] < 6.1]   # 0-6.1 s from one pass over the opening
raw[0]["s"] = 0.05                                    # "2026" starts with the clip
raw += [w for w in main if 6.1 <= w["s"] < 33.3]
raw += fix["cta"]
words = []
for w in raw:
    t = SPELL.get(w["w"], w["w"])
    if t.startswith("-") and words:                    # "follow" + "-ups", "karte" + "-karte", "AI" + "-powered"
        words[-1]["w"] += t
        words[-1]["e"] = w["e"]
        continue
    if t.lower() == "automate" and words and words[-1]["w"].lower().startswith("karo"):
        t = "“AUTOMATE”"
    words.append({"w": t, "s": w["s"], "e": w["e"]})
for i, w in enumerate(words):
    nx = words[i + 1]["s"] if i + 1 < len(words) else w["e"] + 0.4
    w["s"] = round(w["s"], 3)
    w["e"] = round(max(w["s"] + 0.08, min(w["e"], nx)), 3)
json.dump(words, open(os.path.join(ROOT, "src", "words.json"), "w"), ensure_ascii=False, indent=0)
print(" ".join(f"{i}:{w['w']}@{w['s']:.2f}" for i, w in enumerate(words)))
