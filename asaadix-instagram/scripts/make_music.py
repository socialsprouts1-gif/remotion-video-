#!/usr/bin/env python3
"""Synthesise a light, driving music bed into public/audio/music.wav (no samples, no licensing).

90 BPM, Dm - Bb - F - C, length from src/vo.json. Soft pad from detuned sine partials, a sub bass on the root, a soft kick
from the problem beat onwards, quiet off-beat hats, a lift for the ending. Run: python3 scripts/make_music.py
"""
import os
import wave

import numpy as np

SR = 44100
import json
VO = json.load(open(os.path.join(os.path.dirname(__file__), "..", "src", "vo.json")))
DUR = VO["total"]
GONE = [l["start"] + l["dur"] for l in VO["lines"] if l["section"] == "loss"][-1]
HOOK = VO["lines"][0]["start"]
BPM = 90
BEAT = 60 / BPM
BAR = BEAT * 4
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "music.wav")
rng = np.random.default_rng(3)
n = int(SR * DUR)
t = np.arange(n) / SR
L = np.zeros(n)
R = np.zeros(n)

def hz(m):
    return 440 * 2 ** ((m - 69) / 12)

CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]  # Dm Bb F C
ROOTS = [38, 34, 41, 36]

def env(seg_len, a=0.4, r=0.6):
    e = np.ones(seg_len)
    na, nr = min(int(a * SR), seg_len // 2), min(int(r * SR), seg_len // 2)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e

# pad: one chord per bar
bar = 0
while bar * BAR < DUR:
    s = int(bar * BAR * SR)
    e = min(n, int((bar + 1) * BAR * SR) + int(0.3 * SR))
    seg = np.arange(e - s) / SR
    ch = CHORDS[bar % 4]
    padL = np.zeros(e - s)
    padR = np.zeros(e - s)
    for k, m in enumerate(ch + [ch[0] + 12]):
        f = hz(m)
        for h, amp in [(1, 1.0), (2, 0.25), (3, 0.08)]:
            padL += amp * np.sin(2 * np.pi * f * h * 1.0015 * seg + k)
            padR += amp * np.sin(2 * np.pi * f * h * 0.9985 * seg + k * 1.7)
    ev = env(e - s, 0.5, 0.8)
    L[s:e] += padL * ev * 0.035
    R[s:e] += padR * ev * 0.035
    # sub bass pulses on beats 1 and 3
    for b in (0, 2):
        bs = s + int(b * BEAT * SR)
        be = min(n, bs + int(BEAT * 1.6 * SR))
        if bs >= n:
            continue
        sg = np.arange(be - bs) / SR
        sub = np.sin(2 * np.pi * hz(ROOTS[bar % 4]) * sg) * np.exp(-sg * 2.2)
        L[bs:be] += sub * 0.16
        R[bs:be] += sub * 0.16
    bar += 1

# drums from 4.4 s (problem) to 54 s, thinning in the ending's journey section
beat = 0
while beat * BEAT < DUR:
    bt = beat * BEAT
    s = int(bt * SR)
    if HOOK + 4.5 <= bt < DUR - 3.0 and not (GONE - 0.2 <= bt < GONE + 1.0):
        ln = int(0.35 * SR)
        sg = np.arange(min(ln, n - s)) / SR
        freq = 50 + 110 * np.exp(-sg * 30)
        kick = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-sg * 9)
        L[s:s + len(sg)] += kick * 0.32
        R[s:s + len(sg)] += kick * 0.32
        hs = int((bt + BEAT / 2) * SR)
        hl = min(int(0.05 * SR), n - hs)
        if hl > 0:
            noise = rng.standard_normal(hl)
            hat = np.diff(np.concatenate([[0], noise])) * np.exp(-np.arange(hl) / SR * 80)
            L[hs:hs + hl] += hat * 0.03
            R[hs:hs + hl] += hat * 0.045
    beat += 1

# fade in/out
fade = np.minimum(1, np.minimum(t / 0.5, (DUR - t) / 2.5))
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * 0.7, R / peak * 0.7
data = (np.stack([L, R], axis=1) * 32767).astype(np.int16)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())
print("wrote", OUT, f"{DUR}s")
