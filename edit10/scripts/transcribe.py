#!/usr/bin/env python3
"""What was actually said, with word timestamps (faster-whisper, Whisper small int8).
The script is passed as the prompt so Hinglish comes back in the same Roman spelling.
Usage: transcribe.py MODEL_DIR [lang]  ->  work/asr_<lang>.json"""
import json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
lang = sys.argv[2] if len(sys.argv) > 2 else "en"
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8", cpu_threads=4)
prompt = open(os.path.join(ROOT, "script.txt")).read().replace("\n", " ") if lang == "en" else None
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "work", "voice_clean.wav"), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True).stdout
audio = np.frombuffer(raw, "<i2").astype(np.float32) / 32768
segs, info = m.transcribe(audio, language=lang, word_timestamps=True, beam_size=5,
                          initial_prompt=prompt, vad_filter=False, condition_on_previous_text=False)
out = []
for s in segs:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
    out += [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)} for w in s.words]
json.dump(out, open(os.path.join(ROOT, "work", f"asr_{lang}.json"), "w"), ensure_ascii=False, indent=0)
print(len(out), "words")
