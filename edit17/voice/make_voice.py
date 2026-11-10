#!/usr/bin/env python3
"""Hinglish voice-over, one line at a time (Kokoro hm_omega via kokoro-onnx), then joined with set gaps.
Writes public/audio/voice.wav and src/lines.json (exact start/end of every line)."""
import json, os, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
M = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/tts'
k = Kokoro(f'{M}/kokoro-v1.0.onnx', f'{M}/voices-v1.0.bin')
SR, LEAD, SPEED = 24000, 0.15, 1.22
out, lines, t = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD
for row in open(os.path.join(ROOT, 'voice', 'lines.tsv'), encoding='utf-8'):
    cap, hin, gap = row.rstrip('\n').split('\t')
    segs = []
    for seg in hin.split('|'):  # 'en:' segments use the English pronouncer, same voice
        lang = 'hi'
        if seg.startswith('en:'):
            lang, seg = 'en-us', seg[3:]
        b, sr = k.create(seg, voice='hm_omega', speed=SPEED, lang=lang)
        b = np.asarray(b, np.float32)
        e = np.abs(b) > 0.01
        segs += [b[max(0, np.argmax(e) - 480): len(b) - np.argmax(e[::-1]) + 480], np.zeros(int(0.05 * sr), np.float32)]
    a = np.concatenate(segs)
    env = np.abs(a) > 0.01
    i0, i1 = np.argmax(env), len(a) - np.argmax(env[::-1])
    a = a[max(0, i0 - int(0.02 * SR)): i1 + int(0.04 * SR)]
    lines.append({'text': cap, 's': round(t, 3), 'e': round(t + len(a) / SR, 3)})
    out += [a, np.zeros(int(float(gap) * SR), np.float32)]
    t += len(a) / SR + float(gap)
y = np.concatenate(out)
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True)
sf.write(os.path.join(ROOT, 'public', 'audio', 'voice_raw.wav'), y, SR)
json.dump({'lines': lines, 'speech': round(t, 3)}, open(os.path.join(ROOT, 'src', 'lines.json'), 'w'), ensure_ascii=False, indent=1)
print(f'{len(lines)} lines, {t:.2f}s')
