# edit15: before/after reel (Neuraxine "automate")

Layout of the earlier before/after reel: dark backdrop with fine vertical lines and a warm amber glow, a small RAW card
behind a larger FINAL card, both playing the same moment in sync, "DM me / Neuraxine" at the bottom.
Render: `renders/neuraxine-before-after.mp4` (1080x1920, 30 fps, 18 s, -14 LUFS).

- RAW: `public/clips/raw.mp4` = edit14's `public/clips/main.mp4` (the original footage, only converted from HDR, no edits)
- FINAL: `public/clips/final.mp4` = `edit14/renders/neuraxine-automate-v6.mp4` (its audio is the reel's audio)
- Moments (edit timeline): 0-6.6 s ("2026" behind him, Socho 3D scene, the day timeline), 16.1-20.2 s ("repetitive",
  AI behind him, tasks collapse into AI, robot scene), 26.0-29.3 s (logo scene, NEURAXINE behind him, We help),
  35.5-39.4 s (comment bubble, AUTOMATE typed, guide sent to DM). Short audio fades and a faint flash at each jump.

Rebuild: copy the two clips into `public/clips/`, `npm install`, `npx remotion render Edit out/before-after.mp4`.
