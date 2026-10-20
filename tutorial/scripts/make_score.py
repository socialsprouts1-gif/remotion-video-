#!/usr/bin/env python3
"""Compose the tutorial's music bed + UI sound design + sound design into public/audio/score.wav.

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
TL = json.load(open(os.path.join(ROOT, "src", "tutorial.json")))
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


# ------------------------------------------------------------------ a calm bed that never competes with a voice
BPM = 92
SPB = 60 / BPM
bar = 4 * SPB
CHORDS = [[50, 57, 62, 65], [46, 53, 58, 65], [53, 57, 60, 65], [48, 55, 60, 64]]  # Dm Bb F C
ARP = [[74, 69, 77, 72], [70, 65, 74, 77], [72, 69, 77, 81], [72, 67, 76, 79]]
t0 = TL["intro"][0] + 0.4
end = TL["outro"][1] - 1.5
b = 0
while t0 + b * bar < end:
    tb = t0 + b * bar
    ch = b % 4
    place(pad(CHORDS[ch], bar, 1.0, 1.5, 4), tb, 0.42, 0, 0.5)
    for s in range(8):
        tt = tb + s * SPB / 2
        if tt > end or (s % 2 and b % 2):
            continue
        place(pluck(ARP[ch][s % 4], 0.22, 0.15), tt, 0.045, (s % 4) / 1.5 - 1, 0.6)
    # a light pulse from the first chapter to the outro
    if TL["chapters"][0]["at"] <= tb < TL["outro"][0]:
        for q in range(4):
            place(kick(0.45), tb + q * SPB, 0.16, 0, 0.05)
            place(hat(), tb + q * SPB + SPB / 2, 0.035, 0.3, 0.1)
    b += 1

# ------------------------------------------------------------------ intro + outro
place(impact(0.9, 2.2), 0.3, 0.55, 0, 0.6)
place(pad([62, 69, 74, 78], 2.2, 0.02, 1.8, 7), 0.3, 0.35, 0, 0.8)
for i in range(5):
    place(blip(1568 * 2 ** (i / 12 * 2), 0.03), 5.4 + i * 0.35, 0.12, 0, 0.5)
o0 = TL["outro"][0]
place(whoosh(1.2, 200, 3000, 0.6), o0 - 0.3, 0.3, 0, 0.4)
for i in range(5):
    place(ping(1318.5 * 2 ** (i / 12 * 2), 1975.5 * 2 ** (i / 12 * 2)), o0 + 1.2 + i * 0.3, 0.14, 0, 0.5)
place(impact(1.0, 2.6), o0 + 3.0, 0.6, 0, 0.7)
place(pad([62, 69, 74, 78, 81], 6.0, 0.05, 2.5, 7), o0 + 3.0, 0.45, 0, 0.8)

# ------------------------------------------------------------------ chapter cards
for c in TL["chapters"]:
    place(whoosh(0.9, 200, 3500, 0.55), c["at"] - 0.25, 0.32, 0, 0.4)
    place(impact(0.6, 1.4), c["at"] + 0.2, 0.42, 0, 0.6)
place(whoosh(1.2, 200, 2600, 0.6), TL["intro"][1] - 0.2, 0.3, 0, 0.4)

# ------------------------------------------------------------------ shots: highlights tick, cursor clicks click
for s in TL["shots"]:
    place(whoosh(0.5, 400, 5000, 0.5), s["start"] - 0.1, 0.12, 0, 0.3)
    for st in s["steps"]:
        if st.get("hl"):
            place(blip(2093.0, 0.025), s["start"] + st["t"] + 0.3, 0.1, 0, 0.4)
        if "click" in st:
            place(tick(True), s["start"] + st["click"], 0.42, 0, 0.25)
            place(blip(3136, 0.015), s["start"] + st["click"], 0.15, 0, 0.3)

# ------------------------------------------------------------------ verification graphic
V = TL["verify"]
for i in range(6):
    place(tick(i % 2 == 0), V["at"] + 0.3 + i * 0.18, 0.18, (i - 2.5) / 4, 0.3)
for st in V["steps"][1:]:
    place(ping(1568.0, 2349.3), V["at"] + st["t"], 0.16, 0, 0.5)
conn = next(s for s in TL["shots"] if s["id"] == "connected")
place(pad([62, 69, 74, 78], 2.0, 0.02, 1.6, 7), conn["start"] + 0.3, 0.4, 0, 0.8)
place(ping(1760.0, 2637.0), conn["start"] + 0.5, 0.25, 0, 0.6)

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
