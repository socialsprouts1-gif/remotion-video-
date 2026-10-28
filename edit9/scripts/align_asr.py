#!/usr/bin/env python3
"""Word timing from the real audio (no guessing).

1. Split the voice into speech chunks at every breath (energy dips >= 0.12 s).
2. Transcribe each chunk with Whisper (sherpa-onnx, Hindi/Hinglish).
3. Monotonic DP matches the script words onto the chunk sequence by sound-alike spelling,
   so every word lands inside the chunk where it is actually spoken.
4. Inside a chunk, words are spread by syllables across its voiced span.
Writes src/segs.json in the same format build_edit.py reads, plus src/asr_chunks.json for inspection.

  python3 scripts/align_asr.py <whisper_model_dir>
"""
import json, os, re, sys, wave
import numpy as np
import sherpa_onnx

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MD = sys.argv[1]
WAV = "/tmp/claude-0/asr/voice16.wav"
w = wave.open(WAV)
SR = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

# ---- 1. chunks
hop = 160
e = np.sqrt(np.convolve(x ** 2, np.ones(400) / 400, "same")[::hop])
db = 20 * np.log10(e + 1e-6)
thr = np.percentile(db, 30) + 4
voiced = db > thr
chunks, i, n = [], 0, len(voiced)
while i < n:
    if voiced[i]:
        j = i
        while j < n and (voiced[j] or (j + 25 < n and voiced[j:j + 25].any())):
            j += 1
        if j - i >= 15:
            chunks.append([i / 100, j / 100])
        i = j
    else:
        i += 1
# split very long chunks at their deepest dip so each piece is short enough to place words precisely
def split(c):
    a, b = c
    if b - a <= 7.5:
        return [c]
    s, t = int(a * 100) + 60, int(b * 100) - 60
    k = s + int(np.argmin(np.convolve(db[s:t], np.ones(5) / 5, "same")))
    return split([a, k / 100]) + split([k / 100, b])
chunks = [p for c in chunks for p in split(c)]

# ---- 2. transcribe (medium, Hindi). Silence padding lifts sherpa's per-chunk token cap; repeated-phrase loops fall back to base.
DEV = {**{c: v for c, v in zip("अआइईउऊऋएऐओऔ", ["a", "aa", "i", "ee", "u", "oo", "ri", "e", "ai", "o", "au"])},
       **{c: v for c, v in zip("ािीुूृेैोौ", ["aa", "i", "ee", "u", "oo", "ri", "e", "ai", "o", "au"])}}
CONS = dict(zip("कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक़ख़ग़ज़ड़ढ़फ़", ["k", "kh", "g", "gh", "n", "ch", "chh", "j", "jh", "n", "t", "th", "d", "dh", "n", "t", "th", "d", "dh", "n", "p", "ph", "b", "bh", "m", "y", "r", "l", "v", "sh", "sh", "s", "h", "q", "kh", "g", "z", "r", "rh", "f"]))
def translit(t):
    out, i = [], 0
    while i < len(t):
        ch = t[i]
        nx = t[i + 1] if i + 1 < len(t) else ""
        if ch == "\u093c":
            i += 1
            continue
        if ch in CONS:
            out.append(CONS[ch])
            if nx == "\u093c":
                i += 1
                nx = t[i + 1] if i + 1 < len(t) else ""
            if nx in DEV and nx not in "अआइईउऊऋएऐओऔ":
                out.append(DEV[nx]); i += 2; continue
            if nx == "\u094d":
                i += 2; continue
            out.append("a" if nx and nx not in " ,.?!।" else "")
        elif ch in DEV:
            out.append(DEV[ch])
        elif ch in "\u0902\u0901":
            out.append("n")
        elif ch == "\u0903":
            out.append("h")
        else:
            out.append(ch)
        i += 1
    return "".join(out)
def loopy(t):
    ws = t.split()
    return len(ws) > 6 and len(set(ws)) < len(ws) / 2.5
def mk(name, lang):
    return sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{name}-encoder.int8.onnx", decoder=f"{name}-decoder.int8.onnx", tokens=f"{name}-tokens.txt", language=lang, task="transcribe", num_threads=8, tail_paddings=1500)
MED = mk(MD + "/medium", "hi")
BASE = mk(sys.argv[2] + "/base", "hi") if len(sys.argv) > 2 else None
def run(rec, seg):
    s = rec.create_stream()
    s.accept_waveform(SR, np.concatenate([np.zeros(4800, np.float32), seg, np.zeros(SR * 8, np.float32)]))
    rec.decode_stream(s)
    return s.result.text.strip()
for c in chunks:
    a, b = max(0, c[0] - 0.1), min(len(x) / SR, c[1] + 0.1)
    seg = x[int(a * SR):int(b * SR)]
    t = run(MED, seg)
    if loopy(t) and BASE:
        t = run(BASE, seg) + "  [base]"
    c.append(translit(t))
    print(f"  {c[0]:6.2f}-{c[1]:6.2f}  {c[2]}", flush=True)

# ---- 3. match script words to chunks
def norm(s):
    s = s.lower()
    s = re.sub(r"[^a-zऀ-ॿ ]", "", s)
    for a, b in [("aa", "a"), ("ee", "i"), ("oo", "u"), ("ph", "f"), ("sh", "s"), ("w", "v"), ("z", "j"), ("q", "k"), ("c", "k"), ("y", "i"), ("h", ""), ("e", "i"), ("o", "u")]:
        s = s.replace(a, b)
    return re.sub(r"(.)\1+", r"\1", s.replace(" ", ""))

words = [w for w in open(os.path.join(ROOT, "script.txt")).read().split() if w != "—"]
W = [norm(w) for w in words]
C = [norm(c[2]) for c in chunks]
from difflib import SequenceMatcher
def score(i, j, k):  # words i..j-1 against chunk k
    a = "".join(W[i:j])
    b = C[k]
    if not a and not b:
        return 0
    m = SequenceMatcher(None, a, b, autojunk=False)
    hits = sum(bl.size for bl in m.get_matching_blocks())
    return 2 * hits - 0.6 * (len(a) + len(b))
N, K = len(words), len(chunks)
NEG = -1e9
best = np.full((K + 1, N + 1), NEG)
back = np.zeros((K + 1, N + 1), int)
best[0][0] = 0
MAXW = 16
for k in range(K):
    for i in range(N + 1):
        if best[k][i] == NEG:
            continue
        for j in range(i, min(N, i + MAXW) + 1):
            v = best[k][i] + score(i, j, k)
            if v > best[k + 1][j]:
                best[k + 1][j] = v
                back[k + 1][j] = i
ends, j = [], N
for k in range(K, 0, -1):
    i = int(back[k][j])
    ends.append((i, j))
    j = i
ends.reverse()

# ---- 4. write segments (chunk span + its words)
segs = []
for (i, j), c in zip(ends, chunks):
    if j > i:
        segs.append([round(float(c[0]), 3), round(float(c[1]), 3), int(i), int(j)])
syl = []
SPEC = {"portfolio": 4, "telegram": 3, "multiply": 3, "crorepati": 4, "arabpati": 4, "five-star": 2, "jaane-anjaane": 5, "khoon-paseene": 4}
for w in words:
    l = re.sub(r"[^a-z\-]", "", w.lower())
    syl.append(SPEC.get(l, max(1, len(re.findall(r"[aeiouy]+", l)))))
json.dump({"words": words, "syl": syl, "segs": segs}, open(os.path.join(ROOT, "src", "segs.json"), "w"))
json.dump([{"a": float(c[0]), "b": float(c[1]), "heard": c[2], "script": " ".join(words[i:j])} for (i, j), c in zip(ends, chunks)], open(os.path.join(ROOT, "src", "asr_chunks.json"), "w"), indent=1, ensure_ascii=False)
for (i, j), c in zip(ends, chunks):
    print(f"{c[0]:6.2f}-{c[1]:6.2f} | heard: {c[2][:60]:60s} | script: {' '.join(words[i:j])}")
