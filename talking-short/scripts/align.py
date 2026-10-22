#!/usr/bin/env python3
"""Approximate word timings for captions (no speech recogniser available).

Words are spread over each clip's speech span in proportion to their syllables,
then every comma/full stop is snapped to the nearest real pause found in the audio.
Output: src/captions.json  (times are seconds from the start of each raw clip).
Fix any word by editing that file; the video reads it directly.
"""
import json, os, re, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TR = json.load(open(os.path.join(ROOT, "trims.json")))["clips"]
KEY = {"leads", "lead", "problem", "follow-up", "follow-up.", "whatsapp", "busy", "bhool", "lose", "interested", "automatically",
       "automation", "qualify", "appointments", "information", "system", "replies", "follow-ups", "inquiries"}


def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    return max(1, len(re.findall(r"[aeiouy]+", w)))


def pauses(clip, a, b):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public/clips", clip + ".mp4"), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype="<i2") / 32768
    hop = 160
    n = len(x) // hop
    e = 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    e = np.convolve(e, np.ones(3) / 3, "same")
    i0, i1 = int(a * 100), min(n, int(b * 100))
    thr = np.percentile(e[i0:i1], 25) - 2
    out, i = [], i0
    while i < i1:
        if e[i] < thr:
            j = i
            while j < i1 and e[j] < thr:
                j += 1
            if j - i >= 8:
                out.append((i / 100, j / 100))
            i = j
        else:
            i += 1
    return out


caps = {}
for line in open(os.path.join(ROOT, "script.txt")):
    if "|" not in line:
        continue
    clip, text = [s.strip() for s in line.split("|", 1)]
    a, b = TR[clip]
    words = text.split()
    ps = [p for p in pauses(clip, a, b) if a + 0.2 < p[0] < b - 0.2]
    # proportional layout with a virtual pause after punctuation
    wts = [syl(w) + 0.35 for w in words]
    gap = [0.9 if re.search(r"[.?!]\"?$", w) else 0.5 if re.search(r",\"?$", w) else 0 for w in words]
    total = sum(wts) + sum(gap[:-1])
    t, est = 0.0, []
    for w, g in zip(wts, gap):
        est.append([t, t + w])
        t += w + g
    span = b - a
    est = [[a + s / total * span, a + e / total * span] for s, e in est]
    # anchors: punctuation boundaries snapped to nearby pauses
    anchors = [(0, a)]
    used = set()
    for k, g in enumerate(gap[:-1]):
        if not g:
            continue
        guess = (est[k][1] + est[k + 1][0]) / 2
        best = None
        for pi, (p0, p1) in enumerate(ps):
            d = abs((p0 + p1) / 2 - guess)
            if pi not in used and d < 0.7 and (best is None or d < best[0]):
                best = (d, pi)
        if best:
            used.add(best[1])
            p0, p1 = ps[best[1]]
            anchors.append((k + 1, p1, p0))  # next word starts at p1, this one ends at p0
    anchors.append((len(words), b))
    # re-spread words between anchors
    timed = [None] * len(words)
    for (ka, ta, *_), nxt in zip(anchors, anchors[1:]):
        kb = nxt[0]
        tb = nxt[2] if len(nxt) > 2 else nxt[1]
        seg = wts[ka:kb]
        tot = sum(seg)
        cur = ta
        for i, w in enumerate(seg):
            d = (tb - ta) * w / tot
            timed[ka + i] = [round(cur, 3), round(cur + d, 3)]
            cur += d
    caps[clip] = [{"w": w, "s": s, "e": e, "k": re.sub(r"[^a-z\-]", "", w.lower()) in KEY} for w, (s, e) in zip(words, timed)]
    print(clip, f"{len(words)} words, pauses used {len(used)}/{sum(1 for g in gap[:-1] if g)}")

json.dump(caps, open(os.path.join(ROOT, "src", "captions.json"), "w"), indent=1)
