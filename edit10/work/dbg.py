import sys, os, re, subprocess, numpy as np
sys.path.insert(0, 'scripts'); import align as A
words = [w for w in open('script.txt').read().split() if w != '—']
keys = [re.sub(r"[^a-z0-9'/-]", "", w.lower()) for w in words]
raw = subprocess.run(["ffmpeg","-v","error","-i","work/voice_clean.wav","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
a0, b0, i = float(sys.argv[1]), float(sys.argv[2]), int(sys.argv[3])
al = A.Aligner(words, keys)
audio = raw[int(a0*16000)*2:int(b0*16000)*2]
for k in range(i+1, i+int(sys.argv[4])):
    r = al.run(audio, i, k, {})
    if r is None: print(k, words[k-1], 'FAIL'); continue
    sc, span, sil = r
    print(k, f"{words[k-1]:>10}", sc, ' sil:', [(round(a0+s,2), round(a0+e,2)) for s,e in sil if e-s>0.05])
