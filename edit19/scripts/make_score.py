#!/usr/bin/env python3
"""Synthesised music bed + SFX, timed from src/edit.json (same cue words the picture uses),
then mixed with the voice-over and normalised to -14 LUFS -> public/audio/mix.wav.
    python3 scripts/make_score.py"""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import lfilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
E = json.load(open(f"{ROOT}/src/edit.json"))
SR, DUR = 44100, E["duration"]
N = int(SR * DUR)
rng = np.random.default_rng(7)
lines = {}
for w in E["words"]:
    lines.setdefault(w["line"], []).append(w)
W = lambda l, k: lines[l][k]["s"]
WE = lambda l, k: lines[l][k]["e"]
L = E["lines"]
END_AT = WE(8, 31) + 0.6

mus = np.zeros(N)
sfx = np.zeros(N)
tx = lambda d: np.arange(int(SR * d)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x)
def put(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N: return
    n = min(len(sig), N - i); buf[i:i + n] += sig[:n] * g

# ---- music: 100 bpm, Am - F - C - G, soft pad + pluck arp + kick/hat ------------
BPM = 104; beat = 60 / BPM; bar = beat * 4
prog = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]
t = 0.0; b = 0
while t < DUR:
    ch = prog[b % 4]
    d = tx(bar + 0.6)
    env = np.minimum(1, d / 0.4) * np.exp(-np.maximum(0, d - bar) * 6)
    pad = sum(np.sin(2 * np.pi * hz(m) * d * (1 + dt)) for m in ch for dt in (-0.003, 0.003))
    put(mus, lp(pad, 1200) * env * 0.05, t)
    put(mus, np.sin(2 * np.pi * hz(ch[0] - 24) * d) * env * 0.09, t)  # bass
    for i in range(8):  # arp
        m = ch[i % 3] + 12 * (1 + (i // 3) % 2)
        dd = tx(0.5)
        put(mus, np.sin(2 * np.pi * hz(m) * dd) * np.exp(-dd * 9) * 0.035, t + i * beat / 2)
    for k in range(4):  # kick on every beat, hat on offbeats
        dd = tx(0.35)
        kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-dd * 25)) * dd) * np.exp(-dd * 9)
        put(mus, kick * (0.24 if k % 2 == 0 else 0.15), t + k * beat)
        hat = np.diff(rng.standard_normal(int(SR * 0.05)), prepend=0) * np.exp(-tx(0.05) * 70)
        put(mus, hat * 0.03, t + k * beat + beat / 2)
    t += bar; b += 1
# fade in/out
mus *= np.minimum(1, np.arange(N) / (SR * 1.0)) * np.minimum(1, (N - np.arange(N)) / (SR * 1.5))
# duck under the voice
venv = np.repeat(np.array(E["env"] + [0] * int((DUR - E["speech"]) * 30 + 2)), SR // 30)[:N]
venv = lp(np.pad(venv, (0, N - len(venv))), 4)
mus *= 1 - 0.45 * np.clip(venv * 1.5, 0, 1)
# lift for the end card
mus *= 1 + 0.6 * np.clip((np.arange(N) / SR - END_AT) / 0.4, 0, 1)

# ---- sfx -------------------------------------------------------------------
def whoosh(d=0.55):
    x = rng.standard_normal(int(SR * d)); tt = tx(d)
    env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2
    return lp(x, 2500) * env
def pop(f=900):
    tt = tx(0.12)
    return np.sin(2 * np.pi * f * tt * (1 + 0.6 * np.exp(-tt * 40))) * np.exp(-tt * 38)
def thump():
    tt = tx(0.4)
    return np.sin(2 * np.pi * (60 + 120 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 10) + lp(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 25) * 0.6
def tick():
    tt = tx(0.05)
    return np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 120)
def chime():
    tt = tx(0.9)
    return sum(np.sin(2 * np.pi * hz(m) * tt) for m in (76, 79, 84)) * np.exp(-tt * 4) / 3

def blip(f=1000, d=0.09):
    tt = tx(d); return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 30)
def flick(d=0.25):
    x = rng.standard_normal(int(SR * d)); tt = tx(d)
    return (lp(x, 6000) - lp(x, 1200)) * np.exp(-((tt - 0.06) / 0.05) ** 2)
CL = [0, 2, 3, 4, 5, 6, 7, 8]
def clink(f=2600, d=0.25):
    tt = tx(d); return (np.sin(2 * np.pi * f * tt) + 0.6 * np.sin(2 * np.pi * f * 1.48 * tt)) * np.exp(-tt * 18)
for k in range(1, 8):
    s0 = L[CL[k]] - 0.45
    put(sfx, whoosh(0.6), s0, 0.4)
    put(sfx, clink(), s0 + 0.7, 0.22)                       # hanger settles on the rail
    if k <= 5: put(sfx, clink(3100), s0 + 0.75, 0.18)       # garment appears on the top rail
put(sfx, whoosh(0.7), END_AT - 0.1, 0.4)
for i in range(12): put(sfx, pop(500 + 40 * i), 0.1 + i * 0.05, 0.12)       # bars rise
put(sfx, flick(0.6), W(0, 6), 0.4); put(sfx, thump(), W(0, 9), 0.8)          # swipe + KHAALI
for i in range(6): put(sfx, clink(2400 + 120 * i), W(1, 0) + i * 0.1, 0.16)  # garments on the rack
for i in range(5): put(sfx, clink(2800), W(1, 13) - 0.1 + i * 0.1, 0.14)     # 5 tags drop
for i in range(18): put(sfx, tick(), W(2, 0) + 0.3 + i * 0.065, 0.2)          # receipt printing
for k in range(7): put(sfx, tick(), W(2, 7) + k * 0.1, 0.22)                 # typing number
for s_ in [W(3, 9), W(3, 12), W(3, 12) + 0.3, W(6, 7), W(6, 13), W(8, 20) - 0.1]: put(sfx, blip(1250, 0.14), s_, 0.3)
for s_ in [W(4, 5), W(8, 12)]: put(sfx, thump(), s_, 0.6)
for k in range(5): put(sfx, pop(900 + 120 * k), W(8, 5) + k * 0.18, 0.2)
for k in range(7): put(sfx, tick(), W(8, 14) - 0.1 + k * 0.065, 0.25)
for s_ in [W(2, 13), W(5, 16), W(7, 12), W(8, 14) + 0.6, W(8, 31), END_AT + 1.4]: put(sfx, chime(), s_, 0.24)
pops = [W(2, 9) + 0.2 + k * 0.2 for k in range(4)] + [W(4, 6), W(4, 8), W(4, 10), W(4, 12), W(5, 8), W(5, 14), W(6, 1), W(6, 3), W(7, 3), W(7, 9)]
for i, p_ in enumerate(pops): put(sfx, pop(750 + 140 * (i % 3)), p_, 0.2)
score = mus + sfx
# ---- mix with voice ------------------------------------------------------------
with wave.open(f"{ROOT}/public/audio/vo.wav") as w:
    vsr = w.getframerate(); v = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2") / 32768
v = np.interp(np.arange(int(len(v) * SR / vsr)) / SR, np.arange(len(v)) / vsr, v)
mix = score * 0.8
mix[:len(v)] += v[:N]
mix /= max(1e-9, np.abs(mix).max()) / 0.9
tmp = f"{ROOT}/out/mix_raw.wav"; os.makedirs(f"{ROOT}/out", exist_ok=True)
with wave.open(tmp, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "2", f"{ROOT}/public/audio/mix.wav"], check=True)
print("mix.wav written", round(DUR, 2), "s")
