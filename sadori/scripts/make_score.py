#!/usr/bin/env python3
"""Compose the Sadori ad's ambient score + sound design into public/audio/score.wav.

Everything is synthesised (no samples, no licences). Timing comes from
src/timeline.json — the same file the picture reads — so sound and image stay locked.
The 100-leads scene is rebuilt with the same pseudo-random function as the picture,
so every conversion pluck and every broken-stream glitch lands on its frame.

    python3 scripts/make_score.py
"""
import json
import math
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
TL = json.load(open(os.path.join(ROOT, "src", "story.json")))
B = TL
DUR = TL["duration"]
SR = 44100
N = int(SR * DUR)
rng = np.random.default_rng(3)

dry = np.zeros((N, 2))
send = np.zeros((N, 2))  # reverb send


def rnd(seed):
    """Same as rand() in src/lib/anim.ts."""
    x = math.sin(seed * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)


def tax(d):
    return np.arange(int(SR * d)) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, t0, gain=1.0, pan=0.0, verb=0.25):
    """Mix a mono signal at time t0 (s) with equal-power pan and a reverb send."""
    i0 = int(t0 * SR)
    if i0 >= N or len(sig) == 0:
        return
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    n = min(len(sig), N - i0)
    s = sig[:n] * gain
    a = (pan + 1) * math.pi / 4
    lr = np.stack([s * math.cos(a), s * math.sin(a)], axis=1)
    dry[i0 : i0 + n] += lr
    send[i0 : i0 + n] += lr * verb


def svf(x, cutoff, q=0.7, mode="bp"):
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    low = band = 0.0
    out = np.empty_like(x)
    damp = 1.0 / q
    for i in range(len(x)):
        f = 2 * math.sin(math.pi * min(cutoff[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        out[i] = band if mode == "bp" else (low if mode == "lp" else high)
    return out


def fft_band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def env(n, a, d):
    t = np.arange(n) / SR
    return np.clip(t / max(a, 1e-4), 0, 1) * np.exp(-np.maximum(t - a, 0) / d)


# ------------------------------------------------------------------ instruments
def pluck(m, d=0.35, bright=0.3):
    t = tax(d * 4)
    f = hz(m)
    y = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    return y * env(len(t), 0.003, d)


def blip(f, d=0.05):
    t = tax(d * 5)
    return np.sin(2 * np.pi * f * t) * env(len(t), 0.001, d)


def kick(depth=1.0):
    t = tax(0.6)
    ph = 2 * np.pi * np.cumsum(46 + 110 * np.exp(-t / 0.035)) / SR
    return np.sin(ph) * np.exp(-t / (0.22 * depth))


def hat():
    t = tax(0.08)
    n = np.diff(rng.standard_normal(len(t) + 1))
    return n * np.exp(-t / 0.018) * 0.5


def tick(hi=True):
    t = tax(0.05)
    f = 2300 if hi else 1700
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + 0.35 * rng.standard_normal(len(t)) * np.exp(-t / 0.0015))


def whoosh(d=0.7, lo=250, hi=5000, peak=0.6):
    n = int(SR * d)
    x = np.linspace(0, 1, n)
    sweep = np.where(x < peak, x / peak, 1 - (x - peak) / (1 - peak))
    y = svf(rng.standard_normal(n), lo + (hi - lo) * sweep ** 1.7, q=1.3)
    return y * np.where(x < peak, (x / peak) ** 2.2, ((1 - x) / (1 - peak)) ** 1.5)


def riser(d=1.6, lo=200, hi=7000):
    n = int(SR * d)
    x = np.linspace(0, 1, n)
    y = svf(rng.standard_normal(n), lo + (hi - lo) * x ** 2.2, q=2.4)
    tone = np.sin(2 * np.pi * np.cumsum(110 + 770 * x ** 2.5) / SR) * 0.25
    return (y + tone) * x ** 2.6


def impact(depth=1.0, d=2.2):
    t = tax(d)
    ph = 2 * np.pi * np.cumsum(32 + 90 * np.exp(-t / 0.08)) / SR
    sub = np.sin(ph) * np.exp(-t / (0.55 * depth))
    knock = fft_band(rng.standard_normal(len(t)), 40, 900) * np.exp(-t / 0.04) * 3
    return np.tanh((sub * 1.3 + knock) * 1.3)


def glitch(d=0.25):
    t = tax(d)
    x = rng.standard_normal(len(t))
    hold = 18
    x = np.repeat(x[::hold], hold)[: len(t)]
    gate = (np.sin(2 * np.pi * 37 * t) > 0).astype(float)
    return np.round(x * 3) / 3 * gate * np.exp(-t / (d / 3))


def ping(f1, f2):
    t = tax(0.6)
    y = np.sin(2 * np.pi * f1 * t) * env(len(t), 0.002, 0.08)
    t2 = np.clip(t - 0.085, 0, None)
    y += np.sin(2 * np.pi * f2 * t2) * env(len(t), 0.002, 0.14) * (t >= 0.085)
    return y


def pad(notes, d, attack=1.2, release=1.4, harm=6):
    t = tax(d + release)
    y = np.zeros_like(t)
    for m in notes:
        f = hz(m)
        for det in (-0.0018, 0.0018):
            for h in range(1, harm + 1):
                y += np.sin(2 * np.pi * f * (1 + det) * h * t + h) / h ** 1.6
    e = np.clip(t / attack, 0, 1) * np.clip((d + release - t) / release, 0, 1)
    return y * e / (len(notes) * 4)


def drone(d, notes=(33, 40), air=0.25):
    t = tax(d)
    y = sum(np.sin(2 * np.pi * hz(m) * t) * (1 + 0.15 * np.sin(2 * np.pi * 0.11 * t + m)) for m in notes)
    n = fft_band(rng.standard_normal(len(t)), 600, 3500) * air
    e = np.clip(t / 1.5, 0, 1) * np.clip((d - t) / 1.2, 0, 1)
    return (y / len(notes) + n * 0.4) * e



# ------------------------------------------------------------------ Sadori score
C = TL["cuts"]
HT = TL["hits"]


def bell(m, d=1.6, gain=1.0):
    t = tax(d * 2.5)
    f = hz(m)
    y = (np.sin(2 * np.pi * f * t) * np.exp(-t / d)
         + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / (d * 0.45))
         + 0.12 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / (d * 0.2)))
    return y * np.clip(t / 0.004, 0, 1) * gain


def shimmer(d=1.2):
    n = int(SR * d)
    x = np.linspace(0, 1, n)
    y = fft_band(rng.standard_normal(n), 5000, 14000)
    return y * np.sin(np.pi * x) ** 2 * 0.5


def boom(depth=1.0):
    t = tax(3.5)
    ph = 2 * np.pi * np.cumsum(30 + 40 * np.exp(-t / 0.12)) / SR
    sub = np.sin(ph) * np.exp(-t / (0.9 * depth))
    body = fft_band(rng.standard_normal(len(t)), 60, 400) * np.exp(-t / 0.09) * 1.2
    return np.tanh(sub * 1.2 + body)


def click():
    t = tax(0.12)
    metal = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, dd in ((3150, 0.012), (4720, 0.008), (1880, 0.02)))
    tk = tick(True)
    metal[: len(tk)] += tk * 1.2
    return metal * 0.5


# chord plan (MIDI) — warm, unhurried
chords = [
    (0.0, 4.0, [38, 45, 50]),            # D drone
    (4.0, 7.0, [50, 54, 57, 61, 64]),    # Dmaj9
    (7.0, 10.0, [47, 54, 57, 61, 62]),   # Bm11
    (10.0, 13.0, [43, 55, 59, 62, 66]),  # Gmaj7
    (13.0, 16.0, [40, 55, 59, 62, 66]),  # Em9
    (16.0, 19.5, [50, 54, 57, 61, 64]),
    (19.5, 23.0, [45, 52, 57, 61, 64]),  # A add9
    (23.0, 25.5, [42, 54, 57, 61, 62]),  # F#m
    (25.5, 28.0, [43, 55, 59, 62, 64]),  # G6
    (28.0, 31.0, [43, 55, 59, 62, 66]),  # Gmaj7
    (31.0, 35.0, [38, 50, 54, 57, 61, 64]),  # Dmaj9 home
]
for a, b, notes in chords:
    place(pad(notes, b - a + 0.6, attack=1.4 if a else 2.5, release=1.6, harm=5), a - 0.3, gain=0.5, verb=0.55)
place(drone(35.0, notes=(26, 38), air=0.18), 0, gain=0.35, verb=0.2)

# opening: beam reveal
place(shimmer(2.6), HT["beam"] - 0.2, gain=0.22, verb=0.8)
place(boom(0.7), HT["beam"], gain=0.35, verb=0.4)
place(bell(74, 2.4), HT["title1"], gain=0.16, pan=0.2, verb=0.8)
place(bell(69, 2.4), HT["title1"] + 0.18, gain=0.12, pan=-0.2, verb=0.8)

# cuts: soft air whoosh into, low thump on
for c in C:
    big = c in (23.0, 28.0)
    place(whoosh(0.8 if big else 0.55, 200, 3500 if big else 2600, 0.8), c - (0.62 if big else 0.42), gain=0.13, verb=0.4)
    place(boom(0.6 if not big else 0.9), c, gain=0.22 if not big else 0.3, verb=0.35)

# macro details: bells as light catches metal
for tt, m, pn in ((5.9, 81, 0.3), (7.25, 78, -0.3), (8.8, 74, 0.0)):
    place(bell(m, 1.8), tt, gain=0.1, pan=pn, verb=0.8)

# lens rings: slow rising shimmer, then the unfold clicks
place(shimmer(2.2), 10.1, gain=0.18, verb=0.8)
for tt in HT["unfold"]:
    place(click(), tt, gain=0.35, pan=0.35 if tt == HT["unfold"][0] else -0.35, verb=0.25)
for i, m in enumerate((69, 73, 76)):
    place(bell(m, 1.2), HT["dims"] + i * 0.22, gain=0.07, pan=-0.3 + 0.3 * i, verb=0.7)

# boutique row: one bell per style, rising
for i, (tt, m) in enumerate(zip(TL["styleAt"], (66, 69, 73, 76))):
    place(bell(m, 2.0), tt + 0.1, gain=0.12, pan=-0.3 + 0.2 * i, verb=0.8)
for tt in TL["styleAt"][1:]:
    place(whoosh(0.6, 300, 2200, 0.7), tt - 0.6, gain=0.07, verb=0.3)

# heritage: gentle plucked arpeggio as lines draw
arp = [54, 57, 62, 66, 55, 59, 62, 67]
for i, m in enumerate(arp):
    place(pluck(m, 0.6, 0.15), 23.3 + i * 0.55, gain=0.09, pan=0.25 * math.sin(i), verb=0.7)

# alignment + logo
place(riser(1.8, 150, 4000), HT["align"] - 1.8, gain=0.08, verb=0.5)
place(impact(1.2, 3.0), HT["align"], gain=0.42, verb=0.5)
place(shimmer(1.0), HT["align"] - 0.1, gain=0.2, verb=0.7)
place(boom(1.3), HT["logo"], gain=0.3, verb=0.5)
for i, m in enumerate((62, 66, 69, 74)):
    place(bell(m, 2.6), HT["logo"] + i * 0.09, gain=0.11, pan=-0.3 + 0.2 * i, verb=0.9)
place(shimmer(1.1), 32.0, gain=0.14, verb=0.8)
place(bell(81, 2.4), HT["cta"] + 0.55, gain=0.07, verb=0.9)

# ------------------------------------------------------------------ room + master
def ir(d=3.2):
    t = tax(d)
    out = []
    for ch in range(2):
        n = rng.standard_normal(len(t)) * np.exp(-t / 0.8)
        n = fft_band(n, 80, 7000)
        n[: int(0.012 * SR)] *= 0.2
        out.append(n / np.sqrt(np.sum(n ** 2)))
    return out


def convolve(x, h):
    L = len(x) + len(h) - 1
    nfft = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[: len(x)]


H = ir()
wet = np.stack([convolve(send[:, c], H[c]) for c in range(2)], axis=1)
mix = dry + wet * 0.9
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix *= 0.89 / max(1e-9, np.max(np.abs(mix)))
fo = int(1.2 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5

out = os.path.join(ROOT, "public", "audio", "score.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
print(f"wrote {os.path.relpath(out, ROOT)}  {DUR}s")
