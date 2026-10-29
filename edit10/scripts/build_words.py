#!/usr/bin/env python3
"""Final caption words with timings.
Timings come from Whisper word timestamps (work/asr_en.json, work/asr_mid.json); the text is what was actually
said, spelled the way the script spells Hinglish. Each start is snapped to the real speech onset in the clean
voice. Writes src/words.json."""
import json, os, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
EN = json.load(open(os.path.join(ROOT, "work", "asr_en.json")))
MID = json.load(open(os.path.join(ROOT, "work", "asr_mid.json")))
SRC = {"en": EN, "mid": MID}

# (source, whisper word indexes, words to show) — one row per spoken chunk
MAP = [
    ("en", [0, 1], "Humne"), ("en", [2], "Akola"), ("en", [3], "mein"), ("en", [4], "ek"), ("en", [5], "survey"), ("en", [6], "kiya,"),
    ("en", [7], "jismein"), ("en", [8, 9], "humne"), ("en", [10], "100"), ("en", [11], "businesses"), ("en", [12], "ko"),
    ("en", [13], "message"), ("en", [14], "kiya."),
    ("en", [15], "Usmein"), ("en", [16], "se"), ("en", [17], "20"), ("en", [18], "businesses"), ("en", [19], "ne"), ("en", [20], "2"),
    ("en", [21], "ghante"), ("en", [22], "ke"), ("en", [23], "andar"), ("en", [24], "message"), ("en", [25], "kiya,"),
    ("en", [26], "30"), ("en", [27], "businesses"), ("en", [28], "ne"), ("en", [29], "ek"), ("en", [30], "din"), ("en", [31], "ke"),
    ("en", [32], "andar,"), ("en", [33], "aur"), ("en", [34], "kaafi"), ("en", [35], "logon ne toh"), ("en", [36], "kiya"),
    ("en", [37], "hi"), ("en", [38], "nahi."),
    ("en", [39], "Ab"), ("en", [40], "socho,"), ("en", [41], "aapka"), ("en", [42], "potential"), ("en", [43], "customer"),
    ("en", [44], "aapko"), ("en", [45], "WhatsApp"), ("en", [46], "pe"), ("en", [47], "enquiry"), ("en", [48], "bhejta,"),
    ("en", [49], "aur"), ("en", [50], "aap"), ("en", [51], "usko"), ("en", [52], "reply"), ("en", [53], "hi"), ("en", [54], "nahi"),
    ("en", [55], "de paate,"), ("en", [56], "toh"), ("en", [57], "chances"), ("en", [58], "hain"), ("en", [59], "ki"), ("en", [60], "woh"),
    ("en", [61], "kisi"), ("en", [62], "aur"), ("en", [63], "business"), ("en", [64], "ko"), ("en", [65], "contact"), ("en", [66], "kar"),
    ("en", [67], "lega."),
    ("en", [68], "Isi"), ("en", [69], "problem"), ("en", [70], "ko"), ("en", [71], "solve"), ("en", [72], "karne"), ("en", [73], "ke"),
    ("en", [74], "liye"), ("en", [75], "humne"), ("en", [76], "banaya"), ("en", [77], "Neura"), ("en", [78], "Chat"),
    ("en", [80], "ek"), ("en", [81], "WhatsApp"), ("en", [82], "automation"), ("en", [83], "software,"), ("en", [84], "jo"),
    ("en", [85], "aapki"), ("en", [86], "enquiries"), ("en", [87], "ko"), ("en", [88], "automate"), ("en", [89], "karne"),
    ("en", [90], "mein"), ("en", [91], "help"), ("en", [92], "karta"), ("en", [93], "hai."),
    ("mid", [9, 10, 11], "24/7"), ("mid", [12], "replies"), ("mid", [13], "karta"), ("mid", [14], "hai,"), ("mid", [15], "automated"),
    ("mid", [16, 17], "follow-ups"), ("mid", [18], "karta"), ("mid", [19], "hai,"), ("mid", [20], "appointments"), ("mid", [21], "bhi"),
    ("mid", [22], "book"), ("mid", [23], "karta"), ("mid", [24], "hai,"), ("mid", [25], "leads"), ("mid", [26], "qualify"),
    ("mid", [27], "karta"), ("mid", [28], "hai"), ("mid", [29], "aur"), ("mid", [30], "data"), ("mid", [31], "bhi"), ("mid", [32], "store"),
    ("mid", [33], "karta"), ("mid", [34], "hai."),
    ("mid", [35], "Matlab,"), ("mid", [36], "aap"), ("mid", [37], "busy"), ("mid", [38], "ho"), ("mid", [39], "phir"), ("mid", [40], "bhi"),
    ("mid", [41], "customer"), ("mid", [42], "enquiries"), ("mid", [43], "ko"), ("mid", [44], "handle"), ("mid", [45], "karna"),
    ("mid", [46], "ho"), ("mid", [47], "sakta"), ("mid", [48], "easy."),
    ("mid", [49], "Aur"), ("mid", [50], "Akola"), ("mid", [51], "ke"), ("mid", [52], "first"), ("mid", [53], "20"), ("mid", [54], "businesses"),
    ("mid", [55], "ko"), ("mid", [56], "hum"), ("mid", [57], "lekar"), ("mid", [58], "aa"), ("mid", [59], "rahe"), ("mid", [60], "ek"),
    ("mid", [61], "special"), ("mid", [62], "pricing"), ("mid", [63], "benefit."),
    ("mid", [64], "Agar"), ("mid", [65], "aap"), ("mid", [66], "bhi"), ("mid", [67], "chahte"), ("mid", [68], "ho"), ("mid", [69], "ki"),
    ("mid", [70], "late"), ("mid", [71], "replies"), ("mid", [72], "ki"), ("mid", [73], "wajah"), ("mid", [74], "se"), ("mid", [75], "aapki"),
    ("mid", [76], "leads"), ("mid", [77], "miss"), ("mid", [78], "na"), ("mid", [79], "hon,"),
    ("en", [153], "Let's"), ("en", [154], "make"), ("en", [155], "Akola's"), ("en", [156], "businesses"), ("en", [157], "smarter"),
    ("en", [158], "with"), ("en", [159], "Neura Chat!"),
]
# Whisper squeezed the call to action into 1.5 s with low confidence; these are read off the loudness bursts
# (46.2 toh / 46.6 WhatsApp / 47.0 par / 47.15-47.8 Automation / 47.9 message / 48.1 karo).
CTA = [("toh", 46.18, 46.48), ("WhatsApp", 46.58, 46.92), ("par", 46.95, 47.10), ("“Automation”", 47.14, 47.84),
       ("message", 47.88, 48.06), ("karo.", 48.08, 48.32)]

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public", "audio", "voice.wav"), "-ac", "1", "-ar", "16000",
                      "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, "<i2") / 32768
H = 160
E = np.array([20 * np.log10(np.sqrt((x[i:i + H] ** 2).mean()) + 1e-9) for i in range(0, len(x) - H, H)])
loud = E > np.percentile(E, 95) - 26

words = []
for src, idx, text in MAP:
    d = SRC[src]
    s, e = d[idx[0]]["s"], d[idx[-1]]["e"]
    parts = text.split()
    for k, p in enumerate(parts):        # a chunk heard as one token but shown as several words: split its time
        words.append({"w": p, "s": s + (e - s) * k / len(parts), "e": s + (e - s) * (k + 1) / len(parts)})
    if text == "hon,":
        words += [{"w": w, "s": a, "e": b} for w, a, b in CTA]
# spots where a Whisper chunk boundary or squeeze put words off the loudness bursts
FIX = {(116, "hai."): (34.62, 34.92), (117, "Matlab,"): (35.04, 35.27), (159, "miss"): (45.70, 45.86),
       (160, "na"): (45.88, 45.97), (161, "hon,"): (45.98, 46.12)}
for i, w in enumerate(words):
    if (i, w["w"]) in FIX: w["s"], w["e"] = FIX[(i, w["w"])]
bad = [k for k in FIX if words[k[0]]["w"] != k[1]]
assert not bad, f"FIX rows no longer match words: {bad}"
words.sort(key=lambda w: w["s"])

# snap starts to the speech onset: never start in silence; pull back to the onset when speech began just before
for w in words:
    f = int(w["s"] * 100)
    if not loud[f]:
        g = f
        while g < len(loud) - 1 and not loud[g] and g - f < 18: g += 1
        if loud[g]: w["s"] = g / 100
    else:
        g = f
        while g > 0 and loud[g - 1] and f - g < 6: g -= 1
        if not loud[g - 1]: w["s"] = g / 100
for i, w in enumerate(words):
    nx = words[i + 1]["s"] if i + 1 < len(words) else w["e"] + 0.3
    w["s"] = max(w["s"], words[i - 1]["s"] + 0.06) if i else w["s"]
    w["e"] = nx if nx - w["e"] < 0.15 else w["e"]
    w["e"] = max(w["e"], w["s"] + 0.08)
    w["s"], w["e"] = round(w["s"], 3), round(min(w["e"], nx), 3)
json.dump(words, open(os.path.join(ROOT, "src", "words.json"), "w"), ensure_ascii=False, indent=0)
print(len(words), "words")
print(" ".join(f"{w['w']}@{w['s']:.2f}" for w in words))
