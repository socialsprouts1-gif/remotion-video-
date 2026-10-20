#!/usr/bin/env python3
"""Compose The Night Shift's score + sound design into public/audio/score.wav.

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
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
B = TL["beats"]
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


# ------------------------------------------------------------------ night: 2:14 AM
SPB = 60 / TL["bpm"]
place(drone(14.2, (33, 45, 52), 0.12), 0.0, 0.3, 0, 0.5)
place(impact(0.5, 1.6) * 0.6, B["clockIn"], 0.5, 0, 0.5)
for k, tt in enumerate(np.arange(B["clockIn"] + 0.6, 13.6, 0.5)):  # a quiet clock in an empty room
    place(tick(k % 2 == 0), tt, 0.07 if tt < B["dim"][0] or tt > B["wake"] else 0.1, 0.25 if k % 2 else -0.25, 0.4)
# music-box night motif (A minor, sparse)
NIGHT = [(1.2, 76), (1.9, 72), (2.6, 69), (4.2, 76), (4.9, 74), (5.6, 72)]
for tt, m in NIGHT:
    place(pluck(m, 0.6, 0.12), tt, 0.1, 0.2, 0.7)
place(whoosh(0.9, 200, 2200, 0.6), B["clockUp"][0], 0.2, 0, 0.4)
place(ping(1046.5, 1568.0), B["msgIn"], 0.38, 0.1, 0.5)
# asleep: the room drains
place(drone(2.6, (28, 35), 0.05), B["dim"][0], 0.25, 0, 0.6)
# wake: the business switches on
place(riser(0.7, 300, 6000), B["wake"] - 0.7, 0.3, 0, 0.3)
place(impact(0.8, 1.8), B["wake"], 0.6, 0, 0.6)
place(pad([57, 64, 69, 72], 5.0, 0.4, 1.2, 5), B["wake"], 0.45, 0, 0.6)
for k in range(5):
    place(tick(k % 2 == 0) * 0.5, B["aiTyping"][0] + k * 0.13, 0.1, 0.3, 0.2)
place(ping(1318.5, 1760.0), B["aiReply"], 0.3, 0.3, 0.5)
place(ping(1046.5, 1396.9), B["custReply"], 0.26, -0.3, 0.5)
place(pad([69, 76, 81], 1.4, 0.01, 1.3, 6), B["booked"], 0.5, 0.2, 0.8)
place(ping(1568.0, 2093.0), B["booked"], 0.32, 0.2, 0.7)
for tb in np.arange(B["wake"], 13.6, SPB):
    place(kick(0.5), tb, 0.28, 0, 0.05)

# ------------------------------------------------------------------ the day: dial sweep, 120 BPM
place(whoosh(1.4, 150, 3000, 0.5), B["toDial"][0], 0.4, 0, 0.5)
place(impact(0.7, 1.6), B["toDial"][1], 0.5, 0, 0.5)
CHORDS = [[57, 64, 69, 72], [53, 60, 65, 69], [48, 55, 60, 64], [55, 62, 67, 71]]  # Am F C G
ARP = [[69, 72, 76, 81], [65, 69, 72, 77], [64, 67, 72, 76], [67, 71, 74, 79]]
g0 = B["toDial"][1]
bar = 4 * SPB
for b in range(int((B["fullCircle"][1] - g0) / bar) + 1):
    t0 = g0 + b * bar
    ch = b % 4
    place(pad(CHORDS[ch], bar, 0.5, 1.0, 5), t0, 0.5, 0, 0.5)
    for s in range(8):
        tt = t0 + s * SPB / 2
        if tt > B["fullCircle"][1]:
            break
        place(pluck(ARP[ch][s % 4] + (12 if b % 2 else 0), 0.2, 0.3), tt, 0.09, (s % 4) / 1.5 - 1, 0.45)
for tb in np.arange(g0, B["fullCircle"][1], SPB):
    place(kick(0.8), tb, 0.5, 0, 0.05)
    place(hat(), tb + SPB / 2, 0.12, 0.3, 0.1)
for i, te in enumerate(B["events"]):  # each card ejected from the dial
    place(whoosh(0.35, 800, 6000, 0.3), te - 0.05, 0.18, 0.4, 0.3)
    place(ping(1318.5 * 2 ** (i / 12 * 2), 1975.5 * 2 ** (i / 12 * 2)), te + 0.05, 0.24, 0.2, 0.5)

# ------------------------------------------------------------------ 24h closed, every message answered
place(riser(1.6, 200, 8000), B["fullCircle"][1] - 1.6, 0.35, 0, 0.3)
place(impact(1.1, 2.6), B["fullCircle"][1], 0.85, 0, 0.7)
place(pad([57, 64, 69, 72, 76], 3.4, 0.05, 1.6, 7), B["fullCircle"][1], 0.7, 0, 0.7)
place(impact(0.4, 1.0), B["every1"], 0.3, 0, 0.5)
place(impact(0.4, 1.0), B["every2"], 0.3, 0, 0.5)
for tb in np.arange(B["fullCircle"][1], B["toLogo"][0], SPB):
    place(kick(0.6), tb, 0.35, 0, 0.05)

# ------------------------------------------------------------------ logo + lockup
place(whoosh(1.4, 150, 3500, 0.7), B["toLogo"][0], 0.35, 0, 0.5)
place(riser(0.8, 300, 9000), B["toLogo"][1] - 0.8, 0.3, 0, 0.3)
place(impact(1.3, 3.0), B["toLogo"][1], 0.95, 0, 0.7)
place(pad([57, 64, 69, 72, 76, 81], 5.6, 0.02, 2.2, 8), B["toLogo"][1], 0.8, 0, 0.8)
place(ping(1318.5, 1975.5), B["cta"], 0.2, 0, 0.8)

# ------------------------------------------------------------------ room + master
def ir(d=2.6):
    t = tax(d)
    out = []
    for ch in range(2):
        n = rng.standard_normal(len(t)) * np.exp(-t / 0.55)
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
fo = int(0.8 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5

out = os.path.join(ROOT, "public", "audio", "score.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
print(f"wrote {os.path.relpath(out, ROOT)}  {DUR}s")
