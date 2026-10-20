#!/usr/bin/env python3
"""Compose The Anatomy of a Reply's score + sound design into public/audio/score.wav.

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


# ------------------------------------------------------------------ helpers specific to this film
def bez(p1x, p1y, p2x, p2y):
    """CSS cubic-bezier as a function of x (matches Remotion's Easing.bezier)."""
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            u = (lo + hi) / 2
            bx = 3 * (1 - u) ** 2 * u * p1x + 3 * (1 - u) * u * u * p2x + u ** 3
            lo, hi = (u, hi) if bx < x else (lo, u)
        u = (lo + hi) / 2
        return 3 * (1 - u) ** 2 * u * p1y + 3 * (1 - u) * u * u * p2y + u ** 3
    return f


EASE_OUT = bez(0.16, 1, 0.3, 1)
SPB = 60 / TL["bpm"]


def sparkle(d=0.03, f=None):
    f = f or (3000 + rng.random() * 4000)
    return blip(f, d)


# ------------------------------------------------------------------ hero: one message
place(drone(6.4, (33, 40, 52), 0.14), 0.0, 0.28, 0, 0.5)
place(impact(0.9, 2.2), B["flash"], 0.7, 0, 0.6)
place(pad([76, 83, 88], 1.6, 0.01, 1.4, 6), B["flash"], 0.35, 0, 0.8)  # glass shimmer on the flare
place(whoosh(2.4, 120, 2600, 0.8), B["slabIn"][0], 0.35, 0.2, 0.5)
place(impact(0.5, 1.4), B["slabIn"][1], 0.4, 0, 0.5)
place(impact(0.4, 1.2), B["textOne"][0], 0.3, 0, 0.5)
place(whoosh(1.0, 200, 3000, 0.6), B["title"][0] - 0.2, 0.25, 0, 0.4)
place(riser(1.2, 200, 6000), B["ch"][0] - 1.2, 0.3, 0, 0.3)

# ------------------------------------------------------------------ chapters 01–05: the engine room, 100 BPM
CH = B["ch"]
CHORDS = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 60, 65, 69], [48, 55, 60, 64]]  # Dm Bb F C
ARP = [[74, 77, 81, 86], [70, 74, 77, 82], [77, 81, 84, 89], [72, 76, 79, 84]]
bar = 4 * SPB
for b in range(int((CH[5] - CH[0]) / bar) + 1):
    t0 = CH[0] + b * bar
    if t0 >= CH[5]:
        break
    ch = b % 4
    place(pad(CHORDS[ch], min(bar, CH[5] - t0), 0.8, 1.2, 5), t0, 0.45, 0, 0.55)
    for s in range(8):
        tt = t0 + s * SPB / 2
        if tt >= CH[5] - 0.1:
            break
        place(pluck(ARP[ch][s % 4] + (12 if b % 4 == 3 else 0), 0.18, 0.25), tt, 0.065, (s % 4) / 1.5 - 1, 0.5)
for tb in np.arange(CH[0], CH[5], SPB):
    place(kick(0.7), tb, 0.42, 0, 0.05)
    place(hat(), tb + SPB / 2, 0.08, 0.3, 0.1)
for c in CH[:5]:  # chapter stamp
    place(impact(0.6, 1.4), c + 0.1, 0.45, 0, 0.6)
    place(blip(1760, 0.04), c + 0.12, 0.2, 0, 0.6)

# 01 understand: the words separate through depth, keywords lock
place(whoosh(1.0, 300, 7000, 0.3)[::-1].copy(), B["explode"][0] - 0.6, 0.3, 0, 0.5)
for i, f in enumerate([1568.0, 2093.0]):
    place(ping(f, f * 1.5), B["chips"][0] + i * 0.25, 0.22, -0.3 + i * 0.6, 0.6)
place(whoosh(0.7, 200, 2500, 0.5), B["regroup"][0], 0.2, 0, 0.4)

# 02 recall: the carousel ratchets as each card passes the front
s0, s1 = B["spin"]
prev = None
for k in range(400):
    tt = s0 + (s1 - s0) * k / 399
    ang = -420 * (1 - EASE_OUT(k / 399))
    idx = math.floor(ang / 60)
    if prev is not None and idx != prev:
        place(tick(idx % 2 == 0), tt, 0.32, 0.2 if idx % 2 else -0.2, 0.3)
    prev = idx
place(whoosh(2.0, 300, 4000, 0.25), s0, 0.3, 0, 0.4)
place(impact(0.5, 1.2), B["focus"][0], 0.35, 0, 0.5)
place(ping(1318.5, 1975.5), B["premium"], 0.28, 0.2, 0.6)

# 03 reply: assembled from light
place(whoosh(0.8, 400, 7000, 0.85), B["collapse"][0], 0.3, 0, 0.5)
n_chars = 100
for k in range(n_chars):
    tt = B["chars"][0] + (k / n_chars) * (B["chars"][1] - B["chars"][0] - 0.4) + 0.3
    place(sparkle(0.02), tt, 0.035, (rng.random() - 0.5) * 1.6, 0.6)
place(ping(1568.0, 2349.3), B["sent"], 0.32, 0.2, 0.6)

# 04 qualify
place(ping(1046.5, 1396.9), B["custReply"], 0.26, -0.3, 0.5)
place(whoosh(0.9, 200, 3500, 0.5), B["flip"][0], 0.3, 0.3, 0.4)
for i, tt in enumerate(B["tags"]):
    place(pluck(84 + i * 3, 0.15, 0.4), tt, 0.16, -0.4 + i * 0.4, 0.5)
tt = tax(B["ring"][1] - B["ring"][0])
ring = np.sin(2 * np.pi * np.cumsum(330 + 660 * (tt / tt[-1]) ** 1.5) / SR) * np.clip(tt / 0.2, 0, 1) * np.exp(-np.maximum(tt - tt[-1] + 0.3, 0) / 0.15)
place(ring, B["ring"][0], 0.08, 0, 0.5)
place(ping(1760.0, 2637.0), B["ring"][1], 0.26, 0, 0.7)

# 05 book: tiles cascade, a day lifts, a time is chosen
for r in range(11):
    place(tick(r % 2 == 0) * 0.6, B["calIn"][0] + r * 0.04, 0.12, (r - 5) / 6, 0.3)
place(np.sin(2 * np.pi * np.cumsum(np.linspace(440, 880, int(SR * 0.4))) / SR) * env(int(SR * 0.4), 0.01, 0.18), B["tileLift"], 0.15, 0, 0.5)
for i in range(3):
    place(pluck(79 + i * 2, 0.12, 0.3), B["times"] + i * 0.14, 0.13, -0.5 + i * 0.5, 0.4)
place(tick(True), B["select"], 0.45, 0, 0.3)
place(pad([62, 69, 74, 78], 1.8, 0.01, 1.6, 7), B["confirm"], 0.6, 0, 0.8)
place(ping(1318.5, 1975.5), B["reminder"], 0.2, 0.4, 0.6)

# ------------------------------------------------------------------ scale: every message
place(whoosh(1.6, 120, 2000, 0.6), B["shrink"][0], 0.35, 0, 0.5)
place(pad([50, 57, 62, 65, 69], 4.2, 1.2, 0.6, 6), B["sphere"][0], 0.6, 0, 0.6)
for k in range(70):  # the lime wave washing over the sphere
    tt = B["sphere"][0] + 0.8 + (k / 70) * 2.6
    place(sparkle(0.025, 2600 + k * 40), tt, 0.03, (rng.random() - 0.5) * 1.8, 0.7)
for tb in np.arange(B["sphere"][0], B["implode"][0], SPB / 2):
    place(kick(0.5), tb, 0.25 * (tb - B["sphere"][0]) / 3.7, 0, 0.05)
place(riser(1.8, 150, 9000), B["implode"][1] - 1.8, 0.5, 0, 0.3)

# ------------------------------------------------------------------ logo
place(impact(1.4, 3.2), B["implode"][1], 1.0, 0, 0.7)
place(pad([50, 57, 62, 66, 69, 74], 4.8, 0.02, 2.4, 8), B["implode"][1], 0.85, 0, 0.8)
place(impact(0.4, 1.2), B["tagline"], 0.3, 0, 0.6)
place(ping(1318.5, 1975.5), B["cta"], 0.22, 0, 0.8)

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
