#!/usr/bin/env python3
"""Lay out the walkthrough: intro, room clips (sped up + stabilised by prep.sh), 3D-plan fly-throughs between
major rooms, short cross-dissolves between related shots, and an outro. Writes src/timeline.json."""
import json, os, subprocess
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS, INTRO, FLY, XF, OUTRO = 30, 4.0, 0.85, 0.35, 3.2
dur = lambda c: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(ROOT, "public/clips", c + ".mp4")], capture_output=True, text=True).stdout)
# clip, plan room, label, detail, how we arrive ('fly' over the plan or 'xf' dissolve)
SHOTS = [
    ("entrance", "foyer", "Entrance Foyer", "Safety grille · solid wood door", "fly"),
    ("living", "living", "Living Room", "L-shaped sofa · split AC", "fly"),
    ("dining", "dining", "Dining", "Glass-top 4-seater", "xf"),
    ("kitchen", "kitchen", "Modular Kitchen", "Designer cabinets · granite platform", "fly"),
    ("utility", "utility", "Utility Balcony", "Open-air dry space", "fly"),
    ("bath", "bath", "Common Bath", "Fully fitted washroom", "fly"),
    ("bed1", "bed1", "Bedroom I", "Double bed · wardrobe", "fly"),
    ("bed2a", "master", "Master Bedroom", "Designer wardrobe · wooden ceiling", "fly"),
    ("bed2b", "master", "Master Bedroom", "Designer wardrobe · wooden ceiling", "xf"),
    ("ensuite", "ensuite", "Ensuite Bath", "Attached washroom", "xf"),
    ("balcony", "balcony", "Private Balcony", "Open city view", "xf"),
    ("finish", "master", "Master Bedroom", "Crafted storage", "xf"),
]
t = INTRO
shots, flies = [], []
prev_room = "foyer"
for k, (c, room, label, detail, how) in enumerate(SHOTS):
    d = dur(c)
    if how == "fly":
        flies.append({"a": round(t, 3), "b": round(t + FLY, 3), "from": prev_room if k else "outside", "to": room})
        t += FLY
        start = t
    else:
        start = t - XF
        t = start
    shots.append({"clip": c, "room": room, "label": label, "detail": detail, "a": round(start, 3), "b": round(start + d, 3), "how": how})
    t = start + d
    prev_room = room
total = t + OUTRO
json.dump({"fps": FPS, "intro": INTRO, "outroAt": round(t, 3), "duration": round(total, 3), "frames": round(total * FPS), "shots": shots, "flies": flies}, open(os.path.join(ROOT, "src", "timeline.json"), "w"), indent=1)
print(f"{len(shots)} shots, {len(flies)} flies, total {total:.2f}s")
