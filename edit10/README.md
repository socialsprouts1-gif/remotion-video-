# edit10: Neura Chat, Akola survey (talking head, 9:16)

One uncut 53 s take (`IMG_9754.mp4`, release `onetake-v1`) with a cleaned, re-synced voice track, word-timed
captions and a few graphics that start on the word that names them.

Style is deliberately hand-edited, not template: hard punch-in jump cuts, plain bold captions (2-3 words, key
words green), flat stickers (survey bar, checklist, yellow offer tag), a real-looking WhatsApp notification and
compose bar. No emoji art, glows or particles; sound is a quiet bed plus a notification ping, typing and send.

Render: `renders/neura-chat-akola-survey.mp4` (1080x1920, 30 fps, 55.1 s incl. 2.8 s end card).

## Lip sync

`scripts/lip_track.py` tracks the lips with MediaPipe face landmarks (face found in 100% of 3,188 frames) and
cross-correlates mouth opening with voice loudness.

- The audio sat a constant **~40 ms behind the lips** (every 6 s window with a clear signal read +33 to +50 ms).
- No drift across the take, so one fixed shift fixes it: the voice is moved 40 ms earlier.

## Voice

The phone recording was clipped (22% of samples at full scale). `public/audio/voice.wav` is:
40 ms advance, de-clip, high-pass, light EQ, gentle compression, loudness to -16 LUFS.
After the fix: 0% clipped samples, peak -1.5 dBFS.

## Captions

Word timings come from Whisper (small, int8, word timestamps), prompted with the script so Hinglish is spelled
the same way. `scripts/build_words.py` maps Whisper's words to the caption text and snaps each start to the speech
onset. Checked against the audio: median offset +10 ms, half the words within 40 ms.

The captions show what was **said**, which differs from the written script in a few places:

| Script | Said (and captioned) |
| --- | --- |
| Unmein se 20 businesses ne 2 hours ke andar reply kiya | Usmein se 20 businesses ne 2 ghante ke andar message kiya |
| aur kaafi businesses ne toh reply hi nahi kiya | aur kaafi logon ne toh kiya hi nahi |
| WhatsApp par enquiry bhejta hai … reply hi nahi kar paate | WhatsApp pe enquiry bhejta … reply hi nahi de paate |
| humne banaya hai Neura Chat | humne banaya Neura Chat |
| Yeh 24/7 replies karta hai, automated follow-ups bhejta hai | 24/7 replies karta hai, automated follow-ups karta hai |
| aap busy ho tab bhi … handle karna easy ho sakta hai | aap busy ho phir bhi … handle karna ho sakta easy |
| first 20 businesses ke liye hum lekar aa rahe hain | first 20 businesses ko hum lekar aa rahe |

## Rebuild

```bash
npm install
python3 scripts/build_words.py   # caption words + timings -> src/words.json
python3 scripts/build_edit.py    # timeline (words, cue words, durations) -> src/edit.json
python3 scripts/make_score.py    # music bed + sound effects -> public/audio/score.wav
npx remotion render Edit out/neura-chat-akola-survey.mp4
```

`public/clips/main.mp4` (muted 30 fps H.264 of the source) and `footage/` are not committed; recreate the clip with
`ffmpeg -i IMG_9754.mp4 -an -vf fps=30,format=yuv420p -c:v libx264 -crf 15 public/clips/main.mp4`.

Cue words for every overlay and sound live in `src/cues.json` (word index per cue), so picture and sound share one
source of timing.
