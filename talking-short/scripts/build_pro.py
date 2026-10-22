#!/usr/bin/env python3
"""Premium cut: removes pauses inside clips, then resolves captions, full-frame scenes,
zoom punches and keyword slams to edit time. Writes src/pro.json."""
import json, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, os.path.join(ROOT, "scripts"))
FPS = 30
HEAD, TAIL, KEEP, MINPAUSE = 0.06, 0.12, 0.07, 0.24
END_CARD = 4.2
trims = json.load(open(os.path.join(ROOT, "trims.json")))["clips"]
caps = json.load(open(os.path.join(ROOT, "src", "captions.json")))
beats = json.load(open(os.path.join(ROOT, "beats.json")))

# reuse the pause finder from the aligner
import importlib.util
spec = importlib.util.spec_from_file_location("al", os.path.join(ROOT, "scripts", "align.py"))
src = open(os.path.join(ROOT, "scripts", "align.py")).read().split("caps = {}")[0]
ns = {"__file__": os.path.join(ROOT, "scripts", "align.py")}
exec(src, ns)

pieces, words = [], []
t = 0.0
for ci, name in enumerate(caps):
    a, b = trims[name]
    a, b = max(0.0, a - HEAD), b + TAIL
    cuts = [(p0 + KEEP, p1 - KEEP) for p0, p1 in ns["pauses"](name, a, b) if p1 - p0 >= MINPAUSE and a + 0.2 < p0 and p1 < b - 0.2]
    spans, cur = [], a
    for c0, c1 in cuts:
        spans.append((cur, c0))
        cur = c1
    spans.append((cur, b))
    for s0, s1 in spans:
        f0, f1 = round(s0 * FPS), round(s1 * FPS)
        pieces.append({"clip": ci, "name": name, "src": f"clips/{name}.mp4", "at": round(t, 4), "in": f0, "out": f1, "dur": round((f1 - f0) / FPS, 4)})
        t += (f1 - f0) / FPS
    print(name, "removed pauses:", [(round(x, 2), round(y, 2)) for x, y in cuts])


def to_edit(ci, ts):
    """Map a time in raw clip ci to edit time (snaps into the nearest kept piece)."""
    best = None
    for p in pieces:
        if p["clip"] != ci:
            continue
        s0, s1 = p["in"] / FPS, p["out"] / FPS
        if s0 <= ts <= s1:
            return p["at"] + ts - s0
        d = s0 - ts if ts < s0 else ts - s1
        v = p["at"] if ts < s0 else p["at"] + p["dur"]
        if best is None or d < best[0]:
            best = (d, v)
    return best[1]


names = list(caps)
for ci, name in enumerate(names):
    for i, w in enumerate(caps[name]):
        words.append({"w": w["w"], "s": round(to_edit(ci, w["s"]), 3), "e": round(to_edit(ci, w["e"]), 3), "k": w["k"], "clip": ci, "i": i})


def W(name, i):
    ci = names.index(name)
    return next(w for w in words if w["clip"] == ci and w["i"] == i)


def clip_end(name):
    ci = names.index(name)
    p = [p for p in pieces if p["clip"] == ci][-1]
    return p["at"] + p["dur"]


ff = []
for name, w0, w1, scene in beats["ff"]:
    a = W(name, w0)["s"] - 0.12
    last = w1 == len(caps[name]) - 1
    b = clip_end(name) if last else W(name, w1 + 1)["s"] - 0.08
    ff.append({"scene": scene, "a": round(a, 3), "b": round(b, 3), "clip": names.index(name), "w0": w0, "w1": w1})
for i in range(1, len(ff)):
    if ff[i]["a"] < ff[i - 1]["b"] + 0.05:
        ff[i]["a"] = ff[i - 1]["b"]
punch = [round(W(n, i)["s"], 3) for n, i in beats["punch"]]
slam = [{"t": round(W(n, i)["s"], 3), "text": txt, "tone": tone} for n, i, txt, tone in beats["slam"]]

speech = t
pro = {"fps": FPS, "speech": round(speech, 3), "endCard": END_CARD, "duration": round(speech + END_CARD, 3), "frames": round((speech + END_CARD) * FPS),
       "pieces": pieces, "words": words, "ff": ff, "punch": punch, "slam": slam}
json.dump(pro, open(os.path.join(ROOT, "src", "pro.json"), "w"), indent=1)
ffdur = sum(x["b"] - x["a"] for x in ff)
print(f"speech {speech:.2f}s, {len(pieces)} pieces, full-frame {ffdur:.1f}s ({ffdur / speech * 100:.0f}%), total {speech + END_CARD:.2f}s")
for x in ff:
    print(f"  {x['scene']:10s} {x['a']:6.2f}-{x['b']:6.2f}")
