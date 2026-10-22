# Neura Chat short: "Problem leads ki nahi, follow-up ki hai" (talking head + motion graphics)

1080×1920, 30 fps, about 48 s (44 s of speech + 3.6 s end card). Seven iPhone clips (IMG_7860, 7863–7868),
trimmed to speech and cut back to back, with Hinglish word-by-word captions, chat-style graphics and a Neura Chat end card.

| Clip | Line | Graphic |
|---|---|---|
| IMG_7860 | Leads ki problem nahi… follow-up mein | LEADS ✓, three new-inquiry notifications, then "ASLI PROBLEM: FOLLOW-UP" |
| IMG_7863 | Customer WhatsApp pe message karta hai… "I will let you know." | WhatsApp chat: question, "Thodi der baad…", reply, "I will let you know.", NO REPLY |
| IMG_7864 | Busy… bhool jaate ho… customer lose | Busy day, Follow-up bhool gaye, −1 Customer lost |
| IMG_7865 | "Hey, just checking…" kuch din baad ek aur follow-up | Follow-up #1, "Kuch din baad…", Follow-up #2 |
| IMG_7866 | Customer reply karta hai, conversation automatically continue | "Yes, interested!", typing, AUTO REPLY |
| IMG_7867 | WhatsApp automation… replies, qualify, follow-ups, appointments, information | Checklist ticks on each word |
| IMG_7868 | Manually track ke bajaye… system jo automatically follow-up kare | Manual tracking ✗ → Lead → Auto reply → Follow-up → Booked loop |

## How it's built

* Raw clips: GitHub release `clips-v1`. Convert to `public/clips/IMG_xxxx.mp4` (1080×1920 H.264):
  `ffmpeg -i IMG_xxxx.mov -vf scale=1080:1920,fps=30 -c:v libx264 -crf 18 -c:a aac public/clips/IMG_xxxx.mp4`
* `trims.json` — speech start/end per clip (silence detection).
* `script.txt` — the script, one paragraph per clip.
* `scripts/align.py` → `src/captions.json`: word timings. No speech recogniser was available, so words are
  spread by syllables and snapped to real pauses. **To fix a caption that is early or late, edit its `s`/`e` in `src/captions.json`.**
* `cues.json` — which word triggers each graphic.
* `scripts/build_edit.py` → `src/edit.json`: the cut list, captions and cues in edit time.
* `scripts/make_score.py` → `public/audio/score.wav`: quiet music bed + SFX (voice comes from the clips).

```bash
npm install
python3 scripts/align.py && python3 scripts/build_edit.py && python3 scripts/make_score.py
npx remotion render Short out/followup-short.mp4
```
