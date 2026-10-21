#!/usr/bin/env python3
"""Compose the Browletto ad's café groove + sound design into public/audio/score.wav.

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




# ------------------------------------------------------------------ Browletto score
SC = TL["scenes"]
HT = TL["hits"]
MA = TL["menuAt"]
BEAT = 60 / TL["bpm"]
B0 = TL["beat0"]
BAR = 4 * BEAT


def bell(m, d=1.2):
    t = tax(d * 2.5)
    f = hz(m)
    y = (np.sin(2 * np.pi * f * t) * np.exp(-t / d) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / (d * 0.4)))
    return y * np.clip(t / 0.003, 0, 1)


def rhodes(notes, d):
    t = tax(d + 0.8)
    y = np.zeros_like(t)
    for k, m in enumerate(notes):
        f = hz(m)
        tine = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25))
        y += tine * np.exp(-t / 1.6) * (1.0 if k else 0.8)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.2 * t)
    rel = np.clip((d + 0.8 - t) / 0.8, 0, 1)
    return y * trem * rel * np.clip(t / 0.004, 0, 1) / len(notes)


def bass(m, d):
    t = tax(d)
    f = hz(m)
    y = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return np.tanh(1.6 * y) * np.exp(-t / (d * 0.9)) * np.clip(t / 0.005, 0, 1)


def snap():
    t = tax(0.18)
    n = fft_band(rng.standard_normal(len(t)), 1200, 7000)
    return n * np.exp(-t / 0.035) * 0.8


def shaker():
    t = tax(0.07)
    return fft_band(rng.standard_normal(len(t)), 5000, 12000) * np.sin(np.pi * np.clip(t / 0.07, 0, 1)) * 0.35


def boom(depth=1.0):
    t = tax(2.5)
    ph = 2 * np.pi * np.cumsum(32 + 60 * np.exp(-t / 0.09)) / SR
    return np.tanh(np.sin(ph) * np.exp(-t / (0.6 * depth)) * 1.3 + fft_band(rng.standard_normal(len(t)), 60, 500) * np.exp(-t / 0.06))


# chords: one per bar, Eb major colours
prog = [
    ([51, 55, 58, 62, 65], 39),  # Ebmaj9
    ([48, 51, 55, 58, 62], 36),  # Cm9
    ([44, 51, 55, 60, 63], 32),  # Abmaj7
    ([46, 53, 56, 60, 63], 34),  # Bb7sus
]
END_MUSIC = SC["end"][0]

# intro pad + riser into the storefront
place(pad([39, 51, 58, 62, 65], 3.4, attack=1.2, release=1.0, harm=5), 0, gain=0.4, verb=0.6)
place(riser(2.6, 150, 5000), SC["reveal"][0] - 2.6, gain=0.12, verb=0.4)
place(boom(0.8), HT["streak"], gain=0.4, verb=0.4)
place(bell(75, 1.6), HT["streak"] + 0.5, gain=0.1, verb=0.8)
place(bell(70, 1.6), HT["ready"], gain=0.12, pan=0.2, verb=0.8)

# groove from the storefront to the end card
nbar = int((END_MUSIC - SC["reveal"][0]) / BAR + 0.999)
for k in range(nbar):
    t0 = SC["reveal"][0] + k * BAR
    notes, root = prog[k % 4]
    place(rhodes(notes, BAR), t0, gain=0.42, verb=0.35)
    hero = SC["hero"][0] <= t0 < SC["hero"][1]
    for bt in range(4):
        tb = t0 + bt * BEAT
        if tb >= END_MUSIC:
            break
        menu = SC["menu"][0] <= tb < SC["menu"][1]
        # kick 1 & 3 (+ the "and" of 3 in the menu), snap 2 & 4
        if bt in (0, 2):
            place(kick(0.8), tb, gain=0.5 if not hero else 0.35)
        if menu and bt == 2:
            place(kick(0.6), tb + BEAT / 2, gain=0.35)
        if bt in (1, 3) and not hero:
            place(snap(), tb, gain=0.28, verb=0.3)
        # swung hats
        for h, off in enumerate((0, BEAT * 0.58)):
            place(hat(), tb + off, gain=(0.16 if h == 0 else 0.1) * (0.6 if hero else 1), pan=0.3)
        if menu:
            for s in range(4):
                place(shaker(), tb + s * BEAT / 4, gain=0.12 if s % 2 else 0.07, pan=-0.35)
        # bass
        if bt in (0, 2) or (menu and bt == 3):
            place(bass(root if bt != 3 else root + 7, BEAT * 1.4), tb, gain=0.42, verb=0.05)

# transitions: whoosh into each cut, soft impact on it
for c in (SC["reveal"][0], SC["inside"][0], SC["menu"][0], SC["hero"][0]):
    place(whoosh(0.5, 300, 5000, 0.85), c - 0.42, gain=0.2, verb=0.25)
    place(boom(0.5), c, gain=0.22, verb=0.3)
for c in MA[1:]:
    place(whoosh(0.3, 600, 6000, 0.8), c - 0.24, gain=0.12)
    place(tick(True), c, gain=0.12)
place(bell(82, 1.4), HT["signSweep"] + 0.2, gain=0.08, verb=0.9)
place(bell(77, 1.4), HT["great"], gain=0.09, verb=0.8)
place(bell(79, 1.4), HT["cravings"], gain=0.08, verb=0.8)

# café ambience: murmur, the odd cup clink, a breath of steam on the coffee
amb = fft_band(rng.standard_normal(N), 180, 1600)
amb *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * np.arange(N) / SR)) * 0.05
ambenv = np.ones(N)
for a, b in ((0, SC["reveal"][0]), (SC["menu"][0], SC["menu"][1]), (SC["end"][0], DUR)):
    ambenv[int(a * SR):int(b * SR)] = 0.25
ambenv = np.convolve(ambenv, np.ones(int(0.4 * SR)) / int(0.4 * SR), mode="same")
place(amb * ambenv, 0, gain=1.0, verb=0.3)
for tt in (4.9, 6.4, 8.2, 10.1, 18.4, 20.3):
    place(blip(2900 + 400 * rnd(tt), 0.05), tt, gain=0.05, pan=0.5 * math.sin(tt * 3), verb=0.6)
    place(blip(4300, 0.05), tt, gain=0.05, pan=0.5 * math.sin(tt * 3), verb=0.6)
place(fft_band(rng.standard_normal(int(1.0 * SR)), 2500, 9000) * np.sin(np.linspace(0, np.pi, int(1.0 * SR))) * 0.06, MA[2] + 0.1, gain=1.0, verb=0.3)

# end card: final chord, logo chime, clean finish
place(boom(1.1), HT["logo"], gain=0.32, verb=0.5)
place(rhodes([39, 51, 55, 58, 62, 65], 3.2), SC["end"][0], gain=0.5, verb=0.6)
place(pad([51, 58, 62, 65, 70], 3.0, attack=0.6, release=0.8, harm=4), SC["end"][0], gain=0.25, verb=0.7)
for i, m in enumerate((70, 74, 77, 82)):
    place(bell(m, 1.8), HT["logo"] + 0.1 + i * 0.07, gain=0.08, pan=-0.3 + 0.2 * i, verb=0.9)
place(bell(75, 2.0), HT["meet"], gain=0.09, verb=0.9)

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
