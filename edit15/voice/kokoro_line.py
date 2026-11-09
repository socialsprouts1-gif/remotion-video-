import sys, soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro('/tmp/claude-0/tts/kokoro-v1.0.onnx','/tmp/claude-0/tts/voices-v1.0.bin')
voice, speed, text, out = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
a, sr = k.create(text, voice=voice, speed=speed, lang='hi')
sf.write(out, a, sr); print(out, len(a)/sr)
