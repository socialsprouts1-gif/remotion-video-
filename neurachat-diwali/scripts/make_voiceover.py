#!/usr/bin/env python3
"""Character voices with Kokoro (free, open-source TTS) → public/audio/voiceover.mp3 + src/vo.json.

Each line is spoken by one character. Lines are laid end to end with short pauses; the start, length,
speaker and a per-frame loudness envelope (for lip sync) of every line go into src/vo.json, which the
scenes read. Editing a line here and re-running re-times the whole video.

Run:  ~/.cache/kokoro/venv/bin/python scripts/make_voiceover.py
"""
import json
import os
import subprocess

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser("~/.cache/kokoro")
SR = 24000
FPS = 30
LEAD = 0.5
GAP = 0.18    # pause between lines in the same scene
BREAK = 0.38  # pause at a scene change
TAIL = 0.6

# speaker → (kokoro voice, speed, pitch factor). Pitch is shifted by resampling so each character sounds different.
VOICES = {
    "seth": ("hm_omega", 1.08, 0.97),   # shop owner: fuller, slightly lower
    "kaka": ("hm_psi", 0.98, 0.9),      # old helper: slower and deeper
    "raju": ("hm_psi", 1.12, 1.09),     # young staff: quick and bright
    "vo": ("hf_beta", 1.05, 1.0),       # closing narrator
}

# (scene, speaker, Devanagari for the voice, Roman Hinglish for captions)
LINES = [
    ("news", "kaka", "सेठ जी! सामने वाली दुकान ने, सबको दिवाली ऑफ़र भेज दिया!", "Seth ji! Saamne wali dukaan ne sabko Diwali offer bhej diya!"),
    ("street", "kaka", "हमारे कस्टमर भी, वहाँ जा रहे हैं!", "Hamare customer bhi wahan ja rahe hain!"),
    ("shock", "seth", "क्या?! हमारे कस्टमर?!", "Kya?! Hamare customer?!"),
    ("order", "seth", "काका, हम भी ऑफ़र भेजेंगे! सबको व्हाट्सऐप करो!", "Kaka, hum bhi offer bhejenge! Sabko WhatsApp karo!"),
    ("diary", "kaka", "सेठ जी, इस डायरी में दो हज़ार नंबर हैं।", "Seth ji, is diary mein do hazaar number hain…"),
    ("diary", "kaka", "एक-एक करके भेजने में तो, दिवाली निकल जाएगी!", "Ek-ek karke bhejne mein toh Diwali nikal jayegi!"),
    ("block", "seth", "और एक साथ भेजा, तो नंबर ही ब्लॉक हो जाएगा!", "Aur ek saath bheja toh number hi block ho jayega!"),
    ("raju", "raju", "सेठ जी, टेंशन मत लो।", "Seth ji, tension mat lo."),
    ("raju", "raju", "न्यूरा चैट के सी आर एम में, सारे कस्टमर्स पहले से हैं।", "Neura Chat ke CRM mein saare customers pehle se hain."),
    ("laptop", "raju", "ऑफ़र का पोस्टर बनाओ, सब कस्टमर्स सेलेक्ट करो,", "Offer ka poster banao, sab customers select karo…"),
    ("laptop", "raju", "और व्हाट्सऐप ए पी आई से, एक क्लिक में सबको भेज दो!", "aur WhatsApp API se ek click mein sabko bhej do!"),
    ("laptop", "raju", "किसने देखा, किसने रिप्लाई किया, सब यहीं दिखेगा।", "Kisne dekha, kisne reply kiya, sab yahin dikhega."),
    ("laptop", "raju", "और कोई प्राइस पूछे, तो ए आई ख़ुद जवाब देगा। रात को भी।", "Aur koi price pooche, toh AI khud jawab dega. Raat ko bhi."),
    ("easy", "seth", "इतना आसान?!", "Itna aasaan?!"),
    ("crowd", "kaka", "सेठ जी, दुकान तो भर गई!", "Seth ji, dukaan toh bhar gayi!"),
    ("crowd", "seth", "काका, सामने वाली दुकान को भी, एक मैसेज भेज दो।", "Kaka, saamne wali dukaan ko bhi ek message bhej do…"),
    ("crowd", "seth", "हैप्पी दिवाली!", "Happy Diwali!"),
    ("end", "vo", "न्यूरा चैट। ब्रॉडकास्ट, सी आर एम, और ए आई रिप्लाईज़, सब एक जगह। लिंक के लिए कमेंट करो, व्हाट्सऐप।", "Neura Chat. Broadcast, CRM aur AI replies, sab ek jagah. Link ke liye comment karo “WHATSAPP”."),
]

k = Kokoro(os.path.join(CACHE, "kokoro-v1.0.onnx"), os.path.join(CACHE, "voices-v1.0.bin"))


def pitch(audio, factor):
    """Shift pitch by `factor` while keeping the length (resample, then time-stretch back with ffmpeg atempo)."""
    if abs(factor - 1) < 1e-3:
        return audio
    tmp = os.path.join(HERE, "_p.wav")
    out = os.path.join(HERE, "_q.wav")
    sf.write(tmp, audio, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af",
                    f"asetrate={int(SR * factor)},aresample={SR},atempo={1 / factor:.5f}", out], check=True)
    a, _ = sf.read(out, dtype="float32")
    os.remove(tmp)
    os.remove(out)
    return a


clips = []
for scene, who, dev, roman in LINES:
    voice, speed, pf = VOICES[who]
    audio, _ = k.create(dev, voice=voice, speed=speed, lang="hi")
    idx = np.where(np.abs(audio) > 0.01)[0]
    if len(idx):
        audio = audio[max(0, idx[0] - 360): idx[-1] + 1200]
    audio = pitch(audio.astype(np.float32), pf)
    clips.append(audio / max(1e-6, np.abs(audio).max()))

t = LEAD
timeline = []
for i, (scene, who, dev, roman) in enumerate(LINES):
    if i > 0:
        t += GAP if LINES[i - 1][0] == scene else BREAK
    c = clips[i]
    d = len(c) / SR
    # per-frame loudness 0..1 for lip sync
    hop = SR // FPS
    env = [float(np.sqrt(np.mean(c[j: j + hop] ** 2))) if len(c[j: j + hop]) else 0.0 for j in range(0, len(c), hop)]
    m = max(env) or 1
    env = [round(min(1, (e / m) ** 0.7), 2) for e in env]
    timeline.append({"section": scene, "who": who, "start": round(t, 3), "dur": round(d, 3), "text": roman, "env": env})
    t += d
total = t + TAIL

track = np.zeros(int(total * SR) + SR, dtype=np.float32)
for c, item in zip(clips, timeline):
    s = int(item["start"] * SR)
    track[s: s + len(c)] += c * 0.85
wav = os.path.join(HERE, "..", "public", "audio", "voiceover.wav")
sf.write(wav, track, SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af",
                "highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5",
                "-ar", "44100", "-b:a", "192k", wav.replace(".wav", ".mp3")], check=True)
os.remove(wav)
with open(os.path.join(HERE, "..", "src", "vo.json"), "w") as f:
    json.dump({"total": round(total, 3), "lines": timeline}, f, ensure_ascii=False)
for it in timeline:
    print(f'{it["section"]:7}{it["who"]:5} {it["start"]:6.2f} +{it["dur"]:5.2f}  {it["text"][:60]}')
print(f"total {total:.2f}s → public/audio/voiceover.mp3, src/vo.json")
