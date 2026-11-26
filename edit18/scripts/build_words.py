"""Assemble src/words.json: every spoken word with its real start/end time.
Base pass (work/asr.json) for the clean regions; verified short-chunk passes (work/asr_fix.json) for
12.8-19.1, 19.0-24.0, 29.4-31.3 and 31.2-38.5 where the long-chunk pass copied the prompt. Spelling fixed to the script."""
import json
A = json.load(open("work/asr.json"))
F = json.load(open("work/asr_fix.json"))
keep = [w for w in A if w["s"] < 12.9 or 23.6 < w["s"] < 29.5 or w["s"] > 38.5]
words = keep + [w for chunk in F for w in chunk]
words = sorted(words, key=lambda w: w["s"])
# end = next start when missing / overlapping
for i, w in enumerate(words):
    nxt = words[i + 1]["s"] if i + 1 < len(words) else w["s"] + 0.4
    if "e" not in w or w["e"] > nxt or w["e"] <= w["s"]:
        w["e"] = round(min(nxt, w["s"] + 0.6), 3)
FIX = {"leave": "live", "wedding diaries": None, "hote.": "hote hain,", "diaries": "Diaries", "So": "So"}
out = []
for i, w in enumerate(words):
    t = w["w"]
    if t in FIX and FIX[t]:
        t = FIX[t]
    if t == "wedding" and i + 1 < len(words) and words[i + 1]["w"].lower().startswith("diaries"):
        t = "Wedding"
    out.append({"w": t, "s": w["s"], "e": w["e"]})
json.dump(out, open("src/words.json", "w"), indent=0, ensure_ascii=False)
print(len(out)); print(" ".join(w["w"] for w in out))
