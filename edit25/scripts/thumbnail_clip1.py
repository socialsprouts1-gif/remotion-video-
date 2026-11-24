import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from rembg import new_session, remove
src, out = sys.argv[1], sys.argv[2]
W, H = 1080, 1920
im = Image.open(src).convert('RGB').resize((W, H))
# person matte (human-seg, softened slightly)
m1_ = np.asarray(remove(im, session=new_session('u2net_human_seg'), only_mask=True), np.float32)
m2_ = np.asarray(remove(im, session=new_session('isnet-general-use'), only_mask=True), np.float32)
m = Image.fromarray(np.maximum(m1_, m2_).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
# green grade: luminance into a green ramp, keep some skin colour on the person
a = np.asarray(im, np.float32) / 255
lum = (0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2])[..., None]
lum = np.clip((lum - 0.05) * 1.15, 0, 1)
shadow, high = np.array([0.03, 0.10, 0.04]), np.array([0.62, 1.0, 0.55])
green = shadow + (high - shadow) * lum
mk = np.asarray(m, np.float32)[..., None] / 255
person = a * 0.6 + green * 0.4
bg = green * 0.55
img = bg * (1 - mk) + person * mk
# vignette
yy, xx = np.mgrid[0:H, 0:W]
v = 1 - 0.45 * np.clip(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H * 0.45) / (H * 0.7)) ** 2, 0, 1)
img = np.clip(img * v[..., None], 0, 1)
base = Image.fromarray((img * 255).astype(np.uint8))
base = ImageEnhance.Contrast(base).enhance(1.12)
F = '/tmp/claude-0/fonts/Anton.ttf'
LIME = (150, 255, 92)
# big word behind the head
txt = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(txt)
word = 'COMPETITION'
size = 330
f = ImageFont.truetype(F, size)
while d.textlength(word, font=f) > W - 50:
    size -= 6; f = ImageFont.truetype(F, size)
tw = d.textlength(word, font=f)
d.text(((W - tw) / 2, 70), word, font=f, fill=LIME + (255,))
sh = txt.filter(ImageFilter.GaussianBlur(14)); sh = Image.fromarray(np.dstack([np.zeros((H, W, 3), np.uint8), (np.asarray(sh)[..., 3] * 0.5).astype(np.uint8)]), 'RGBA')
comp = base.convert('RGBA'); comp.alpha_composite(sh); comp.alpha_composite(txt)
# the person back on top of the word
pers = base.convert('RGBA'); pers.putalpha(m)
comp.alpha_composite(pers)
# front words across the chest
d2 = ImageDraw.Draw(comp)
w2 = 'ROZ JAL RAHE HAIN'
f2 = ImageFont.truetype(F, 140)
tw2 = d2.textlength(w2, font=f2)
fr = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(fr)
dd.text(((W - tw2) / 2, 1290), w2, font=f2, fill=LIME + (255,))
frs = fr.filter(ImageFilter.GaussianBlur(10)); frs = Image.fromarray(np.dstack([np.zeros((H, W, 3), np.uint8), (np.asarray(frs)[..., 3] * 0.7).astype(np.uint8)]), 'RGBA')
comp.alpha_composite(frs); comp.alpha_composite(fr)
# small label like the reference ("agar aap")
f3 = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 56)
lab = 'jo log'
lw = d2.textlength(lab, font=f3)
x0, y0 = (W - lw) / 2 - 22, 1200
d2.rounded_rectangle([x0, y0, x0 + lw + 44, y0 + 78], radius=10, fill=(10, 20, 10, 235))
d2.text((x0 + 22, y0 + 8), lab, font=f3, fill=LIME)
comp.convert('RGB').save(out, quality=95)
print('saved', out)
