# edit17: AI SEO team, part 1 (talking head, 9:16)

First half of `IMG_9709.MP4` (release `onetake-v3`), 0-37 s: hook through the four agents and "Ye saare AI agents milkar
ek strategy par kaam karte hain". The second half (workflow, "PLAYBOOK" call to action) will be recorded fresh.
Render: `renders/ai-seo-team-part1.mp4` (1080x1920, 30 fps, 37 s, -14 LUFS, lip sync 0 ms).

- **Picture:** HDR (Dolby Vision HLG) tone-mapped to SDR (`work/sdr.mp4`). The patterned wall is softened like a
  shallow-focus lens (`scripts/process.py`: selfie-segmenter matte, smoothed; wall blurred, muted, lifted toward a light
  neutral; he, his hands and the desk stay sharp). No other grade.
- **Style (after the reference reel):** calm top third for type; kinetic captions with one bold keyword and small italic
  words around it, appearing as spoken; soft off-white UI cards. Each of the 5 cuts lands on a sentence and switches
  between a wide and a closer framing.
- **Cards:** search card where his site is stuck on page 7; agency bill repeating every month; a dot that grows into
  "Your own / AI-powered / SEO team" pills; the four agents (progress row + a focus card with a live demo each: Auditor
  scans issues, Analyst lifts pages toward page 1, Researcher types queries, Editor strikes a fake claim); the four
  pills join around a "Strategy" hub.
- **Captions** follow what he says in this take (e.g. "first page pe show nahi karti", no "6 AI agents. Zero salary!").

Rebuild: `python3 scripts/process.py`, `python3 scripts/build_words.py`, `python3 scripts/build_edit.py`,
`python3 scripts/make_score.py`, `npx remotion render Edit out/ai-seo-team-part1.mp4`.
