"""Soft synthesised accents for the Wedding Diaries promo (the client's own voice + music track stays as is).
Warm whooshes under the gold light leaks, a quiet chime when a card or title lands. Writes work/sfx.wav (48 kHz stereo)."""
import numpy as np, wave
SR = 48000; DUR = 1298 / 30; N = int(SR * DUR)
rng = np.random.default_rng(7)
out = np.zeros((N, 2))

def place(sig, t0, g, pan=0.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0: return
    a = (pan + 1) * np.pi / 4
    out[i:i + n, 0] += sig[:n] * g * np.cos(a); out[i:i + n, 1] += sig[:n] * g * np.sin(a)

def whoosh(d=0.8):
    n = int(SR * d); x = rng.standard_normal(n); t = np.arange(n) / n
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X *= np.exp(-((np.log(f + 1) - np.log(900)) ** 2) / 1.2)
    y = np.fft.irfft(X, n); env = np.sin(np.pi * t) ** 2
    return y / np.abs(y).max() * env

def chime(base=1318.5, d=1.6):
    t = np.arange(int(SR * d)) / SR; y = np.zeros_like(t)
    for k, (m, a) in enumerate([(1, 1), (2.01, .35), (3.02, .15), (1.5, .3)]):
        y += a * np.sin(2 * np.pi * base * m * t + k) * np.exp(-t * (3 + 2 * k))
    y *= np.minimum(1, t / 0.004)
    return y / np.abs(y).max()

for c in [4.8, 18.86, 25.06, 33.17]: place(whoosh(0.9), c - 0.45, 0.22, pan=0.2)
for c in [8.28, 29.72]: place(whoosh(0.6), c - 0.3, 0.14, pan=-0.2)
for t0, f in [(4.95, 1568), (6.6, 1318.5), (9.12, 1046.5), (12.95, 1568), (14.3, 1760), (15.4, 1568), (16.7, 1318.5), (29.3, 1046.5), (35.5, 1760), (38.4, 1046.5), (39.65, 1568)]:
    place(chime(f), t0, 0.07, pan=float(rng.uniform(-0.3, 0.3)))
# soft reverb tail
ir = rng.standard_normal(int(SR * 1.8)) * np.exp(-np.arange(int(SR * 1.8)) / SR * 3.2) * 0.02
for ch in range(2):
    out[:, ch] += np.fft.irfft(np.fft.rfft(out[:, ch], 2 * N) * np.fft.rfft(ir, 2 * N))[:N] * 0.6
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open('work/sfx.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('peak', np.abs(out).max())
