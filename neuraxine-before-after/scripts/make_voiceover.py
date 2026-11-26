#!/usr/bin/env python3
"""Hindi voiceover with Kokoro (free, open-source TTS) → public/audio/voiceover.mp3 + src/vo.json.

The film's timeline is built from the voice: each line is synthesised, trimmed and laid end to end
with short pauses, and the start/length of every line goes into src/vo.json, which the scenes read.
So editing a line here and re-running re-times the whole video.

Setup (once):
  python3 -m venv ~/.cache/kokoro/venv && ~/.cache/kokoro/venv/bin/pip install kokoro-onnx soundfile
  put kokoro-v1.0.onnx + voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx releases) in ~/.cache/kokoro/
Run:  ~/.cache/kokoro/venv/bin/python scripts/make_voiceover.py [voice]     (default hm_omega; female: hf_alpha)
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser("~/.cache/kokoro")
VOICE = sys.argv[1] if len(sys.argv) > 1 else "hm_omega"
SPEED = 1.1
LEAD = 0.4    # voice starts right away; the phone story plays under it
GAP = 0.28    # pause between lines inside a section
BREAK = 0.8   # pause between sections
TAIL = 4.0    # logo lockup after the last line

# (section, Devanagari for the voice, Roman Hinglish for captions)
LINES = [
    ("hook", "एक ही बिज़नेस। दो अलग दिन।", "Ek hi business. Do alag din."),
    ("hook", "एक, बिना ऑटोमेशन के... और एक, न्यूरैक्सिन के साथ।", "Ek, bina automation ke… aur ek, Neuraxine ke saath."),
    ("b1", "सुबह नौ बजे से फ़ोन बजना शुरू। पचास मैसेज, और सबका एक ही सवाल, प्राइस क्या है?", "Subah 9 baje se phone bajna shuru. 50 message, aur sabka ek hi sawaal, price kya hai?"),
    ("b2", "रिप्लाई करते करते दोपहर हो गई। आधे लीड्स ने इंतज़ार किया, आधे कॉम्पिटिटर के पास चले गए।", "Reply karte karte dopahar ho gayi. Aadhe leads ne intezaar kiya, aadhe competitor ke paas chale gaye."),
    ("b3", "रात को थक कर सोए... और कल फिर वही।", "Raat ko thak kar soye… aur kal phir wahi."),
    ("switch", "अब, वही दिन, न्यूरैक्सिन के साथ।", "Ab, wahi din, Neuraxine ke saath."),
    ("a1", "हर मैसेज का जवाब, तीन सेकंड में। प्राइस, कैटलॉग, लोकेशन, सब ए आई देता है।", "Har message ka jawab, 3 second mein. Price, catalogue, location, sab AI deta hai."),
    ("a2", "सीरियस लीड्स ख़ुद सी आर एम में सेव, और अपॉइंटमेंट कैलेंडर में बुक।", "Serious leads khud CRM mein save, aur appointment calendar mein book."),
    ("a3", "फ़ॉलो-अप्स अपने आप जाते हैं, और आप सिर्फ़ डील्स क्लोज़ करते हो।", "Follow-ups apne aap jaate hain, aur aap sirf deals close karte ho."),
    ("a4", "रात को आप सो रहे हो, और बिज़नेस फिर भी चल रहा है।", "Raat ko aap so rahe ho, aur business phir bhi chal raha hai."),
    ("compare", "पहले, लेट रिप्लाई, खोए हुए लीड्स, और टेंशन। अब, इंस्टेंट रिप्लाई, सेव्ड लीड्स, और सुकून।", "Pehle, late reply, khoye hue leads, aur tension. Ab, instant reply, saved leads, aur sukoon."),
    ("cta", "अपना बिज़नेस भी ऐसे चलाना है? कमेंट करो, ऑटोमेट।", "Apna business bhi aise chalana hai? Comment karo, AUTOMATE."),
    ("cta", "और न्यूरैक्सिन को अभी फ़ॉलो करो।", "Aur Neuraxine ko abhi follow karo."),
]

k = Kokoro(os.path.join(CACHE, "kokoro-v1.0.onnx"), os.path.join(CACHE, "voices-v1.0.bin"))
SR = 24000
clips = []
for sec, dev, roman in LINES:
    audio, sr = k.create(dev, voice=VOICE, speed=SPEED, lang="hi")
    idx = np.where(np.abs(audio) > 0.01)[0]
    if len(idx):
        audio = audio[max(0, idx[0] - 480): idx[-1] + 1800]
    clips.append(audio.astype(np.float32))

t = LEAD
timeline = []
for i, (sec, dev, roman) in enumerate(LINES):
    if i > 0:
        t += GAP if LINES[i - 1][0] == sec else BREAK
    d = len(clips[i]) / SR
    timeline.append({"section": sec, "start": round(t, 3), "dur": round(d, 3), "text": roman})
    t += d
total = t + TAIL

track = np.zeros(int(total * SR) + SR, dtype=np.float32)
for c, item in zip(clips, timeline):
    s = int(item["start"] * SR)
    track[s: s + len(c)] += c
track = track / max(1e-6, np.abs(track).max()) * 0.89
wav = os.path.join(HERE, "..", "public", "audio", "voiceover.wav")
sf.write(wav, track, SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af",
                "highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5",
                "-ar", "44100", "-b:a", "192k", wav.replace(".wav", ".mp3")], check=True)
os.remove(wav)
with open(os.path.join(HERE, "..", "src", "vo.json"), "w") as f:
    json.dump({"voice": VOICE, "total": round(total, 3), "lines": timeline}, f, indent=1, ensure_ascii=False)
for it in timeline:
    print(f'{it["section"]:6} {it["start"]:6.2f} +{it["dur"]:5.2f}  {it["text"][:60]}')
print(f"total {total:.2f}s → public/audio/voiceover.mp3, src/vo.json")
