#!/usr/bin/env python3
"""Synthesises the voice-over phrase by phrase (Piper, Hindi 'rohan' voice), trims silence, joins with
fixed pauses, and writes public/audio/vo.wav + src/edit.json (word timings, line starts, loudness env).
Usage: python3 scripts/build_vo.py <dir with hi_IN-rohan-medium.onnx>"""
import sys, os, io, wave, json, re
import numpy as np
from piper import PiperVoice, SynthesisConfig
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phrases import LINES
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MD = sys.argv[1]
v = PiperVoice.load(f"{MD}/hi_IN-rohan-medium.onnx", config_path=f"{MD}/hi_IN-rohan-medium.onnx.json")
SR = v.config.sample_rate
FPS, LEAD, PHRASE_GAP, LINE_GAP, END_CARD = 30, 0.6, 0.16, 0.42, 3.2
def synth(text):
    b = io.BytesIO()
    with wave.open(b, "wb") as w: v.synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=0.8))
    b.seek(0)
    with wave.open(b) as w: x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float32) / 32768
    e = np.convolve(np.abs(x), np.ones(400) / 400, "same"); idx = np.where(e > 0.012)[0]
    return x[max(0, idx[0] - 200): idx[-1] + 600]
def weight(dev):  # rough syllable weight: vowels / consonants in Devanagari
    return 0.6 + len(re.findall(r"[क-हक़-य़]", dev)) + 0.3 * len(re.findall(r"[अ-औ]", dev))
out, words, lines, t = [np.zeros(int(LEAD * SR), np.float32)], [], [], LEAD
for li, line in enumerate(LINES):
    lines.append(round(t, 3))
    for pi, ph in enumerate(line):
        a = synth(" ".join(d.replace("_", " ") for _, d in ph)); dur = len(a) / SR
        ws = [weight(d) + (1.2 if re.search(r"[,।?!]$", d) else 0) for _, d in ph]
        s = t
        for (cap, d), wgt in zip(ph, ws):
            e = s + dur * wgt / sum(ws); words.append({"w": cap, "s": round(s, 3), "e": round(e, 3), "line": li}); s = e
        out.append(a); t += dur
        gap = LINE_GAP if pi == len(line) - 1 else PHRASE_GAP
        out.append(np.zeros(int(gap * SR), np.float32)); t += gap
x = np.concatenate(out); x = x / np.abs(x).max() * 0.89
speech = len(x) / SR
os.makedirs(f"{ROOT}/public/audio", exist_ok=True)
with wave.open(f"{ROOT}/public/audio/vo.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype("<i2").tobytes())
hop = SR // FPS
env = np.array([np.sqrt((x[i * hop:(i + 1) * hop] ** 2).mean() + 1e-12) for i in range(int(speech * FPS))])
env = np.clip(env / np.percentile(env, 97), 0, 1)
dur = speech + END_CARD
json.dump({"fps": FPS, "speech": round(speech, 3), "duration": round(dur, 3), "frames": round(dur * FPS), "lines": lines, "words": words,
           "env": [round(float(e), 3) for e in env]}, open(f"{ROOT}/src/edit.json", "w"), ensure_ascii=False)
print(f"{len(words)} words, speech {speech:.2f}s, total {dur:.2f}s"); print("line starts", lines)
