#!/usr/bin/env python3
"""Forced alignment of script.txt to the clean voice track.
PocketSphinx (en-us acoustic model, bundled in the pip wheel) decodes the audio against a grammar that
is exactly the script, word for word. Hindi words get pronunciations from simple Hinglish spelling rules,
English words come from CMUdict, numbers may be spoken either way ("bees" or "twenty").
Writes work/align.json: one entry per script word with start/end seconds."""
import json, os, re, subprocess
import numpy as np
import pocketsphinx as ps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MD = os.path.join(ps.get_model_path(), "en-us")
CMU = {}
for l in open(os.path.join(MD, "cmudict-en-us.dict")):
    p = l.split()
    if p and "(" not in p[0]: CMU[p[0]] = " ".join(p[1:])

ENGLISH = set("""survey message businesses business hours reply potential customer whatsapp enquiry chances contact problem
solve chat automation software automate help replies automated appointments book leads qualify data store busy handle easy
first special pricing benefit late miss let's make smarter with""".split())
MANUAL = {
    "neura": "N UH R AA", "akola": "AH K OW L AA", "akola's": "AH K OW L AA Z", "enquiries": "IH N K W AY R IY Z",
    "follow-ups": "F AA L OW AH P S", "aur": "AO R", "hai": "HH EH", "hain": "HH EH N", "mein": "M EY N",
    "yeh": "Y EH", "toh": "T OW", "woh": "W OW", "nahi": "N AH HH IY", "ab": "AH B", "hon": "HH OW N",
}
NUM = {
    "100": ["sau", "hundred", "one hundred", "ek sau"], "20": ["bees", "twenty"], "2": ["do", "two"],
    "30": ["tees", "thirty"], "24/7": ["twenty four seven", "twenty four by seven", "chaubees saat"],
}
EXTRA = {"sau": "S AO", "bees": "B IY S", "do": "D OW", "tees": "T IY S", "ek": "EH K", "chaubees": "CH AO B IY S", "saat": "S AA T", "by": "B AY"}

RULES = [("chh", "CH"), ("ch", "CH"), ("kh", "K"), ("gh", "G"), ("jh", "JH"), ("th", "T"), ("dh", "D"), ("ph", "F"), ("bh", "B"),
         ("sh", "SH"), ("aa", "AA"), ("ai", "EH"), ("au", "AO"), ("ee", "IY"), ("ei", "EY"), ("oo", "UW"), ("ou", "AW")]
ONE = dict(a="AH", e="EY", i="IH", o="OW", u="UH", y="Y", w="W", v="V", b="B", d="D", f="F", g="G", h="HH", j="JH", k="K", l="L",
           m="M", n="N", p="P", q="K", r="R", s="S", t="T", z="Z", c="K")

def hinglish(w):
    w = re.sub(r"h$", "", w) if len(w) > 2 and w[-2] in "aeiou" else w
    out, i = [], 0
    while i < len(w):
        for a, b in RULES:
            if w.startswith(a, i): out.append(b); i += len(a); break
        else:
            ch = w[i]; i += 1
            if ch == "x": out += ["K", "S"]; continue
            if ch not in ONE: continue
            ph = ONE[ch]
            if i == len(w) and ch == "a": ph = "AA"     # final a is long: kiya, karta, lega
            if i == len(w) and ch == "i": ph = "IY"     # final i is long: bhi, ki, kisi
            out.append(ph)
    return " ".join(out)

def pron(k):
    if k in MANUAL: return MANUAL[k]
    if k in EXTRA: return EXTRA[k]
    if k in ENGLISH and k in CMU: return CMU[k]
    return hinglish(k)

def speech_islands(x, min_pause=0.12):
    """Stretches of speech between pauses (10 ms frames, 30 dB under the loud speech)."""
    H = 160
    e = np.array([20 * np.log10(np.sqrt((x[i:i + H] ** 2).mean()) + 1e-9) for i in range(0, len(x) - H, H)])
    e = np.convolve(e, np.ones(3) / 3, "same")
    low = e < np.percentile(e, 95) - 30
    P, i = [], 0
    while i < len(low):
        if low[i]:
            j = i
            while j < len(low) and low[j]: j += 1
            if (j - i) >= min_pause * 100 or i == 0 or j == len(low): P.append((i / 100, j / 100))
            i = j
        else: i += 1
    if not P or P[0][0] > 0: P.insert(0, (0, 0))
    if P[-1][1] < len(low) / 100: P.append((len(low) / 100, len(low) / 100))
    return [(P[k][1], P[k + 1][0]) for k in range(len(P) - 1) if P[k + 1][0] - P[k][1] > 0.15]


class Aligner:
    def __init__(self, words, keys):
        cfg = ps.Config(lm=None)
        cfg["hmm"] = os.path.join(MD, "en-us"); cfg["dict"] = os.path.join(MD, "cmudict-en-us.dict"); cfg["loglevel"] = "ERROR"
        cfg["beam"] = 1e-100; cfg["pbeam"] = 1e-100; cfg["wbeam"] = 1e-80
        self.cfg = cfg; self.words, self.keys = words, keys

    def name(self, i, alt, p, sub):
        n = f"w{i}a{alt}p{p}"
        self.dec.add_word(n, pron(sub), True)
        return n

    def run(self, audio, i0, i1, alts):
        self.dec = ps.Decoder(self.cfg)            # fresh decoder: a reused one can hand back a stale result
        names, tok = [], {}
        for i in range(i0, i1):
            k = self.keys[i]; a = alts.get(i, 0)
            spoken = NUM[k][a] if k in NUM else k
            for p, sub in enumerate(spoken.split()):
                n = self.name(i, a, p, sub); names.append(n); tok[n] = i
        self.dec.set_align_text(" ".join(names))
        self.dec.start_utt(); self.dec.process_raw(audio, full_utt=True); self.dec.end_utt()
        h = self.dec.hyp()
        if h is None or len(h.hypstr.split()) != len(names): return None   # partial = the words did not fit
        span, sil = {}, []
        for s in self.dec.seg():
            a, b = s.start_frame / 100, (s.end_frame + 1) / 100
            if s.word in tok:
                i = tok[s.word]
                span[i] = (min(span.get(i, (a, b))[0], a), max(span.get(i, (a, b))[1], b))
            else:
                sil.append((a, b))
        return h.score, span, sil


def n_phones(keys, i, k, alts):
    n = 0
    for j in range(i, k):
        sp = NUM[keys[j]][alts.get(j, 0)] if keys[j] in NUM else keys[j]
        n += sum(len(pron(t).split()) for t in sp.split())
    return n


if __name__ == "__main__":
    import itertools, sys
    words = [w for w in open(os.path.join(ROOT, "script.txt")).read().split() if w != "—"]
    keys = [re.sub(r"[^a-z0-9'/-]", "", w.lower()) for w in words]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "work", "voice_clean.wav"), "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, "<i2") / 32768
    H = 160
    E = np.array([20 * np.log10(np.sqrt((x[i:i + H] ** 2).mean()) + 1e-9) for i in range(0, len(x) - H, H)])
    loud = E > np.percentile(E, 95) - 22          # frames that are clearly speech
    isl = speech_islands(x)
    A = Aligner(words, keys)
    out, i, chosen = {}, 0, {}
    debug = "-v" in sys.argv
    for n_, (a, b) in enumerate(isl):
        a0, b0 = max(0, a - 0.12), min(len(x) / 16000, b + 0.12)
        audio = raw[int(a0 * 16000) * 2: int(b0 * 16000) * 2]
        last = n_ == len(isl) - 1
        best = None
        ks = [len(words)] if last else range(i + 1, min(len(words), i + 40) + 1)
        for k in ks:
            nums = [j for j in range(i, k) if keys[j] in NUM]
            for combo in itertools.product(*[range(len(NUM[keys[j]])) for j in nums]):
                alts = dict(zip(nums, combo))
                r = A.run(audio, i, k, alts)
                if not r: continue
                sc, span, sil = r
                # speech left in "silence" = words missing; words squeezed below ~45 ms per phone = too many words
                left = sum(int(loud[int((a0 + s) * 100):int((a0 + e) * 100)].sum()) for s, e in sil) / 100
                dur = sum(e - s for s, e in span.values())
                squeeze = max(0.0, n_phones(keys, i, k, alts) * 0.045 - dur)
                cost = left + 2.0 * squeeze - 1e-7 * sc
                if debug: print(f"   k={k} {words[k-1]:>12} left={left:.2f} squeeze={squeeze:.2f} cost={cost:.3f}")
                if best is None or cost < best[0]: best = (cost, k, span, alts)
            if not last and best and k - best[1] > 6: break
        if best is None:
            print(f"island {a:.2f}-{b:.2f}: no fit, skipped"); continue
        cost, k, span, alts = best
        for j, (s, e) in span.items(): out[j] = (round(a0 + s, 3), round(a0 + e, 3))
        for j, v in alts.items(): chosen[j] = NUM[keys[j]][v]
        print(f"island {a:5.2f}-{b:5.2f} cost {cost:.2f}: {' '.join(words[i:k])}")
        i = k
        if i >= len(words): break
    missing = [j for j in range(len(words)) if j not in out]
    print(f"{len(words)} words, aligned {len(out)}, missing {[words[j] for j in missing]}")
    print("numbers spoken as:", {f"{words[j]}#{j}": v for j, v in chosen.items()})
    res = [{"w": w, "s": out[j][0], "e": out[j][1], "spoken": chosen.get(j)} for j, w in enumerate(words) if j in out]
    json.dump(res, open(os.path.join(ROOT, "work", "align.json"), "w"), ensure_ascii=False, indent=0)
