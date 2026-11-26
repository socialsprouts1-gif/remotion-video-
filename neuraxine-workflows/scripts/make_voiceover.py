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
SPEED = 1.24
LEAD = 0.4    # voice starts right away; the phone story plays under it
GAP = 0.22    # pause between lines inside a section
BREAK = 0.45  # pause between sections
TAIL = 2.8    # logo lockup after the last line

# (section, Devanagari for the voice, Roman Hinglish for captions)
LINES = [
    ("hook", "लीड ढूँढना, ईमेल, लिंक्डइन मैसेज, कॉल... ये सब एक सिस्टम करता है। मैं नहीं।", "Lead dhoondhna, email, LinkedIn message, call… yeh sab ek system karta hai. Main nahi."),
    ("nine", "नौ वर्कफ़्लोज़ हैं। दिखाता हूँ, कैसे जुड़े हैं।", "9 workflows hain. Dikhata hoon kaise jude hain."),
    ("apollo", "पहला, सही टारगेट कंपनीज़ की लिस्ट, ख़ुद बनती है।", "Pehla, sahi target companies ki list khud banti hai."),
    ("email", "फिर हर लीड के लिए पर्सनलाइज़्ड ईमेल सीक्वेंस। टेम्पलेट वाला, डियर सर, नहीं।", "Phir har lead ke liye personalized email sequence. Template wala “Dear Sir” nahi."),
    ("linkedin", "उसके बाद लिंक्डइन पे कनेक्शन और मैसेज। ख़ुद से।", "Uske baad LinkedIn pe connection aur message. Khud se."),
    ("vapi", "और कॉल्स? ए आई वॉइस एजेंट ख़ुद करता है।", "Aur calls? AI voice agent khud karta hai."),
    ("crm", "फिर हर लीड का अपडेट, एक सी आर एम में। एक डैशबोर्ड पे दिखता है, कौन कहाँ है।", "Phir har lead ka update ek CRM mein. Ek dashboard pe dikhta hai kaun kahan hai."),
    ("honest", "अब ऑनेस्ट बात। ये, सेट एंड फ़ॉरगेट, नहीं है।", "Ab honest baat. Yeh “set and forget” nahi hai."),
    ("wrong", "ग़लत लिस्ट डाली? तो नौ वर्कफ़्लोज़ मिलके ग़लत लोगों को स्पैम करेंगे। बस, तेज़ी से।", "Galat list daali? Toh 9 workflows milke galat logon ko spam karenge. Bas tezi se."),
    ("speed", "सिस्टम स्पीड देता है। सही टारगेट, आपको ही चुनना पड़ेगा।", "System speed deta hai. Sahi target aapko hi chunna padega."),
    ("cta", "आपकी सेल्स टीम को भी ऐसा चाहिए? डी एम करो, लीड्स।", "Aapki sales team ko bhi aisa chahiye? DM karo “LEADS”."),
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
