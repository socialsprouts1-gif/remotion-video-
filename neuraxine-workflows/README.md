# Neuraxine — Script 5: "9 workflows, ek sales team" (Hinglish, editorial motion style)

A 56-second vertical (1080 × 1920, 30 fps) Remotion reel in the same editorial motion-graphics style as
`../neuraxine-editorial`: cream poster scenes and dark rim-lit scenes, condensed headline captions, a 3D hero on every
beat, selection boxes, pill tags, word-tape, barcode and micro-text. Hindi voiceover (Kokoro, free TTS).

```bash
npm install
node scripts/make_textures.mjs     # call screen + tiles → public/tex/ (already committed)
npm run render                     # → out/neuraxine-workflows.mp4  (headless: add --browser-executable=/path/to/chrome)
```

## Real logos

Official brand marks from the open Iconify "logos" set (`public/icons/`): LinkedIn, Supabase, Vapi, Gmail, n8n, plus
WhatsApp/Instagram already in the repo. They are extruded into 3D from their SVGs. Apollo.io and Unipile have no logo in
any open icon set, so they appear as neutral name badges (`tex/apollo.png`, `tex/unipile.png`) rather than imitations;
drop the real logo files into `public/icons/` to swap them in.

## Scenes

| Line | Picture |
|---|---|
| Lead dhoondhna, email, LinkedIn message, call… Main nahi. | 3D search / mail / LinkedIn / phone tiles land on each word, merge into the NX tile: ONE SYSTEM |
| 9 workflows hain… | Workflow canvas: nine nodes with real logos (Apollo, enrich, Gmail, sequence, LinkedIn, Unipile, Vapi, Supabase, dashboard) wired in order |
| Pehla, Apollo se target companies ki list. | Apollo badge in 3D, "Target companies" list ticking off, selection box |
| Personalized email sequence… "Dear Sir" nahi. | 3D Gmail, a personal email to Rahul vs a struck-out "Dear Sir" template, Day 1/3/7 pills |
| LinkedIn outreach, Unipile se. | 3D LinkedIn + Unipile, connection request → Accepted |
| Aur calls? Vapi ka AI voice agent. | 3D phone on a live AI call (transcript, booking), 3D Vapi mark, voice waveform |
| Supabase CRM mein sync… kaun kahan hai. | 3D Supabase bolt, pipeline dashboard (New → Meeting) with leads moving |
| Ab honest baat. "Set and forget" nahi hai. | Red 3D warning tile, "HONEST BAAT" tape, SET & FORGET struck out |
| Galat list daali? … spam … tezi se. | Struck lead list, a burst of 3D envelopes, red SPAM tape, wrong emails/hour count-up |
| System speed deta hai. Sahi target… | 3D dartboard, dart hits the bullseye, SAHI TARGET |
| DM karo "LEADS". | Real neuraxine profile, Instagram DM with "LEADS" sent, NX lockup, DM “LEADS” |

Company names, people and numbers inside the story are illustrative.
