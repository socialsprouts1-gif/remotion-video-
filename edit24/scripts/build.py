#!/usr/bin/env python3
"""Per clip: cut video/audio from the podcast, clean the voice (bleep the f-word), and place each word on voiced frames.
Writes public/clips/clipN.mp4, public/audio/voiceN.wav, src/editN.json."""
import json, os, re, subprocess, numpy as np
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, '..', 'short-raw', 'v15', 'IMG_1500.MP4')
FPS, END = 30, 2.6
CLIPS = {1: (0.0, 44.75), 2: (84.35, 143.6)}
BLEEP = (90.62, 90.98)  # "f***"
lines = open(os.path.join(ROOT, 'script.txt'), encoding='utf-8').read().splitlines()
pieces = []
for l in lines:
    if l.startswith('#') or '|' not in l: continue
    t, txt = l.split('|', 1); a, b = map(float, t.split()); pieces.append((a, b, txt.strip()))
def syl(w):
    k = re.sub(r"[^\w*-]", '', w)
    sp = {'500': 4, '30': 2, 'f***': 1}
    if k in sp: return sp[k]
    return max(1, len(re.findall(r'[aeiouy]+', k.lower())))
for n, (c0, c1) in CLIPS.items():
    dur = c1 - c0
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(c0), '-t', str(dur), '-i', SRC, '-vf', 'fps=30', '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-an', os.path.join(ROOT, 'public', 'clips', f'clip{n}.mp4')], check=True)
    af = 'aformat=sample_fmts=fltp,pan=mono|c0=0.5*c0+0.5*c1,highpass=f=70,afftdn=nr=8:nf=-42,equalizer=f=3000:t=q:w=1.4:g=1.5,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120'
    if n == 2:
        a0, a1 = BLEEP[0] - c0, BLEEP[1] - c0
        af += f",volume=enable='between(t,{a0},{a1})':volume=0"
    af += ',loudnorm=I=-16:TP=-1.5:LRA=9'
    out = os.path.join(ROOT, 'public', 'audio', f'voice{n}.wav')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(c0), '-t', str(dur), '-i', SRC, '-vn', '-af', af, '-ar', '48000', out], check=True)
    if n == 2:  # broadcast-style bleep tone over the muted word
        import wave
        w = wave.open(out); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32); w.close()
        i0, i1 = int((BLEEP[0] - c0) * sr), int((BLEEP[1] - c0) * sr)
        tt = np.arange(i1 - i0) / sr
        x[i0:i1] += 0.18 * 32767 * np.sin(2 * np.pi * 1000 * tt) * np.minimum(1, np.minimum(tt, tt[::-1]) / 0.01)
        w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.clip(x, -32767, 32767).astype(np.int16).tobytes()); w.close()
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', out, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, '<i2') / 32768
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(320) / 320, 'same')[::160]) + 1e-6)
    words = []
    for a, b, txt in pieces:
        if not (c0 <= a < c1): continue
        a, b = a - c0, b - c0
        f0, f1 = int(a * 100), int(b * 100)
        seg = db[f0:f1]; v = seg > (np.percentile(seg, 20) + 5)
        v = np.convolve(v.astype(float), np.ones(5) / 5, 'same') > 0.3
        if v.sum() < 5: v[:] = True
        cum = np.concatenate([[0], np.cumsum(v)]); tot = cum[-1]
        T = lambda u: (f0 + 0.55 * int(np.searchsorted(cum, u * tot)) + 0.45 * u * (f1 - f0)) / 100
        ws = txt.split(); wt = [syl(w) + 0.35 for w in ws]; s = sum(wt); acc = 0
        for w, q in zip(ws, wt):
            s0, s1 = T(acc / s), T((acc + q) / s)
            words.append({'w': w, 's': round(s0, 3), 'e': round(max(s1, s0 + 0.08), 3), 'i': len(words)})
            acc += q
    speech = round(int(dur * FPS) / FPS, 4)
    json.dump({'fps': FPS, 'src0': c0, 'speech': speech, 'endCard': END, 'duration': speech + END, 'frames': round((speech + END) * FPS), 'words': words}, open(os.path.join(ROOT, 'src', f'edit{n}.json'), 'w'))
    print(n, len(words), 'words', speech)
