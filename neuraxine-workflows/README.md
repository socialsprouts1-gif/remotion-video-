# Neuraxine — Script 5: "9 workflows, ek sales team" (Hinglish, editorial motion style)

A 49-second vertical (≈46 s of voice) (1080 × 1920, 30 fps) Remotion reel in the same editorial motion-graphics style as
`../neuraxine-editorial`: cream poster scenes and dark rim-lit scenes, condensed headline captions, a 3D hero on every
beat, selection boxes, pill tags, word-tape, barcode and micro-text. Hindi voiceover (Kokoro, free TTS).

```bash
npm install
node scripts/make_textures.mjs     # call screen + tiles → public/tex/ (already committed)
npm run render                     # → out/neuraxine-workflows.mp4  (headless: add --browser-executable=/path/to/chrome)
```

## Logos

The script is tool-neutral, so the film uses only platform marks that the lines name: LinkedIn and Gmail (official SVGs
from the open Iconify "logos" set, extruded into 3D). Everything else is a neutral 3D tile (target list, enrich, chat,
AI voice, CRM). The first version, which named the tools, is kept as `renders/neuraxine-workflows-v1.mp4`.

## Scenes

| Line | Picture |
|---|---|
| Lead dhoondhna, email, LinkedIn message, call… Main nahi. | 3D search / mail / LinkedIn / phone tiles land on each word, merge into the NX tile: ONE SYSTEM |
| 9 workflows hain… | Workflow canvas: nine nodes (target list, enrich, Gmail email, follow-ups, LinkedIn connect, LinkedIn message, AI call, CRM update, dashboard) wired in order |
| Pehla, sahi target companies ki list khud banti hai. | 3D search tile, an auto-built "Target companies" list ticking off, selection box |
| Personalized email sequence… "Dear Sir" nahi. | 3D Gmail, a personal email to Rahul vs a struck-out "Dear Sir" template, Day 1/3/7 pills |
| Uske baad LinkedIn pe connection aur message. Khud se. | 3D LinkedIn + chat tile, connection request → Accepted, auto message |
| Aur calls? AI voice agent khud karta hai. | 3D phone on a live AI call (transcript, booking), 3D AI tile, voice waveform |
| Phir har lead ka update ek CRM mein… kaun kahan hai. | 3D CRM tile, pipeline dashboard (New → Meeting) with leads moving |
| Ab honest baat. "Set and forget" nahi hai. | Red 3D warning tile, "HONEST BAAT" tape, SET & FORGET struck out |
| Galat list daali? … spam … tezi se. | Struck lead list, a burst of 3D envelopes, red SPAM tape, wrong emails/hour count-up |
| System speed deta hai. Sahi target… | 3D dartboard, dart hits the bullseye, SAHI TARGET |
| DM karo "LEADS". | Real neuraxine profile, Instagram DM with "LEADS" sent, NX lockup, DM “LEADS” |

Company names, people and numbers inside the story are illustrative.
