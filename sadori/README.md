# SADORI EYEWEAR — luxury 3D ad (9:16, 35 s)

A cinematic product film for SADORI EYEWEAR, Akola. 1080×1920, 30 fps, 35 seconds.
The eyewear is real-time 3D (three.js inside Remotion): procedurally modelled frames with
physically based glossy acetate, tortoiseshell, champagne-gold metal, silicone nose pads and glass lenses,
lit by a product-photography softbox environment.

| Time | Scene | On screen |
|---|---|---|
| 0–4 s | Darkness, a light beam discovers a floating black-and-gold frame | VISION, REDEFINED. |
| 4–10 s | 3D turn, macro on hinge/rim, macro on sunglasses' bridge, nose pad and lens | Style Meets Clarity. |
| 10–16 s | Inside the lens: barrel rings and aperture → pull back, temples unfold, measurement lines (52 □ 18 — 145) | Precision in Every Detail. |
| 16–23 s | Boutique row of pedestals: Modern, Classic, Minimal, Bold | Find the Frame That Feels Like You. |
| 23–28 s | Gold line drawing: small shop (2006) → contemporary studio (2025), Akola · Maharashtra | Rooted in Akola. Crafted Around You. |
| 28–35 s | Frame rotates into alignment, light sweep, wordmark | SADORI / EYEWEAR · Eyewear Is Personal. · Visit Us in Akola · Discover Your Perfect Frame · www.sadori.in |

## Brand assets (please supply)

* **Official logo** — the end card currently sets the brand name in type (Cormorant Garamond) as a stand-in.
  Put the logo (transparent PNG or SVG) in `public/brand/` and render with
  `--props='{"logoSrc":"brand/logo.png"}'`; it replaces the typeset wordmark.
* **Store and product photos** — the 2006 shop and 2025 studio are drawn as neutral line art because no
  photos were available. Real photos can replace or sit behind the drawing.
* **Partner brands** (Essilor, ZEISS, Martin & Sulo) are deliberately not shown: they should only appear
  with authentic assets and permission.

## Commands

```bash
npm install
npm run score     # synthesises public/audio/score.wav (ambient pads, bells, soft impacts)
npx remotion render Sadori out/sadori.mp4 --gl=angle
```

`src/story.json` holds the cut and hit times shared by picture and score.
Frame designs live in `src/three/Eyewear.tsx` (`FRAMES`), materials in `src/three/materials.ts`.
