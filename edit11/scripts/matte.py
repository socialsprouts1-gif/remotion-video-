# Person cut-out for a video clip: RVM (soft, temporally stable edges, colour-decontaminated foreground)
# merged with u2net_human_seg (solid body/hands, so motion-blurred hands never go see-through).
import subprocess, sys, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter
from rembg import new_session, remove
src, out, n, desk = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
W, H = 1080, 1920
p = subprocess.Popen(['ffmpeg','-nostdin','-loglevel','error','-i',src,'-frames:v',str(n),'-f','rawvideo','-pix_fmt','rgb24','-'], stdout=subprocess.PIPE)
rvm = ort.InferenceSession('/tmp/claude-0/rvm/rvm.onnx', providers=['CPUExecutionProvider'])
hs = new_session('u2net_human_seg')
rec = [np.zeros([1,1,1,1], np.float32)]*4
dr = np.array([0.4], np.float32)
yy = np.arange(H)[:, None]
for i in range(n):
    buf = p.stdout.read(W*H*3)
    if len(buf) < W*H*3: break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    x = (rgb.astype(np.float32)/255).transpose(2,0,1)[None]
    fgr, pha, *rec = rvm.run(None, {'src': x, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': dr})
    a1 = np.clip(pha[0,0], 0, 1)
    m = remove(Image.fromarray(rgb), session=hs, only_mask=True)
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(2))  # soften the edge
    a2 = np.asarray(m, np.float32)/255
    a = np.maximum(np.clip((a1 - 0.03)/0.35, 0, 1), a2)           # faint (motion-blurred) parts become solid
    a *= np.clip((desk - yy)/12, 0, 1)                             # nothing below the desk edge
    f = np.clip(fgr[0].transpose(1,2,0), 0, 1)
    w = np.clip(a1*3, 0, 1)[..., None]
    col = f*w + rgb/255*(1-w)                                      # decontaminated colours (no background tint)
    r, g, b = col[...,0], col[...,1], col[...,2]
    mag = np.clip(np.minimum(r - g, b - g)*8 - 0.4, 0, 1)[..., None]  # magenta flower spill on grey hair -> grey
    lum = (0.3*r + 0.59*g + 0.11*b)[..., None]
    col = col*(1-mag) + lum*mag
    Image.fromarray(np.dstack([(col*255).astype(np.uint8), (a*255).astype(np.uint8)]), 'RGBA').save(f'{out}/f{i:04d}.webp', quality=90, method=4)
    if i % 40 == 0: print(i, flush=True)
