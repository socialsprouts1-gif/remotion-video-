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
SPEED = 1.12
LEAD = 0.4    # voice starts right away; the phone story plays under it
GAP = 0.28    # pause between lines inside a section
BREAK = 0.6   # pause between sections
TAIL = 3.2    # logo lockup after the last line

# (section, Devanagari for the voice, Roman Hinglish for captions)
LINES = [
    ("hook", "रात के बारह बजे, एक कस्टमर ने मैसेज किया... और आप सो रहे थे।", "Raat ke 12 baje, ek customer ne message kiya… aur aap so rahe the."),
    ("hook", "सुबह तक, वो कस्टमर आपके कॉम्पिटिटर के पास जा चुका था।", "Subah tak, woh customer aapke competitor ke paas ja chuka tha."),
    ("intro", "ये पाँच ए आई ऑटोमेशन्स, हर बिज़नेस को आज ही लगानी चाहिए।", "Ye 5 AI automations, har business ko aaj hi lagani chahiye."),
    ("s1", "नंबर एक। व्हाट्सऐप ऑटो रिप्लाई।", "Number 1. WhatsApp auto-reply."),
    ("s1", "कस्टमर कभी भी मैसेज करे, ए आई तुरंत सही जवाब देता है। चौबीस घंटे, सातों दिन।", "Customer kabhi bhi message kare, AI turant sahi jawab deta hai. 24 ghante, saaton din."),
    ("s2", "नंबर दो। लीड फ़ॉलो-अप।", "Number 2. Lead follow-up."),
    ("s2", "ऐड से लीड आई? सिस्टम ख़ुद व्हाट्सऐप और ईमेल पर फ़ॉलो-अप करता है, जब तक वो जवाब न दे।", "Ad se lead aayi? System khud WhatsApp aur email par follow-up karta hai, jab tak woh jawab na de."),
    ("s3", "नंबर तीन। अपॉइंटमेंट बुकिंग।", "Number 3. Appointment booking."),
    ("s3", "कस्टमर चैट में ही स्लॉट चुने, बुकिंग कन्फ़र्म, और रिमाइंडर भी ऑटोमैटिक।", "Customer chat mein hi slot chune, booking confirm, aur reminder bhi automatic."),
    ("s4", "नंबर चार। रिव्यू रिक्वेस्ट।", "Number 4. Review request."),
    ("s4", "हर ख़ुश कस्टमर को अपने आप मैसेज जाता है, और आपके गूगल रिव्यूज़ बढ़ते रहते हैं।", "Har khush customer ko apne aap message jaata hai, aur aapke Google reviews badhte rehte hain."),
    ("s5", "नंबर पाँच। ऑटो इनवॉइस और पेमेंट।", "Number 5. Auto invoice aur payment."),
    ("s5", "ऑर्डर आया, बिल बना, और पेमेंट लिंक सीधे व्हाट्सऐप पर। बिना हाथ लगाए।", "Order aaya, bill bana, aur payment link seedhe WhatsApp par. Bina haath lagaye."),
    ("outro", "आप बिज़नेस चलाओ। बाक़ी काम, ए आई करेगा।", "Aap business chalao. Baaki kaam, AI karega."),
    ("cta", "अपने बिज़नेस के लिए फ़्री ऑटोमेशन प्लान चाहिए? कमेंट करो, ऑटोमेट।", "Apne business ke liye free automation plan chahiye? Comment karo, AUTOMATE."),
    ("cta", "और ऐसे ही सिस्टम्स के लिए, न्यूरैक्सिन को अभी फ़ॉलो करो।", "Aur aise hi systems ke liye, Neuraxine ko abhi follow karo."),
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
