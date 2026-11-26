#!/usr/bin/env python3
"""Festive Diwali music bed, synthesised from scratch (no samples, no licensing) → public/audio/music.wav.

Tanpura-like drone on D/A, a plucked (Karplus-Strong) melody in a D-major pentatonic, and a dholak-style
groove (low "dha" thumps + high "ta" slaps). It follows the story from src/vo.json: light at the start,
sparse during the problem, full and bright from Raju's idea, with bells in the celebration.
Run: python3 scripts/make_music.py
"""
import json
import os
import wave

import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
VO = json.load(open(os.path.join(HERE, "..", "src", "vo.json")))
DUR = VO["total"]
sec = {}
for l in VO["lines"]:
    sec.setdefault(l["section"], l["start"])
T_TENSE = sec["shock"]
T_IDEA = sec["raju"]
T_PARTY = sec["crowd"]
T_END = sec["end"]
BPM = 104
BEAT = 60 / BPM
n = int(SR * DUR)
t = np.arange(n) / SR
out = np.zeros(n)
rng = np.random.default_rng(5)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def level(tt):
    """Section loudness for the groove."""
    if tt < T_TENSE:
        return 0.7
    if tt < T_IDEA:
        return 0.35
    if tt < T_PARTY:
        return 0.85
    if tt < T_END:
        return 1.0
    return 0.55


# drone: D2 + A2 + D3 with slow shimmer
for m, g in [(38, 0.08), (45, 0.06), (50, 0.05)]:
    f0 = hz(m)
    sig = sum((0.6 / k) * np.sin(2 * np.pi * f0 * k * t + k) for k in range(1, 6))
    sig *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.23 * t + m)
    out += g * sig


def pluck(freq, dur, bright=0.5):
    N = int(SR / freq)
    buf = rng.uniform(-1, 1, N)
    L = int(SR * dur)
    y = np.empty(L)
    for i in range(L):
        y[i] = buf[i % N]
        buf[i % N] = 0.5 * (buf[i % N] + buf[(i + 1) % N]) * (0.994 + 0.004 * bright)
    return y * np.exp(-np.arange(L) / (SR * dur * 0.5))


def add(sig, at, gain):
    s = int(at * SR)
    if s >= n:
        return
    e = min(n, s + len(sig))
    out[s:e] += sig[: e - s] * gain


def dha(at, g):
    L = int(SR * 0.35)
    tt = np.arange(L) / SR
    f = 80 + 70 * np.exp(-tt * 30)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9), at, g)


def ta(at, g):
    L = int(SR * 0.12)
    tt = np.arange(L) / SR
    noise = rng.uniform(-1, 1, L)
    noise = np.diff(np.concatenate([[0], noise]))  # brighter
    tone = np.sin(2 * np.pi * 420 * tt)
    add((noise * 0.5 + tone * 0.6) * np.exp(-tt * 35), at, g)


def bell(at, g):
    L = int(SR * 0.6)
    tt = np.arange(L) / SR
    sig = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(2350, 1), (3720, 0.5), (5100, 0.3)])
    add(sig * np.exp(-tt * 7), at, g)


# groove: 8 eighths per bar — dha . ta dha . dha ta .
pattern = ["dha", None, "ta", "dha", None, "dha", "ta", "ta"]
step = BEAT / 2
i = 0
x = 0.4
while x < DUR - 1:
    lv = level(x)
    kind = pattern[i % 8]
    if kind == "dha":
        dha(x, 0.32 * lv)
    elif kind == "ta" and (lv > 0.4 or i % 4 == 2):
        ta(x, 0.12 * lv)
    if T_PARTY <= x < T_END and i % 2 == 0:
        bell(x, 0.03)
    i += 1
    x += step

# melody: pentatonic phrases (D E F# A B)
scale = [62, 64, 66, 69, 71, 74, 76, 78]
phrases = [[0, 2, 3, 2, 4, 3, 2, 0], [3, 4, 5, 4, 3, 2, 3, None], [5, 6, 5, 4, 3, 4, 2, 3], [2, 3, 4, 3, 2, 1, 0, None]]
x = 0.4
k = 0
while x < DUR - 2:
    lv = level(x)
    ph = phrases[k % len(phrases)]
    for j, d in enumerate(ph):
        at = x + j * BEAT / 2
        if d is None or at > DUR - 1.5:
            continue
        if lv < 0.5 and j % 2:  # sparse during the problem
            continue
        add(pluck(hz(scale[d]), 0.9, 0.6), at, 0.16 * lv)
        if lv >= 0.85 and j % 4 == 0:
            add(pluck(hz(scale[d] - 12), 1.2, 0.3), at, 0.08)
    x += BEAT * 4
    k += 1

# final chord at the end card
for m in [62, 66, 69, 74]:
    add(pluck(hz(m), 3.0, 0.4), T_END + 0.05, 0.12)

# fade in/out, normalise to a modest peak
fade = np.minimum(1, t / 1.0) * np.minimum(1, (DUR - t) / 2.0)
out *= np.clip(fade, 0, 1)
out = out / max(1e-6, np.abs(out).max()) * 0.6
stereo = np.stack([out, np.roll(out, 220)], axis=1)
pcm = (stereo * 32767).astype(np.int16)
path = os.path.join(HERE, "..", "public", "audio", "music.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"music {DUR:.1f}s → {path}")
