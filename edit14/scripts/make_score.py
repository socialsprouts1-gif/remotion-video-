#!/usr/bin/env python3
"""Music bed + interface sounds for the Neuraxine "automate" editorial cut (the voice is a separate track).

Everything is synthesised (no samples, no licences). Every cue time comes from src/edit.json,
the same file the picture reads, so each sound lands on the frame its overlay starts.

    python3 scripts/make_score.py
"""
import json
import math
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
TL = json.load(open(os.path.join(ROOT, "src", "edit.json")))
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






# ------------------------------------------------------------------ premium cut: bed + sound design
SPEECH = TL["speech"]
W = {w["i"]: w["s"] for w in TL["words"]}
WE = {w["i"]: w["e"] for w in TL["words"]}
Q = TL["cues"]
QW = TL["cueWord"]
BEAT = 60 / 96
BAR = 4 * BEAT


def bell(m, d=0.8):
    t = tax(d * 2.5)
    f = hz(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / d) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / (d * 0.4))) * np.clip(t / 0.003, 0, 1)


def ep(notes, d):
    t = tax(d + 0.6)
    y = sum(np.sin(2 * np.pi * hz(m) * t + 0.7 * np.sin(2 * np.pi * hz(m) * t) * np.exp(-t / 0.2)) for m in notes)
    return y * np.exp(-t / 1.8) * np.clip((d + 0.6 - t) / 0.6, 0, 1) * np.clip(t / 0.005, 0, 1) / len(notes)


def bubble(up=True):
    t = tax(0.12)
    f = (700 + 900 * (t / 0.12)) if up else (1500 - 700 * (t / 0.12))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)


def thud(d=0.18):
    t = tax(0.8)
    ph = 2 * np.pi * np.cumsum(50 + 90 * np.exp(-t / 0.04)) / SR
    return np.tanh(np.sin(ph) * np.exp(-t / d) * 1.5)


def ding():
    return bell(88, 0.25) + 0.6 * bell(95, 0.25)


def keyclick():
    t = tax(0.03)
    return fft_band(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t / 0.006)


def glitch(d=0.2):
    t = tax(d)
    x = rng.standard_normal(len(t))
    x = np.repeat(x[::22], 22)[: len(t)]
    return np.round(x * 3) / 3 * (np.sin(2 * np.pi * 31 * t) > 0) * np.exp(-t / (d / 2.5))


# ---- music: warm, unhurried bed (100 bpm). Thins out under the busywork, lifts on "But what if", full under the brand.
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [60, 64, 67, 71], [55, 59, 62, 67]]
ROOT_ = [45, 41, 48, 43]
lift = Q["but"]
k = 0
t0 = 0.0
while t0 < SPEECH:
    notes = CH[k % 4]
    busy = Q["karte"] - 0.2 <= t0 < lift - 0.1
    gap = lift - 1.2 <= t0 < lift          # drop out before the turn
    if not gap:
        place(ep(notes, BAR), t0, gain=0.024, verb=0.45)
        place(pluck(ROOT_[k % 4] - 12 + 24, 0.5, 0.05), t0, gain=0.03)
    for bt in range(4):
        tb = t0 + bt * BEAT
        if tb >= SPEECH - 0.1 or gap:
            continue
        place(kick(0.35), tb, gain=0.02 if not busy else 0.014)
        place(hat() * 0.8, tb + BEAT / 2, gain=0.008, pan=0.25)
        place(hat() * 0.5, tb + BEAT * 0.75, gain=0.005, pan=-0.25)
    t0 += BAR
    k += 1
place(riser(1.1, 300, 6000), lift - 1.1, gain=0.035)
place(impact(0.5, 1.4), lift - 0.02, gain=0.05, verb=0.5)

# ---- interface sounds (quiet; each on the frame its element appears)
def soft_tick(f=1800):
    tt = tax(0.06)
    return np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.012)
place(whoosh(0.4, 400, 6000, 0.7), Q["y2026"], gain=0.03)
for d in range(4):
    place(soft_tick(1400 + 120 * d), Q["y2026"] + 0.06 * d + 0.5, gain=0.02)
for n in ("leads", "whatsapp", "followups", "appointments"):
    place(soft_tick(1600), Q[n] - 0.08, gain=0.03, pan=0.2)
for d in range(4):                                         # AI flips the tasks, one by one
    place(pluck(84 + [0, 4, 7, 12][d], 0.2, 0.2), Q["ai"] - 0.1 + d * 0.18, gain=0.022, pan=-0.2 + 0.13 * d)
place(whoosh(0.5, 2000, 9000, 0.5), Q["ai"] - 0.15, gain=0.018)
for n in ("agents", "automated", "custom", "according"):
    place(blip(1100, 0.05), Q[n] - 0.08, gain=0.018)
place(bell(81, 0.6) + 0.5 * bell(88, 0.6), Q["brand"] - 0.2, gain=0.03, verb=0.5)
for n in ("save", "reduce", "scale"):
    place(soft_tick(1500), Q[n] - 0.08, gain=0.025)
ty0, ty1 = Q["automate"], WE[QW["automate"]]
for d in range(8):
    place(keyclick(), ty0 + max(0.35, ty1 - ty0) * d / 8, gain=0.035)
place(ping(1568, 2093), Q["dm"] - 0.1, gain=0.035, verb=0.2)
place(blip(1300, 0.03), Q["follow"] + 0.05, gain=0.025)
place(pad([57, 64, 69, 72], TL["endCard"], attack=0.3, release=0.6, harm=4), SPEECH, gain=0.1, verb=0.6)

# ---- editorial cuts: a soft hit + paper swish on every hard cut into a card, ticks on hub nodes and chain links
for wi in (18, 49, 64, 89):
    place(thud(0.12), W[wi] - 0.02, gain=0.05)
    place(whoosh(0.3, 1500, 9000, 0.4), W[wi] - 0.12, gain=0.025)
for k in range(5):
    place(blip(900 + 120 * k, 0.04), W[68] - 0.1 + k * 0.14 + 0.2, gain=0.015, pan=-0.4 + 0.2 * k)
for k in range(4):
    place(soft_tick(1300 + 150 * k), W[73] + k * 0.22, gain=0.02)
place(whoosh(0.5, 300, 4000, 0.8), W[59] - 0.2, gain=0.02)      # the red strike

# ---- a soft swish in and out of every cut bridge (work/cuts.json)
CUTS = json.load(open(os.path.join(ROOT, "work", "cuts.json")))
for k, c in enumerate(CUTS):
    place(whoosh(0.28, 900, 8000, 0.6), c - 0.4, gain=0.03, pan=-0.3 if k % 2 else 0.3)
    place(whoosh(0.25, 700, 6000, 0.4), c + 0.18, gain=0.018, pan=0.3 if k % 2 else -0.3)

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
mix *= 0.5 / max(1e-9, np.max(np.abs(mix)))
fo = int(0.9 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5

out = os.path.join(ROOT, "public", "audio", "score.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
print(f"wrote {os.path.relpath(out, ROOT)}  {DUR}s")
