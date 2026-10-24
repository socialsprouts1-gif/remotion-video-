#!/usr/bin/env python3
"""Music bed + sound effects for the talking-head short (voice comes from the clips).

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
FF = TL["ff"]
SPEECH = TL["speech"]
W = {w["i"]: w["s"] for w in TL["words"]}
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


# ---- music: dark pulse under the problem, lifts to major on the Neura Chat reveal
REV = W[152] - 0.1
BEAT = 60 / 92
BAR = 4 * BEAT
minor = [([45, 52, 57, 60], 33), ([41, 48, 57, 60], 29), ([43, 50, 55, 58], 31), ([40, 47, 55, 59], 28)]
major = [([57, 61, 64, 68], 45), ([54, 57, 61, 64], 42), ([50, 54, 57, 62], 38), ([52, 56, 59, 64], 40)]
place(drone(REV + 0.5, notes=(33, 40), air=0.12), 0, gain=0.22, verb=0.3)
nb = int(SPEECH / BAR) + 1
for k in range(nb):
    t0 = k * BAR
    sol = t0 >= REV - 0.01
    notes, root = (major if sol else minor)[k % 4]
    place(ep(notes, BAR), t0, gain=0.05 if not sol else 0.07, verb=0.5)
    for bt in range(4):
        tb = t0 + bt * BEAT
        if tb > SPEECH - 0.2:
            break
        if bt in (0, 2) and t0 > 1.5:
            place(kick(0.55), tb, gain=0.07)
            place(pluck(root, 0.32, 0.1), tb, gain=0.05)
        if sol and bt in (1, 3):
            place(hat() * 2, tb, gain=0.025, pan=-0.2)
        place(hat(), tb + BEAT * 0.5, gain=0.016, pan=0.3)

# ---- opening + reveal
place(impact(1.2, 2.2), 0.02, gain=0.32, verb=0.4)
place(whoosh(0.5, 300, 6000, 0.9), 0.0, gain=0.12)
place(riser(1.6, 200, 6000), REV - 1.4, gain=0.12, verb=0.4)
place(impact(1.3, 2.6), REV, gain=0.4, verb=0.5)
place(pad([57, 64, 69, 73, 76], 2.4, attack=0.05, release=1.0, harm=4), REV, gain=0.2, verb=0.7)
for i, m in enumerate((81, 85, 88)):
    place(bell(m, 1.0), REV + 0.25 + i * 0.08, gain=0.06, verb=0.8)

# ---- transitions in / out of every full-frame scene
for i, f in enumerate(FF):
    prev = FF[i - 1] if i else None
    joined = prev and abs(prev["b"] - f["a"]) < 0.06
    if f["scene"] == "reveal":
        continue
    place(whoosh(0.4 if not joined else 0.3, 400, 6000, 0.85), f["a"] - (0.3 if not joined else 0.22), gain=0.16 if not joined else 0.11, verb=0.25)
    if not joined:
        place(thud(0.12), f["a"], gain=0.15)
    nxt = FF[i + 1] if i + 1 < len(FF) else None
    if not nxt or abs(nxt["a"] - f["b"]) > 0.06:
        place(whoosh(0.35, 400, 5000, 0.7), f["b"] - 0.22, gain=0.11, verb=0.25)
    if f["scene"] == "flatline":
        place(glitch(), f["a"] - 0.04, gain=0.08)

# ---- slams and zoom punches on the speaker
for s in TL["slam"]:
    place(impact(0.7, 1.3), s["t"], gain=0.17 if s["tone"] != "bad" else 0.2, verb=0.35)
    place(whoosh(0.28, 900, 8000, 0.9), s["t"] - 0.22, gain=0.08)

# ---- scene sound
for f in FF:
    a, b, sc = f["a"], f["b"], f["scene"]
    if sc == "adspend":
        for k in range(18):
            place(tick(k % 2 == 0), a + 0.25 + k * 0.13 + 0.7, gain=0.05, pan=-0.4 + 0.045 * k)
        for wi in (27, 31, 35):
            place(bubble(), W[wi], gain=0.15)
            place(ding(), W[wi] + 0.04, gain=0.05)
    if sc == "flatline":
        place(riser(b - a, 300, 3000) * 0.6, a, gain=0.06)
        place(err() if "err" in dir() else thud(0.2), W[43], gain=0.15)
    if sc == "convert":
        for k in range(6):
            place(bubble(), W[71] + k * 0.12, gain=0.09, pan=-0.3 + 0.12 * k)
    if sc == "story":
        place(bubble(), W[79], gain=0.16)
        for k in range(6):
            place(tick(k % 2 == 0), W[82] + k * 0.08, gain=0.07)
        place(bubble(False), W[82] + 0.35, gain=0.14)
        place(thud(0.1), W[86] + 0.5, gain=0.14)
        place(whoosh(0.8, 300, 2500, 0.6), W[91], gain=0.12)
    if sc == "whatsapp":
        for k in range(12):
            place(bubble(k % 2 == 0), a + k * 0.06, gain=0.05, pan=-0.5 + k * 0.08)
        place(impact(0.6, 1.2), W[123] - 0.1, gain=0.18)
    if sc == "features":
        for wi in (157, 159, 161, 164):
            place(whoosh(0.3, 600, 7000, 0.8), W[wi] - 0.28, gain=0.1)
            place(ding(), W[wi], gain=0.06, verb=0.4)
        place(impact(0.9, 1.6), W[166] - 0.1, gain=0.22, verb=0.4)

# ---- call to action
C = {c["kind"]: c["t"] for c in TL["cta"]}
place(bubble(), C["link"], gain=0.14)
for k in range(4):
    place(keyclick(), C["comment"] + 0.15 + k * 0.09, gain=0.08)
place(bubble(False), C["comment"] + 0.6, gain=0.14)
place(whoosh(0.5, 800, 6000, 0.8), C["dm"] + 0.4, gain=0.11)
place(bell(84, 0.4), C["dm"] + 0.05, gain=0.06)
place(keyclick(), C["follow"] + 0.5, gain=0.12)
place(ding(), C["follow"] + 0.6, gain=0.08)

# ---- end card
place(impact(1.2, 2.2), SPEECH, gain=0.32, verb=0.45)
place(pad([45, 57, 61, 64, 68, 73], TL["endCard"], attack=0.15, release=0.8, harm=4), SPEECH, gain=0.26, verb=0.6)
for i, m in enumerate((76, 80, 83, 88)):
    place(bell(m, 1.0), SPEECH + 0.4 + i * 0.08, gain=0.06, verb=0.8)

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
