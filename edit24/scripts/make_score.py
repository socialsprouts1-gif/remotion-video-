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
END_AT = WE(9, 31) + 0.6

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
CL = [0, 2, 3, 4, 5, 6, 7, 8, 9]
def clink(f=2600, d=0.25):
    tt = tx(d); return (np.sin(2 * np.pi * f * tt) + 0.6 * np.sin(2 * np.pi * f * 1.48 * tt)) * np.exp(-tt * 18)
for k in range(1, 9):
    s0 = L[CL[k]] - 0.45
    for j in range(9): put(sfx, tick(), s0 + j * 0.05, 0.14)          # shutter rattles down
    put(sfx, thump(), s0 + 0.5, 0.45)                                 # hits the floor
    for j in range(9): put(sfx, tick(), s0 + 0.55 + j * 0.05, 0.11)   # rolls up
    put(sfx, whoosh(0.5), s0 + 0.55, 0.2)
put(sfx, whoosh(0.7), END_AT - 0.1, 0.4)
for i in range(6): put(sfx, blip(1700, 0.06), -0.4 + i * 0.25 if i else 0.05, 0.12)  # DM pings
put(sfx, thump(), W(0, 20), 0.8)
put(sfx, whoosh(1.5), W(1, 2) - 0.3, 0.35)                        # car drives by
put(sfx, chime(), W(1, 8), 0.22)
put(sfx, pop(900), W(2, 0) + 0.1, 0.2); put(sfx, pop(1000), W(2, 10) - 0.2, 0.2)
put(sfx, blip(1500, 0.14), W(2, 13) - 0.2, 0.3)
put(sfx, blip(1250, 0.14), W(3, 0) + 0.1, 0.3)
for k in range(3): put(sfx, pop(1000), W(3, 3) + k * 0.3, 0.16)
for k in range(2): put(sfx, pop(1100 + 100 * k), W(3, 6) - 0.2 + k * 0.25, 0.18)
put(sfx, pop(900), W(3, 10) - 0.3, 0.2); put(sfx, chime(), W(3, 14), 0.24)
for j in range(6): put(sfx, blip(1700 + 60 * (j % 2), 0.05), W(4, 6) + j * 0.09, 0.18)
for j in range(10): put(sfx, tick(), W(4, 8) + j * 0.14, 0.1)
for k in range(4): put(sfx, pop(800 + 90 * k), W(4, 11) - 0.3 + k * 0.14, 0.18)
put(sfx, blip(1250, 0.14), W(5, 0) + 0.1, 0.3)
put(sfx, pop(950), W(5, 3) - 0.3, 0.2); put(sfx, pop(1050), W(5, 6) - 0.3, 0.2); put(sfx, chime(), W(5, 7) + 0.3, 0.24)
put(sfx, chime(), W(6, 0) + 0.5, 0.24); put(sfx, flick(0.4), W(6, 6) - 0.3, 0.22)
for k in range(6): put(sfx, pop(1200 + 80 * k), W(6, 9) + 0.3 + k * 0.25, 0.12)
for s_ in [W(7, 1), W(7, 2), W(7, 4), W(7, 5)]: put(sfx, clink(2200), s_, 0.16)
put(sfx, blip(1500, 0.14), W(7, 11) - 0.3, 0.3); put(sfx, chime(), W(7, 17), 0.24)
put(sfx, thump(), W(8, 6), 0.5)
for s_ in [W(8, 7), W(8, 8), W(8, 10)]: put(sfx, pop(700), s_, 0.22)
put(sfx, whoosh(2.5), W(8, 0) + 1, 0.2)
for k in range(5): put(sfx, pop(900 + 120 * k), W(9, 5) + k * 0.18, 0.2)
for k in range(7): put(sfx, tick(), W(9, 14) - 0.1 + k * 0.065, 0.25)
put(sfx, thump(), W(9, 12), 0.6); put(sfx, blip(1500, 0.14), W(9, 20) - 0.1, 0.3)
for s_ in [W(9, 14) + 0.6, W(9, 31), END_AT + 1.4]: put(sfx, chime(), s_, 0.24)
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
