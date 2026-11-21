#!/usr/bin/env python3
"""Hinglish voiceover with Kokoro (free, open-source TTS, Hindi voice) → public/audio/voiceover.mp3.

Each line is synthesised separately and placed at its scene start; lines that would overrun
their slot are sped up slightly. Text is in Devanagari so the Hindi voice pronounces it naturally.

Setup (once):
  python3 -m venv ~/.cache/kokoro/venv && ~/.cache/kokoro/venv/bin/pip install kokoro-onnx soundfile
  download kokoro-v1.0.onnx + voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx releases) into ~/.cache/kokoro/
Run:  ~/.cache/kokoro/venv/bin/python scripts/make_voiceover.py [voice]
"""
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser("~/.cache/kokoro")
VOICE = sys.argv[1] if len(sys.argv) > 1 else "hm_omega"
SPEED = 1.08
DUR = 56.0

# (start s, slot end s, text)
LINES = [
    (0.15, 4.3, "फ़ॉरेक्स अकैडमी? सिर्फ़ एक व्हाट्सऐप नंबर से, पूरा सिस्टम ऑटोमेट।"),
    (4.5, 8.7, "रोज़ सैकड़ों मैसेज... और मैनुअल रिप्लाई में, लीड्स हाथ से निकल जाती हैं।"),
    (9.0, 11.7, "हर नई लीड का स्वागत, अपने आप।"),
    (11.9, 14.9, "बॉट पूछेगा, आप किस सर्विस में इंटरेस्टेड हैं?"),
    (15.1, 20.0, "और उसी हिसाब से, सही वीडियोज़, पी डी एफ़ और इंस्ट्रक्शंस, तुरंत भेज दिए जाते हैं।"),
    (20.3, 25.6, "साथ ही नाम, ट्रेडिंग एक्सपीरियंस और बजट, सब अपने आप सेव।"),
    (25.9, 31.4, "हर लीड, सी आर एम में कैटेगरी के हिसाब से सेव होती है, और फ़ॉलो अप्स ऑटोमैटिक जाते हैं।"),
    (31.7, 36.7, "जब लीड सीरियस हो, तो चैट सीधे आपके ह्यूमन एजेंट को हैंडओवर हो जाती है।"),
    (37.0, 41.6, "ब्रॉडकास्ट और अपडेट्स, एक क्लिक में, सब तक।"),
    (42.0, 48.5, "और डैशबोर्ड पर साफ़ दिखेगा, कितनी लीड्स आईं, कितने फ़्री में जुड़े, कितनों ने मेंटरशिप ली, और कितने इन्वेस्टर बने।"),
    (48.9, 55.6, "लीड से कस्टमर तक, पूरी जर्नी ऑटोमेटेड। अपनी अकैडमी के लिए चाहिए? डी एम करो, ऑटोमेट।"),
]

k = Kokoro(os.path.join(CACHE, "kokoro-v1.0.onnx"), os.path.join(CACHE, "voices-v1.0.bin"))
SR = 24000
track = np.zeros(int(DUR * SR), dtype=np.float32)
for start, end, text in LINES:
    slot = end - start
    speed = SPEED
    for _ in range(4):
        audio, sr = k.create(text, voice=VOICE, speed=speed, lang="hi")
        length = len(audio) / sr
        if length <= slot or speed >= 1.45:
            break
        speed = min(1.45, speed * length / slot * 1.02)
    # trim leading/trailing silence
    idx = np.where(np.abs(audio) > 0.01)[0]
    if len(idx):
        audio = audio[max(0, idx[0] - 600): idx[-1] + 2400]
    s = int(start * SR)
    seg = audio[: max(0, len(track) - s)]
    track[s: s + len(seg)] += seg
    print(f"{start:5.1f}s  {len(audio)/sr:4.1f}s / slot {slot:4.1f}s  speed {speed:.2f}  {'OVER' if len(audio)/sr > slot + 0.2 else 'ok'}")

track = track / max(1e-6, np.abs(track).max()) * 0.89
wav = os.path.join(HERE, "..", "public", "audio", "voiceover.wav")
sf.write(wav, track, SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-b:a", "192k", wav.replace(".wav", ".mp3")], check=True)
os.remove(wav)
print("wrote public/audio/voiceover.mp3 with", VOICE)
