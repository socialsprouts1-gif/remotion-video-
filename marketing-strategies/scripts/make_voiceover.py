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
LEAD = 0.35   # silence before the first line
GAP = 0.28    # pause between lines inside a section
BREAK = 0.6   # pause between sections
TAIL = 2.2    # hold after the last line

# (section, Devanagari for the voice, Roman Hinglish for captions)
LINES = [
    ("hook", "आपका प्रोडक्ट अच्छा है... फिर भी सेल्स नहीं आ रही?", "Aapka product accha hai… phir bhi sales nahi aa rahi?"),
    ("hook", "प्रॉब्लम प्रोडक्ट में नहीं है। प्रॉब्लम है, मार्केटिंग में।", "Problem product mein nahi hai. Problem hai, marketing mein."),
    ("intro", "ये पाँच मार्केटिंग स्ट्रैटेजीज़, हर बिज़नेस ओनर को पता होनी चाहिए।", "Ye 5 marketing strategies, har business owner ko pata honi chahiye."),
    ("s1", "नंबर एक। सही ऑडियंस।", "Number 1. Sahi audience."),
    ("s1", "सबको बेचने की कोशिश मत करो। अपना आइडियल कस्टमर पहचानो, और सिर्फ़ उसी से बात करो।", "Sabko bechne ki koshish mat karo. Apna ideal customer pehchano, aur sirf usi se baat karo."),
    ("s2", "नंबर दो। वैल्यू वाला कंटेंट।", "Number 2. Value wala content."),
    ("s2", "सिर्फ़ ऐड्स मत चलाओ। ऐसा कंटेंट बनाओ, जो लोगों की प्रॉब्लम सॉल्व करे। भरोसा पहले, सेल बाद में।", "Sirf ads mat chalao. Aisa content banao, jo logon ki problem solve kare. Bharosa pehle, sale baad mein."),
    ("s3", "नंबर तीन। सोशल प्रूफ़।", "Number 3. Social proof."),
    ("s3", "लोग आपकी बात से ज़्यादा, आपके कस्टमर्स की बात पर भरोसा करते हैं। रिव्यूज़ और टेस्टिमोनियल्स, हर जगह दिखाओ।", "Log aapki baat se zyada, aapke customers ki baat par bharosa karte hain. Reviews aur testimonials, har jagah dikhao."),
    ("s4", "नंबर चार। फ़ॉलो-अप और रीटारगेटिंग।", "Number 4. Follow-up aur retargeting."),
    ("s4", "ज़्यादातर लोग पहली बार में नहीं खरीदते। व्हाट्सऐप, ईमेल और रीटारगेटिंग ऐड्स से, उन्हें वापस लाओ।", "Zyadatar log pehli baar mein nahi khareedte. WhatsApp, email aur retargeting ads se, unhe wapas laao."),
    ("s5", "नंबर पाँच। डेटा देखो।", "Number 5. Data dekho."),
    ("s5", "जो काम कर रहा है, उस पर डबल डाउन करो। जो नहीं कर रहा, उसे बंद करो।", "Jo kaam kar raha hai, us par double down karo. Jo nahi kar raha, use band karo."),
    ("outro", "याद रखो, मार्केटिंग किस्मत नहीं, एक सिस्टम है।", "Yaad rakho, marketing kismat nahi, ek system hai."),
    ("cta", "अपने बिज़नेस के लिए फ़्री मार्केटिंग प्लान चाहिए? कमेंट करो, ग्रो।", "Apne business ke liye free marketing plan chahiye? Comment karo, GROW."),
    ("cta", "और ऐसी ही टिप्स के लिए, अभी फ़ॉलो करो।", "Aur aisi hi tips ke liye, abhi follow karo."),
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
