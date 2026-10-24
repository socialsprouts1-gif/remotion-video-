#!/usr/bin/env python3
"""Word timings for captions (no speech recogniser available here).

The video is 9 takes joined in VN; each take starts a sentence of script.txt, so the take cuts are
hard anchors. Inside a take, words are spread by syllables and every comma / full stop is snapped
to the nearest real pause in the audio. Writes src/captions.json (seconds in the source video).
Fix any word by editing its s/e there.
"""
import json, os, re, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "public", "clips", "main.mp4")
CUTS = [0.0, 3.9, 8.93, 13.13, 16.97, 23.23, 27.43, 34.0, 41.13, 50.22]
# first words of each take (index into the word list is found by matching)
TAKE_STARTS = ["Is", "Businesses", "lekin", "Aaj", "Customer", "Yahi", "Aaj", "Isi", "Agar"]
KEY = {"galti", "lakhs", "nuksaan", "meta", "ads", "leads", "calls", "whatsapp", "sales", "problem", "conversion", "system",
       "convert", "paying", "customers", "late", "follow-up", "competitor", "loss", "revenue", "neura", "chat", "automatic",
       "replies", "follow-ups", "qualification", "appointment", "booking", "jagah", "comment", "dm", "follow", "mahine"}

words = [w for w in open(os.path.join(ROOT, "script.txt")).read().split() if w != "—"]
# split into takes
starts, k = [], 0
for i, w in enumerate(words):
    if k < len(TAKE_STARTS) and re.sub(r"[^A-Za-z]", "", w) == TAKE_STARTS[k] and (i == 0 or re.search(r"[.!?…]$", words[i - 1])):
        starts.append(i); k += 1
assert len(starts) == 9, starts
starts.append(len(words))

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype="<i2") / 32768
hop = 160
n = len(x) // hop
env = 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
env = np.convolve(env, np.ones(3) / 3, "same")


def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    return max(1, len(re.findall(r"[aeiouy]+", w)))


def speech_span(a, b):
    i0, i1 = int(a * 100), min(n, int(b * 100))
    seg = env[i0:i1]
    thr = np.percentile(seg, 20) + 6
    on = np.where(seg > thr)[0]
    return a + on[0] / 100, a + (on[-1] + 1) / 100


def pauses(a, b):
    i0, i1 = int(a * 100), min(n, int(b * 100))
    thr = np.percentile(env[i0:i1], 25) - 2
    out, i = [], i0
    while i < i1:
        if env[i] < thr:
            j = i
            while j < i1 and env[j] < thr:
                j += 1
            if j - i >= 7:
                out.append((i / 100, j / 100))
            i = j
        else:
            i += 1
    return out


caps = []
for ti in range(9):
    ws = words[starts[ti]: starts[ti + 1]]
    a, b = speech_span(CUTS[ti] + 0.02, CUTS[ti + 1] - 0.02)
    ps = [p for p in pauses(a, b) if a + 0.15 < p[0] < b - 0.15]
    wts = [syl(w) + 0.35 for w in ws]
    gap = [0.9 if re.search(r"[.!?…]$", w) else 0.45 if w.endswith(",") else 0 for w in ws]
    tot = sum(wts) + sum(gap[:-1])
    t, est = 0.0, []
    for wv, g in zip(wts, gap):
        est.append([t, t + wv]); t += wv + g
    est = [[a + s / tot * (b - a), a + e / tot * (b - a)] for s, e in est]
    anchors, used = [(0, a)], set()
    for k2, g in enumerate(gap[:-1]):
        if not g:
            continue
        guess = (est[k2][1] + est[k2 + 1][0]) / 2
        best = None
        for pi, (p0, p1) in enumerate(ps):
            d = abs((p0 + p1) / 2 - guess)
            if pi not in used and d < 0.6 and (best is None or d < best[0]):
                best = (d, pi)
        if best:
            used.add(best[1]); p0, p1 = ps[best[1]]
            anchors.append((k2 + 1, p1, p0))
    anchors.append((len(ws), b))
    timed = [None] * len(ws)
    for (ka, ta, *_), nx in zip(anchors, anchors[1:]):
        kb = nx[0]; tb = nx[2] if len(nx) > 2 else nx[1]
        seg = wts[ka:kb]; tt = sum(seg); cur = ta
        for i, wv in enumerate(seg):
            d = (tb - ta) * wv / tt
            timed[ka + i] = [round(cur, 3), round(cur + d, 3)]; cur += d
    for w, (s, e) in zip(ws, timed):
        caps.append({"w": w, "s": s, "e": e, "take": ti, "k": re.sub(r"[^a-z\-]", "", w.lower()) in KEY})
    print(f"take {ti + 1}: {len(ws):2d} words {a:5.2f}-{b:5.2f}s  {len(ws) / (b - a):.1f} w/s  pauses used {len(used)}")
for i, c in enumerate(caps):
    c["i"] = i
json.dump(caps, open(os.path.join(ROOT, "src", "captions.json"), "w"), indent=1)
