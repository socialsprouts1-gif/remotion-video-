#!/usr/bin/env python3
"""Compose the film's score + sound design into public/audio/score.wav.

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


# ------------------------------------------------------------------ 1 · darkness, a lead, ad spend
place(drone(8.4, (33, 40), 0.18), 0.0, 0.32, 0, 0.4)  # releases into the silence
place(drone(1.6, (33, 40), 0.1), 9.4, 0.25, 0, 0.4)
place(impact(0.6, 1.6) * 0.5, B["leadAppear"], 0.5, 0, 0.5)  # first light
place(ping(880, 1318.5) * 0.5, B["leadAppear"] + 0.05, 0.35, 0, 0.6)
for k in range(28):  # data packets around the travelling lead
    tt = B["leadTravel"][0] + rnd(k * 3.1) * (B["leadTravel"][1] - B["leadTravel"][0])
    place(blip(2200 + rnd(k) * 2400, 0.025), tt, 0.08, rnd(k * 7) * 1.6 - 0.8, 0.5)
for k, tt in enumerate(np.arange(0.9, 5.6, 1.15)):  # heartbeat
    place(kick(0.6), tt, 0.35, 0, 0.1)
place(whoosh(1.2, 200, 2600, 0.5), 1.3, 0.18, -0.3, 0.4)
place(np.sin(2 * np.pi * np.cumsum(np.linspace(520, 1040, int(SR * 0.35))) / SR) * env(int(SR * 0.35), 0.01, 0.15), B["rupeeAppear"] + 0.35, 0.18, -0.4, 0.5)  # tether connects

# ------------------------------------------------------------------ 2 · the message, then silence
for k in range(6):
    place(tick(k % 2 == 0) * 0.5, B["typing"][0] + k * 0.13, 0.12, 0.2, 0.2)
place(ping(1046.5, 1568.0), B["message"], 0.42, 0.1, 0.5)
place(whoosh(0.9, 300, 3800, 0.75), B["dive"][0], 0.35, 0, 0.3)
place(impact(0.5, 1.2), B["clockIn"], 0.45, 0, 0.3)

# ------------------------------------------------------------------ 3 · time kills the lead
ticks = []
tt = B["clockKeys"][0][0]
iv = 0.5
while tt < B["clockKeys"][-1][0]:
    ticks.append(tt)
    p = (tt - 10.8) / (15.0 - 10.8)
    iv = 0.5 * (0.06 / 0.5) ** p
    tt += iv
for k, tt in enumerate(ticks):
    place(tick(k % 2 == 0), tt, 0.22 + 0.1 * (tt - 10.8) / 4.2, 0.15 if k % 2 else -0.15, 0.15)
for tt in np.arange(15.0, 16.3, 0.5):
    place(tick(True), tt, 0.25, 0, 0.3)
place(impact(0.7, 1.5), 15.0, 0.5, 0, 0.4)
d = 16.45 - 10.9
t = tax(d)
x = t / d
tension = sum(np.sin(2 * np.pi * hz(33) * h * (1 + 0.003 * h) * t) / h for h in range(1, 9) if h <= 2 + int(6 * 1))
tension = tension * (0.15 + 0.85 * x ** 2) * np.clip(t / 1.0, 0, 1)
place(fft_band(tension, 30, 1800) * 0.35, 10.9, 1.0, 0, 0.2)
beats = []
tb = 11.0
while tb < 16.4:
    beats.append(tb)
    tb += 0.9 - 0.55 * (tb - 11) / 5.4
for tb in beats:
    place(kick(0.7), tb, 0.45, 0, 0.1)

# ------------------------------------------------------------------ 4 · snap, competitor, LEAD LOST
place(glitch(0.3), B["snap"], 0.5, 0, 0.3)
place(blip(3200, 0.02), B["snap"], 0.4, 0, 0.6)
place(whoosh(1.2, 200, 3000, 0.4), B["toCompetitor"][0], 0.3, 0.6, 0.4)
place(np.sin(2 * np.pi * np.cumsum(np.linspace(700, 1400, int(SR * 0.4))) / SR) * env(int(SR * 0.4), 0.01, 0.18), B["competitorLink"], 0.12, 0.7, 0.5)
place(impact(1.4, 3.0), B["lostText"][0] + 0.1, 0.95, 0, 0.6)
place(drone(3.2, (28, 35), 0.1), B["lostText"][0] + 0.1, 0.35, 0, 0.5)
place(whoosh(1.0, 400, 6000, 0.35)[::-1].copy(), B["lostPull"] - 0.3, 0.4, 0.5, 0.4)

# ------------------------------------------------------------------ 5 · a hundred leads
for i in range(100):
    ts = B["streams"][0] + i * 0.048 + rnd(i * 9.1) * 0.06
    conv = rnd(i * 7.7) > 0.42
    brk = 0.42 + rnd(i * 5.5) * 0.32
    if conv:
        place(pluck([74, 77, 81, 84, 86, 89][i % 6], 0.2, 0.2), ts + 1.5, 0.07, rnd(i) - 0.5, 0.5)
    else:
        place(glitch(0.08), ts + 1.5 * brk, 0.08, rnd(i * 2) - 0.5, 0.2)
        tt = tax(0.5)
        place(np.sin(2 * np.pi * np.cumsum(500 * np.exp(-tt / 0.15) + 60) / SR) * np.exp(-tt / 0.18), ts + 1.5 * brk + 0.05, 0.05, rnd(i * 2) - 0.5, 0.3)
for tb in np.arange(21.6, 27.0, 0.5):
    place(kick(0.6), tb, 0.38, 0, 0.1)
place(pad([50, 57, 62], 5.6, 1.5, 1.2, 4), 21.6, 0.5, 0, 0.5)
place(whoosh(1.4, 150, 2200, 0.6), 21.0, 0.3, -0.2, 0.4)

# ------------------------------------------------------------------ 6 · it multiplies, then freeze
for k in range(60):
    p = k / 60
    tt = B["chaos"][0] + (p ** 0.7) * 2.95
    f1 = 900 + rnd(k * 1.7) * 900
    place(ping(f1, f1 * 1.5), tt, 0.06 + 0.06 * p, rnd(k * 3) * 1.8 - 0.9, 0.3)
place(riser(3.0, 150, 5000), B["chaos"][0], 0.35, 0, 0.3)
for tb in np.arange(27.0, 30.0, 0.25):
    place(kick(0.4), tb, 0.3 * (tb - 26.5) / 3.5, 0, 0.05)
# freeze: everything stops on the frame
i_f = int(B["freeze"] * SR)
fade = int(0.012 * SR)
dry[i_f - fade : i_f] *= np.linspace(1, 0, fade)[:, None]
send[i_f - fade : i_f] *= np.linspace(1, 0, fade)[:, None]
dry[i_f:] = 0
send[i_f:] = 0
place(drone(2.8, (26, 33), 0.05), B["freeze"], 0.22, 0, 0.6)
place(impact(0.5, 1.4), B["textNoLack"], 0.35, 0, 0.6)
place(impact(0.6, 1.6), B["textSpeed"], 0.4, 0, 0.6)

# ------------------------------------------------------------------ 7 · the AI layer
place(riser(1.2, 200, 9000), B["aiBloom"] - 1.2, 0.5, 0, 0.3)
place(impact(1.2, 3.0), B["aiBloom"], 0.9, 0, 0.6)
bloom = pad([62, 69, 74, 78], 2.5, 0.05, 2.0, 7)
place(bloom, B["aiBloom"], 0.9, 0, 0.8)

SPB = 60 / B["bpm"]
CHORDS = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 60, 65, 69], [48, 55, 60, 64]]  # Dm Bb F C
ARP = [[62, 65, 69, 74], [58, 62, 65, 70], [65, 69, 72, 77], [60, 64, 67, 72]]
g0 = B["aiBloom"] + 0.4
bar = 4 * SPB
for b in range(int((44.4 - g0) / bar) + 1):
    t0 = g0 + b * bar
    ch = b % 4
    place(pad(CHORDS[ch], bar, 0.6, 1.2, 5), t0, 0.55, 0, 0.5)
    for s in range(8):
        tt = t0 + s * SPB / 2
        if tt > 44.3:
            break
        place(pluck(ARP[ch][s % 4] + (12 if s >= 4 and b >= 2 else 0), 0.22, 0.35), tt, 0.11, (s % 4) / 1.5 - 1, 0.45)
for k, tb in enumerate(np.arange(g0, 41.2, SPB)):
    place(kick(0.8), tb, 0.55, 0, 0.05)
    place(hat(), tb + SPB / 2, 0.12, 0.3, 0.1)
for i in range(6):  # pipeline stages lock in
    place(blip(1760 * (1 + i * 0.06), 0.03), B["pipeline"][0] + i * 0.42, 0.18, 0, 0.4)
for k in range(16):  # routed packets landing in their lanes
    place(blip(2637, 0.03), B["laneStart"] + k * B["laneBeat"] + 1.3, 0.12, (k % 4) / 1.5 - 1, 0.4)

# ------------------------------------------------------------------ final · ecosystem, line, lockup
place(whoosh(2.4, 120, 2400, 0.7), B["ecosystem"][0] - 0.2, 0.35, 0, 0.5)
place(pad([50, 57, 62, 66, 69], 3.0, 1.0, 1.0, 6), B["ecosystem"][0], 0.6, 0, 0.6)
tt = tax(1.0)
line = np.sin(2 * np.pi * np.cumsum(220 + 1540 * (1 - np.exp(-tt / 0.25))) / SR) * env(len(tt), 0.3, 0.5)
place(line, B["converge"][0], 0.18, 0, 0.7)
place(whoosh(0.9, 300, 5000, 0.8), B["converge"][0], 0.35, 0, 0.4)
place(impact(0.8, 2.0), B["converge"][1], 0.6, 0, 0.6)
place(pad([50, 57, 62, 66], 6.2, 1.5, 2.0, 4), B["converge"][1], 0.45, 0, 0.6)
for tb in np.arange(44.5, 47.8, SPB * 2):
    place(kick(0.5), tb, 0.3, 0, 0.1)
place(impact(0.4, 1.2), B["textStart"], 0.25, 0, 0.5)
place(impact(0.5, 1.2), B["textConvert"], 0.3, 0, 0.5)
place(riser(0.9, 300, 8000), B["final"] - 0.9, 0.35, 0, 0.3)
place(impact(1.3, 3.0), B["final"], 0.95, 0, 0.7)
place(pad([50, 57, 62, 66, 69, 74], 1.8, 0.02, 1.6, 8), B["final"], 0.85, 0, 0.8)
place(ping(1318.5, 1975.5), B["final"] + 0.95, 0.2, 0, 0.8)

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
