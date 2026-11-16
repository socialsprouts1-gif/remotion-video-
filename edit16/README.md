# edit16: before/after reel, cream layout with editing timeline (Neuraxine "automate")

Layout of the earlier cream before/after reel, unbranded (no logo, no handle): a tilted RAW card and a bigger tilted
FINAL card with brown RAW / FINAL tags, a brown band "Turn your videos into a premium masterpiece.", an editing-timeline
panel whose playhead runs with the video, and "DM NOW!".
Render: `renders/before-after-cream-unbranded.mp4` (the earlier branded version is `renders/neuraxine-before-after-cream.mp4`) (1080x1920, 30 fps, 43.5 s, full length, no cuts; the audio is the
final edit's audio, verified identical).

- RAW = edit14's original footage (only converted from HDR); FINAL = `edit14/renders/neuraxine-automate-v6.mp4`.
  The raw footage (41.3 s) holds its last frame while the final end card plays.
- The timeline is drawn from the real edit (`src/tl.json`, built from `edit14/src/edit.json` and `edit14/work/cuts.json`):
  V2 the 15 takes split at the real cuts, V3 the cutout, V4 the 14 3D cut scenes, V5 the two window sections,
  V6 the words behind him, V7 overlays and end card, V8 caption groups; A1 the voice drawn from its real loudness,
  A2 music, A3 sound effects at the cuts.

Rebuild: copy `raw.mp4` / `final.mp4` into `public/clips/` (same as edit15), `npm install`,
`npx remotion render Edit out/before-after-cream.mp4`.
