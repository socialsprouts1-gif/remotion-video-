# Asaadix Digital — "What if your Instagram disappeared?" (English, UAE)

A 40-second vertical (1080 × 1920, 30 fps) Remotion reel for **Asaadix Digital** (Dubai), modelled on the
reference reel's structure, in the brand's black-and-gold look: a backlit dark wood-slat wall (as on the logo board),
drifting gold dust, word-by-word captions with gold-gradient key words, dark glass cards, and real 3D:
an iPhone-style phone showing the real @asaadix_digital profile, the real posts as 3D cards, extruded WhatsApp and
Shopify logos, 3D app-icon tiles (Instagram, alerts, website, CRM, chat) and a gold 3D moon. The end card uses the
real logo (with a light sweep), the founder's photo and the services line.

```bash
npm install
node scripts/make_textures.mjs     # phone screens + logo tile → public/tex/ (already committed)
npm run render                     # → out/asaadix-instagram.mp4  (headless: add --browser-executable=/path/to/chrome)
```

## Script → scenes

| Voice | Picture |
|---|---|
| Imagine, if your Instagram account disappears tomorrow, what would happen? | 3D iPhone with the real @asaadix_digital profile spins in; 3D Instagram icon, "Tomorrow · 9:42 AM", the screen glitches to "Sorry, this page isn't available." |
| Your followers, your DMs, years of hard work, everything would be gone with just one click. | Followers and DM chips, the real posts fly out as 3D cards; a cursor clicks, the page disappears, everything falls, black frame: **Gone.** |
| It could get hacked, reported, or disabled for no reason. | Dark: "Account hacked", "Mass reported", "Account disabled" alerts land on each word; "No reason given." |
| Save your data in your own CRM, not on someone else's platform. | "Your CRM" dashboard filling with UAE leads (Website / WhatsApp / Chat App); "Someone else's platform" card gets an ✕; "Saved in your own CRM" |
| And with AI automation and your own chat app, your customers will continue getting responses, even while you're sleeping. | Lead → AI → CRM flow; 3D phone with the business's own chat app answering at 2:47 AM (price, delivery to Abu Dhabi, order confirmed); "Replied in 3 sec", "2:47 AM · you're asleep" |
| Whether Instagram comes or goes, your business will keep running. | Instagram icon appears and fades to grey; Website, CRM (leads ticking up) and Chat App cards stay Live; "Running 24/7" |
| Build your own system. | 3D Asaadix "A" tile, ASAADIX DIGITAL lockup, services, **asaadixdigital.com**, Dubai, UAE |

## Notes

- Brand assets in `public/brand/`: `logo.png`, `mark.png`, `services.png` (cut from the supplied logo board with the dark
  board removed), `avatar.png` (profile photo). Real profile and posts in `public/screens/` and `public/posts/`.
- The chat-app conversation, CRM names and numbers are illustrative.
- Voice: Kokoro (free, open-source TTS), voice `am_michael`; script in `scripts/make_voiceover.py`. Timing follows the voice.
