#!/usr/bin/env python3
"""speech_pieces.txt -> src/segs.json (words, rough syllable weights, word ranges per piece)."""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SPECIAL = {"2026": 5, "AI": 2, "AI-related": 5, "WhatsApp": 2, "follow-up": 3}
def syl(w):
    k = re.sub(r'[^\w-]', '', w)
    if k in SPECIAL: return SPECIAL[k]
    return max(1, len(re.findall(r'[aeiouy]+', k.lower())))
words, S, segs = [], [], []
for line in open(os.path.join(ROOT, "speech_pieces.txt")):
    if line.startswith('#') or '|' not in line: continue
    t, txt = line.split('|', 1)
    a, b = map(float, t.split())
    ws = txt.split()
    segs.append([a, b, len(words), len(words) + len(ws)])
    words += ws; S += [syl(w) for w in ws]
json.dump({"words": words, "syl": S, "segs": segs}, open(os.path.join(ROOT, "src", "segs.json"), "w"), indent=1)
print(len(words), "words")
