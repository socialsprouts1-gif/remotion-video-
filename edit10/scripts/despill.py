# Remove leftover purple-backdrop pixels from the cut-out frames (nothing on Deepak is strongly blue/purple).
import sys, glob, numpy as np
from PIL import Image, ImageFilter
for f in sorted(glob.glob(sys.argv[1] + '/f*.webp')):
    a = np.array(Image.open(f).convert('RGBA')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    blue = np.clip((b - np.maximum(r, g) - 25) / 30, 0, 1)
    k = np.array(Image.fromarray((blue * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)), np.float32) / 255
    a[..., 3] *= 1 - k
    Image.fromarray(a.astype(np.uint8), 'RGBA').save(f, quality=90, method=4)
