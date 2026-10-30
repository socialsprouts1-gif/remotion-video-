# edit11: Neuraxine paragliding talking head (9:16)

Selfie-stick clip from a tandem paragliding flight (`IMG_6161.MP4`, 848x480, 16.9 s, no audio) re-timed under
a separately recorded voiceover (20.2 s). Render: `renders/neuraxine-paragliding.mp4` (1080x1920, 30 fps, 20.1 s, -14 LUFS).

## Lip sync

The footage has him talking to camera only at 4.0-8.4 s; elsewhere he looks at the view or barely moves his lips
(checked frame by frame with MediaPipe landmarks on a 5x crop of his ~47 px face, `scripts/mouth_track.py`).
So lips are on screen only where they match:

| Output | Voiceover | Clip |
| --- | --- | --- |
| 0-4.4 s | Main iss waqt zameen se 5,000 feet upar hoon... but ye sab chhodo! | 3.99-8.39 s at 1x, lip-synced (offset found by cross-correlating mouth opening with voice loudness; re-checked on the render: 0 ms) |
| 4.4-9.9 s | Agar life mein itni height se jump le sakte ho? Toh business mein AI adopt karne se kyun darte ho? | 0-3.9 s at 0.71x, slow motion over the view, face turned away |
| 9.9-14.95 s | We help businesses automate WhatsApp, manage leads and never miss a potential customer. | 8.39-12.6 s at 0.83x, looking away |
| 14.95-16.9 s | Work smarter. Grow faster! | full-screen titles over a blurred frame (his mouth is still in the only face-on shot left) |
| 16.9 s- | Follow Neuraxine for more content. | end card, Follow button tapped on "Follow" |

Slow motion uses motion-interpolated frames (ffmpeg `minterpolate`, 60 fps) so it is smooth, not stepped.

## Picture and sound

- Vertical crop (270x480 of the source, upscaled 4x with lanczos + light sharpening) follows his face, smoothed over 1 s.
  The source is 480p, so the picture is softer than phone footage.
- Hard punch-ins on "but ye sab chhodo!" and "AI adopt"; GoPro-style altitude readout climbing to 5,000 ft;
  three flat stickers on WhatsApp / leads / no customer missed; plain bold captions, key words green.
- Voice: high-pass, light EQ and compression, -15 LUFS. Score (synthesised): gusty stereo wind, a riser into an
  impact on "chhodo!", then a 124 bpm beat; whooshes on each cut.

## Rebuild

```bash
npm install
python3 scripts/build_words.py   # caption words from work/vo_asr.json -> src/words.json
python3 scripts/build_edit.py    # segments, speeds, crop path -> src/edit.json
python3 scripts/make_score.py    # wind + music -> public/audio/score.wav
npx remotion render Edit out/neuraxine-paragliding.mp4
```

`public/clips/main.mp4` is not committed; recreate it from the source with
`ffmpeg -i IMG_6161.MP4 -vf "minterpolate=fps=59.94:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=3392:1920:flags=lanczos,unsharp=5:5:0.8:5:5:0.0" -an -crf 17 public/clips/main.mp4`.
