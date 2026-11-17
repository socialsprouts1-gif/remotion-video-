#!/usr/bin/env python3
"""Caption words (first half: 0-36.6 s) with timings.
Text is what he says in this take, spelled in Hinglish; timings come from Whisper words (work/asr.json up to 28.4 s,
work/asr_tail.json chunk 0 after), matched token by token, with misheard words timed from their neighbours."""
import difflib, json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
END = 36.62
SAID = """Kya aapki website Google par first page pe show nahi karti? Toh dekho, ise solve karne ka ek behtareen tareeka!
Most agencies aapke business ki ranking badhane ke liye har month hazaaron rupaye charge karti hain.
Lekin kya aap apni khud ki AI-powered SEO team bana sako?
Pehla, Auditor, identify karta hai ki aapki website ki ranking mein kya problem aa rahi hai.
Doosra, Analyst, un pages ko find karta hai jo Google par first page pe rank karne ke close hain.
Teesra, Researcher, discover karta hai ki aapke customers actually search kya kar rahe hain.
Aur Editor content ko check karta hai, taaki information accurate ho sake, aur fake claims remove karta hai.
Ye saare AI agents milkar ek strategy par kaam karte hain."""
asr = [w for w in json.load(open(os.path.join(ROOT, "work", "asr.json"))) if w["s"] < 28.4]
asr += [w for w in json.load(open(os.path.join(ROOT, "work", "asr_tail.json")))[0] if w["s"] < END]
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
disp = SAID.split()
A, D = [norm(w["w"]) for w in asr], [norm(w) for w in disp]
times = [None] * len(disp)
sm = difflib.SequenceMatcher(None, D, A, autojunk=False)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal":
        for k in range(i2 - i1): times[i1 + k] = (asr[j1 + k]["s"], asr[j1 + k]["e"])
    elif tag == "replace":   # same span, different spelling: spread the heard span over the shown words
        s, e = asr[j1]["s"], asr[j2 - 1]["e"]
        L = [len(disp[i]) + 2 for i in range(i1, i2)]
        acc = s
        for n, i in enumerate(range(i1, i2)):
            d = (e - s) * L[n] / sum(L); times[i] = (acc, acc + d); acc += d
# words Whisper missed entirely: share the gap between their neighbours
i = 0
while i < len(disp):
    if times[i] is None:
        j = i
        while j < len(disp) and times[j] is None: j += 1
        a = times[i - 1][1] if i else 0.0
        b = times[j][0] if j < len(disp) else END
        if b - a < 0.08 * (j - i):   # no room: borrow from the previous word
            a = max(times[i - 1][0] + 0.1, b - 0.12 * (j - i)) if i else a
            if i: times[i - 1] = (times[i - 1][0], a)
        for n, k in enumerate(range(i, j)):
            times[k] = (a + (b - a) * n / (j - i), a + (b - a) * (n + 1) / (j - i))
        i = j
    else:
        i += 1
out = []
for k, w in enumerate(disp):
    s, e = times[k]
    nx = times[k + 1][0] if k + 1 < len(disp) else END
    out.append({"w": w, "s": round(s, 3), "e": round(max(s + 0.06, min(e, nx)), 3)})
for k in range(1, len(out)):       # keep order strictly increasing
    if out[k]["s"] <= out[k - 1]["s"]: out[k]["s"] = round(out[k - 1]["s"] + 0.05, 3)
json.dump(out, open(os.path.join(ROOT, "src", "words.json"), "w"), ensure_ascii=False, indent=0)
print(len(out), "words")
print(" ".join(f"{i}:{w['w']}@{w['s']:.2f}" for i, w in enumerate(out)))
