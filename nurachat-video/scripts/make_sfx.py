#!/usr/bin/env python3
"""Synthesise the film's UI sound palette into public/sfx/*.wav (44.1 kHz, 16-bit stereo).

Everything is generated from noise and sine partials, so there are no third-party samples
or licensing questions. All sounds share one short "room" (a tiny early-reflection tail)
so they sit together. Re-run after tweaking: `python3 scripts/make_sfx.py`.
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def env_ad(n, attack, decay_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay_tau)


def svf(x, cutoff, q=0.7, mode="bp"):
    """Chamberlin state-variable filter with a per-sample cutoff (Hz)."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    low = band = 0.0
    out = np.empty_like(x)
    damp = 1.0 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(cutoff[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        out[i] = band if mode == "bp" else (low if mode == "lp" else high)
    return out


def room(x, mix=0.12):
    """A few early reflections: glues the palette into one space without audible reverb."""
    y = x.copy()
    for ms, g in [(11, 0.5), (17, 0.38), (29, 0.27), (43, 0.18), (61, 0.11)]:
        d = int(SR * ms / 1000)
        y[d:] += x[:-d] * g * mix * 4
    return y


def finish(x, peak_db=-3.0, fade_ms=8):
    x = x - np.mean(x)
    n = int(SR * fade_ms / 1000)
    if n and len(x) > 2 * n:
        x[-n:] *= np.linspace(1, 0, n)
    p = np.max(np.abs(x)) or 1
    return x / p * (10 ** (peak_db / 20))


def write(name, mono, width=0.0):
    """Mono → stereo with an optional slight decorrelation for width."""
    left = mono
    right = mono
    if width:
        d = int(SR * 0.0006)
        right = np.concatenate([np.zeros(d), mono[:-d]]) * (1 - width * 0.2)
    st = np.stack([left, right], axis=1)
    data = (np.clip(st, -1, 1) * 32767).astype("<i2")
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"  {name}.wav  {len(mono) / SR:.2f}s")


def whoosh(dur=0.55, lo=350, hi=3800, peak=0.45):
    n = int(SR * dur)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    # cutoff sweeps up then down, amplitude follows a skewed bell peaking at `peak`
    sweep = np.where(t < peak, t / peak, 1 - (t - peak) / (1 - peak))
    cutoff = lo + (hi - lo) * sweep ** 1.6
    y = svf(noise, cutoff, q=1.4, mode="bp")
    amp = np.where(t < peak, (t / peak) ** 2.2, ((1 - t) / (1 - peak)) ** 1.6)
    return room(y * amp)


def click():
    t = t_axis(0.06)
    burst = rng.standard_normal(len(t)) * np.exp(-t / 0.0016)
    burst = svf(burst, 5200, q=0.9, mode="hp")
    body = np.sin(2 * np.pi * 1750 * t) * np.exp(-t / 0.009) * 0.55
    low = np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.012) * 0.25
    return room(burst * 0.8 + body + low, mix=0.08)


def pop():
    """Two-note incoming-message chime (original interval, not any app's tone)."""
    t = t_axis(0.42)
    y = np.zeros_like(t)
    for start, f0 in [(0.0, 1174.7), (0.075, 1568.0)]:
        tt = np.clip(t - start, 0, None)
        on = (t >= start).astype(float)
        e = env_ad(len(t), 0.002, 0.07) if start == 0 else np.roll(env_ad(len(t), 0.002, 0.11), int(start * SR)) * on
        tone = np.sin(2 * np.pi * f0 * tt) + 0.22 * np.sin(2 * np.pi * f0 * 2.01 * tt) + 0.08 * np.sin(2 * np.pi * f0 * 3 * tt)
        y += tone * e * on
    return room(y, mix=0.15)


def impact():
    t = t_axis(1.1)
    f = 38 + 95 * np.exp(-t / 0.07)
    phase = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(phase) * np.exp(-t / 0.32)
    knock = svf(rng.standard_normal(len(t)), 900, q=0.8, mode="lp") * np.exp(-t / 0.035) * 0.9
    air = svf(rng.standard_normal(len(t)), 4200, q=0.7, mode="bp") * np.exp(-t / 0.18) * 0.12
    return room(np.tanh((sub * 1.2 + knock + air) * 1.4), mix=0.18)


def riser(dur=0.75):
    n = int(SR * dur)
    t = np.linspace(0, 1, n)
    cutoff = 300 + 6500 * t ** 2
    y = svf(rng.standard_normal(n), cutoff, q=2.2, mode="bp")
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * t ** 2) / SR) * 0.18
    return room((y + tone) * t ** 2.4)


def shimmer():
    t = t_axis(1.6)
    y = np.zeros_like(t)
    for i, f0 in enumerate([1318.5, 1975.5, 2637.0, 3951.1]):
        trem = 0.75 + 0.25 * np.sin(2 * np.pi * (5.5 + i) * t + i)
        y += np.sin(2 * np.pi * f0 * t) * np.exp(-t / (0.5 - i * 0.08)) * trem * (0.6 ** i)
    y *= np.clip(t / 0.02, 0, 1)
    return room(y * 0.8, mix=0.25)


def tick():
    t = t_axis(0.09)
    y = np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.012) + 0.4 * np.sin(2 * np.pi * 5200 * t) * np.exp(-t / 0.006)
    return room(y, mix=0.1)


if __name__ == "__main__":
    print("Synthesising SFX →", os.path.normpath(OUT))
    write("whoosh", finish(whoosh(0.55, 300, 4200, 0.5), -2), width=1)
    write("whooshSoft", finish(whoosh(0.45, 250, 2200, 0.55), -6), width=1)
    write("click", finish(click(), -4))
    write("pop", finish(pop(), -4))
    write("impact", finish(impact(), -1.5), width=0.5)
    write("riser", finish(riser(), -5), width=1)
    write("shimmer", finish(shimmer(), -8), width=1)
    write("tick", finish(tick(), -7))
