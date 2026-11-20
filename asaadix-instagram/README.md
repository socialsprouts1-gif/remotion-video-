# Asaadix Digital — "What if your Instagram disappeared?" (English, UAE)

A 40-second vertical (1080 × 1920, 30 fps) Remotion reel for **Asaadix Digital** (Dubai), modelled on the
reference reel's structure: light and dark scenes alternate, word-by-word captions sit at the top with key words
in gold, and UI cards plus a 3D phone tell the story. Brand look: black, gold and warm cream.

```bash
npm install
node scripts/make_textures.mjs     # phone screens + logo tile → public/tex/ (already committed)
npm run render                     # → out/asaadix-instagram.mp4  (headless: add --browser-executable=/path/to/chrome)
```

## Script → scenes

| Voice | Picture |
|---|---|
| Imagine, if your Instagram account disappears tomorrow, what would happen? | 3D phone with a sample Dubai boutique's Instagram (bloom.abaya.dubai); Instagram icon, "Tomorrow · 9:42 AM" chip, the screen glitches to "Sorry, this page isn't available." |
| Your followers, your DMs, years of hard work, everything would be gone with just one click. | Followers counter, three DM chips, posts flying out; a cursor clicks, the page disappears, everything falls, black frame: **Gone.** |
| It could get hacked, reported, or disabled for no reason. | Dark: "Account hacked", "Mass reported", "Account disabled" alerts land on each word; "No reason given." |
| Save your data in your own CRM, not on someone else's platform. | "Your CRM" dashboard filling with UAE leads (Website / WhatsApp / Chat App); "Someone else's platform" card gets an ✕; "Saved in your own CRM" |
| And with AI automation and your own chat app, your customers will continue getting responses, even while you're sleeping. | Lead → AI → CRM flow; 3D phone with the business's own chat app answering at 2:47 AM (price, delivery to Abu Dhabi, order confirmed); "Replied in 3 sec", "2:47 AM · you're asleep" |
| Whether Instagram comes or goes, your business will keep running. | Instagram icon appears and fades to grey; Website, CRM (leads ticking up) and Chat App cards stay Live; "Running 24/7" |
| Build your own system. | 3D Asaadix "A" tile, ASAADIX DIGITAL lockup, services, **asaadixdigital.com**, Dubai, UAE |

## Notes

- The "A" mark is redrawn in vector from the Instagram avatar (`src/components/AsaadixLogo.tsx`). Swap in the original
  logo file when available (`public/tex/mark.png` for the 3D tile, the component for 2D).
- The boutique, names, prices and numbers are illustrative.
- Voice: Kokoro (free, open-source TTS), voice `am_michael`; script in `scripts/make_voiceover.py`. Timing follows the voice.
