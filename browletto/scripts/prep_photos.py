#!/usr/bin/env python3
"""Upscale the café photos for 1080p use: Lanczos resample + gentle unsharp mask.

Reads photos-src/*.png (the original uploads, untouched) and writes public/photos/*.jpg.
Replace the files in photos-src with higher-resolution photos and re-run for a sharper video.
"""
import os
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "photos-src")
DST = os.path.join(HERE, "..", "public", "photos")
os.makedirs(DST, exist_ok=True)
TARGET = 1600  # long edge

for name in sorted(os.listdir(SRC)):
    if not name.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        continue
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    k = TARGET / max(im.size)
    if k > 1:
        # two-step upscale keeps edges cleaner than one big jump
        mid = im.resize((round(im.width * k ** 0.5), round(im.height * k ** 0.5)), Image.LANCZOS)
        mid = mid.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
        im = mid.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=2.0, percent=55, threshold=3))
    out = os.path.join(DST, os.path.splitext(name)[0] + ".jpg")
    im.save(out, quality=94)
    print(out, im.size)
