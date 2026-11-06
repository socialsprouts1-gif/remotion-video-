#!/usr/bin/env python3
"""Tech groove + SFX for the Neuraxine automation reel (voice comes from the clips).

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


# ---- music: modern tech groove in A minor, 118 bpm, low under the voice; lifts in the full-graphic scenes
BEAT = 60 / 118
BAR = 4 * BEAT
chords = [([57, 60, 64], 33), ([53, 57, 60], 29), ([48, 52, 55], 36), ([55, 59, 62], 31)]
arp = [0, 2, 1, 2, 0, 2, 1, 2]
lift = [(0, W[13] - 0.1), (W[62] - 0.1, W[72] - 0.1), (W[102] - 0.1, W[116] - 0.1)]
danger = (W[42] - 0.1, W[72] - 0.1)
nb = int(SPEECH / BAR) + 1
for k in range(nb):
    t0 = k * BAR
    if t0 > SPEECH - 0.2:
        break
    notes, root = chords[k % 4]
    place(pad(notes, BAR + 0.4, attack=0.25, release=0.8, harm=4), t0, gain=0.028, verb=0.5)
    place(pluck(root, 0.45, 0.2), t0, gain=0.08)
    place(pluck(root + 12, 0.25, 0.2), t0 + BEAT * 1.5, gain=0.04)
    place(pluck(root, 0.3, 0.2), t0 + BEAT * 2.5, gain=0.06)
    for s in range(8):
        ts = t0 + s * BEAT / 2
        if ts > SPEECH - 0.2:
            break
        up = any(a <= ts < b for a, b in lift)
        dg = danger[0] <= ts < danger[1]
        note = notes[arp[s]] + (12 if not dg else 0)
        place(pluck(note, 0.12, 0.7), ts, gain=0.018 * (1.5 if up else 1), pan=-0.4 if s % 2 else 0.4, verb=0.35)
        if s % 2 == 0:
            place(kick(0.5), ts, gain=0.055 if up else 0.035)
        else:
            place(hat(), ts, gain=0.03, pan=0.2)
        if s in (2, 6):
            place(fft_band(rng.standard_normal(int(0.12 * SR)), 900, 7000) * np.exp(-tax(0.12) / 0.03), ts, gain=0.035 if up else 0.02)

def pop(t0, g=0.07, upd=True):
    place(bubble(upd), t0, gain=g)
    place(thud(0.08), t0, gain=g * 0.8)

def stamp(t0, g=0.16):
    place(impact(0.8, 1.4), t0, gain=g, verb=0.4)
    place(thud(0.15), t0, gain=0.12)

# intro: hits on 2026 / marketing / enough nahi
place(impact(0.9, 1.6), W[0] - 0.05, gain=0.14, verb=0.4)
place(whoosh(0.3, 600, 8000, 0.85), W[2] - 0.32, gain=0.07)
place(whoosh(0.3, 500, 8000, 0.85), W[7] - 0.35, gain=0.09)
place(impact(0.6, 1.0), W[8] - 0.06, gain=0.1)
place(glitch(0.22), W[10] - 0.04, gain=0.06)
stamp(W[11] - 0.05, 0.12)
# into the split
place(whoosh(0.35, 6000, 500, 0.5), W[13] - 0.4, gain=0.08)
place(whoosh(0.3, 500, 7000, 0.8), W[16] - 0.35, gain=0.07, pan=-0.4)
pop(W[17] - 0.06, 0.06)
for i in range(6):
    place(blip(1300 + i * 120, 0.03), W[21] - 0.08 + i * 0.06, gain=0.03)
for i in range(8):
    place(blip(900 + i * 90, 0.03), W[26] - 0.1 + i * 0.12, gain=0.03, pan=(i / 4 - 1))
# something missing
place(whoosh(0.3, 5000, 700, 0.6), W[34] - 0.3, gain=0.06)
pop(W[37] - 0.06, 0.07)
pop(W[38] - 0.06, 0.06, False)
# the inbox
place(whoosh(0.35, 500, 7000, 0.8), W[42] - 0.4, gain=0.08)
for i in (43, 45, 47):
    place(ping(1400, 1100), W[i] - 0.05, gain=0.035)
place(ding(), W[55] - 0.06, gain=0.04)
t = W[57] - 0.05
while t < W[59] + 0.2:
    place(tick(), t, gain=0.025)
    t += 0.05
stamp(W[60] - 0.06, 0.18)
# customers lost
place(whoosh(0.4, 6000, 400, 0.5), W[62] - 0.4, gain=0.07)
for i in range(24):
    place(blip(1100 - (i % 6) * 60, 0.03), W[62] + 0.15 + i * 0.025, gain=0.02)
place(riser(0.9, 300, 4000), W[68] - 1.0, gain=0.04)
stamp(W[68] - 0.08, 0.2)
for i in range(10):
    place(bubble(False), W[68] + 0.1 + i * 0.12, gain=0.03, pan=rnd(i) * 2 - 1)
# marketing + automation
place(whoosh(0.35, 500, 7000, 0.8), W[72] - 0.4, gain=0.08)
pop(W[73] - 0.08, 0.07)
place(thud(0.1), W[75] - 0.08, gain=0.08)
place(impact(0.6, 1.2), W[78] - 0.08, gain=0.1, verb=0.4)
place(bell(81, 0.5), W[81] - 0.05, gain=0.04, verb=0.5)
# AI agent steps
for n, i in enumerate((84, 90, 94, 98)):
    place(whoosh(0.22, 600, 7000, 0.85), W[i] - 0.3, gain=0.06, pan=0.3)
    place(bell(76 + [0, 3, 7, 10][n], 0.35), W[i] - 0.08, gain=0.04, verb=0.5)
    place(ding(), W[i] + 0.25, gain=0.03)
# the truth
place(whoosh(0.4, 6000, 500, 0.5), W[102] - 0.4, gain=0.07)
place(impact(0.7, 1.2), W[106] - 0.08, gain=0.12)
place(riser(1.2, 200, 6000), W[113] - 1.2, gain=0.05)
place(impact(1.0, 2.0), W[113] - 0.08, gain=0.2, verb=0.5)
for i in range(4):
    pop(W[113] + 0.1 + i * 0.08, 0.04)
# DM + guide
place(whoosh(0.35, 500, 7000, 0.8), W[116] - 0.4, gain=0.07)
for i in range(8):
    place(keyclick(), W[122] - 0.05 + i * 0.06, gain=0.06)
place(ping(1500, 1900), W[124] - 0.06, gain=0.05)
pop(W[130] - 0.08, 0.06)
# follow
place(impact(0.6, 1.2), W[135] - 0.1, gain=0.1, verb=0.4)
place(ding(), W[137] - 0.05, gain=0.06)
place(impact(0.8, 2.4), SPEECH, gain=0.15, verb=0.5)
place(pad([57, 64, 69, 72], TL["endCard"], attack=0.05, release=1.0, harm=4), SPEECH, gain=0.05, verb=0.7)

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
