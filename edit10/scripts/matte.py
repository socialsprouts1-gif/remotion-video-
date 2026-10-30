import subprocess, numpy as np, onnxruntime as ort, sys
from PIL import Image
src, out, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
W, H = 1080, 1920
p = subprocess.Popen(['ffmpeg','-nostdin','-loglevel','error','-i',src,'-frames:v',str(n),'-f','rawvideo','-pix_fmt','rgb24','-'], stdout=subprocess.PIPE)
s = ort.InferenceSession('/tmp/claude-0/rvm/rvm.onnx', providers=['CPUExecutionProvider'])
rec = [np.zeros([1,1,1,1], np.float32)]*4
dr = np.array([0.4], np.float32)
for i in range(n):
    buf = p.stdout.read(W*H*3)
    if len(buf) < W*H*3: break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    x = (rgb.astype(np.float32)/255).transpose(2,0,1)[None]
    fgr, pha, *rec = s.run(None, {'src': x, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': dr})
    a = (np.clip(pha[0,0],0,1)*255).astype(np.uint8)
    Image.fromarray(np.dstack([rgb, a]), 'RGBA').save(f'{out}/f{i:04d}.webp', quality=88, method=4)
    if i % 30 == 0: print(i, flush=True)
