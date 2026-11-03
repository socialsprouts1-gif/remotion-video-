# edit14: Neuraxine "automate" v3 (original concept)

Same take as edit12/13 (`IMG_0126.mp4`). The reference was used for the level of polish only; the ideas here are new.
Render: `renders/neuraxine-automate-v5.mp4` (v5: 3D cut scenes, HDR fixed). Earlier: `renders/neuraxine-automate-v4.mp4`, Previous: `renders/neuraxine-automate-v3.mp4` (1080x1920, 30 fps, 43.5 s, -14 LUFS, lip sync +33 ms).

- **Type behind him:** a per-frame cutout (`scripts/matte.py`, MediaPipe selfie segmenter, temporally smoothed;
  writes `public/clips/person.webm` with alpha) is layered over the words, so "2026", "AI", "NEURAXINE" and
  "AUTOMATE" (typed letter by letter on the word) sit behind his head.
- **Frame-in-frame:** for "his day" and "what we build" the shot folds into a rounded window and the graphics take the
  space below; he never leaves the screen.
- **His day:** a 9 am-9 pm timeline fills with grey task blocks as he names them while a big "free time today" counter
  drops to a red 0.0h; "Growth" tries to drop in and bounces off ("No room"). On "AI handle" every block collapses
  into one lime "AI" block and the freed hours light up ("Free for growth").
- **What we build:** layers stack up on their words (AI agents, Automated workflows, Custom AI systems) and the top
  plate, "Your business", lights lime.
- **Benefits:** cream chips slide in beside him on save time / less manual work / scale smarter.
- **CTA:** "Complete guide, sent to your DM" chip; Follow pill tapped on "follow"; cream end card revealed in a circle.
- **Captions:** bold Geist in 2-line groups, a lime bar grows under the spoken word. Grade: natural and warm, only a soft
  edge falloff (no heavy vignette).

Rebuild: `python3 scripts/matte.py` (needs `work/selfie_segmenter.tflite` from storage.googleapis.com/mediapipe-models),
`python3 scripts/build_edit.py`, `python3 scripts/make_score.py`, `npx remotion render Edit out/neuraxine-automate-v3.mp4`.

## v4 changes
- **Cut bridges:** the footage jumps between takes 14 times (`work/cuts.json`, found by frame difference). Each jump is
  covered by a 0.65 s full-screen motion beat tied to the words at that moment (Socho…, Follow-ups loop, Har din.,
  But…, repeating "repetitive", AI agents circuit, Custom tiles, Your way., Neuraxine logo, We help., rising bars,
  Your turn., comment bubble, + Follow). Each wipes in just before the cut and out just after, with a soft swish.
- **Natural picture:** no colour filter, no vignette, no push-in zoom; the footage plays as filmed.

## v5 changes
- **Colour fix:** the iPhone clip is Dolby Vision HDR (HLG, BT.2020). The earlier working copy kept the HDR signal
  without converting it, which made him look washed out and too bright. `public/clips/main.mp4` is now tone-mapped to
  SDR BT.709 (zscale + Hable, npl 300), so skin and colours look as filmed; the cutout was regenerated from it.
- **3D cut scenes:** each of the 14 cut bridges is a small scene built from Fluent 3D icons and real app logos on a rich
  gradient (violet / coral / midnight / lime / teal / cream): thinking face, orbiting follow-up messages, stacking
  calendars, a bulb switching on, a dizzy face in a wall of "repetitive", a robot with app logos orbiting in depth,
  puzzle pieces snapping together, an arrow into a bullseye, the logo with sparkles, raised hands, a rocket over a
  chart, a finger pointing at the viewer, a speech balloon, a ringing bell. Diagonal wipes, subtle film grain.
- **3D icons across the edit:** above every timeline task, the stopwatch / hourglass on the free-time counter, on every
  layer of the build stack, on the benefit chips, the DM document and a bell on Follow. Window backdrop is deep midnight.
