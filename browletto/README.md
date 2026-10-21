# BROWLETTO Cafe, Akola — launch ad (Remotion)

A 25-second premium café ad built from the café's own photos.
Two compositions share every scene:

| Composition | Size | For |
|---|---|---|
| `Browletto` | 1080×1920, 9:16 | Instagram Reels, Stories, WhatsApp Status |
| `BrowlettoWide` | 1920×1080, 16:9 | YouTube, café display screen |

## Storyboard

| Time | Scene | Text |
|---|---|---|
| 0–3.2 s | Dark coffee backdrop, golden motes, a light streak writes the 3D BROWLETTO wordmark | AKOLA, ARE YOU READY? |
| 3.2–7.4 s | Whip into the real storefront: push-in toward the sign, parallax on the sign band, warm light sweep | YOUR NEW / Favourite Hangout · BROWLETTO CAFE · AKOLA |
| 7.4–11 s | Whip up into the interior: forward dolly through the café, neon wall photo slides in | GOOD VIBES. COZY SPACES. → Great Taste. |
| 11–17 s | Menu, one item per two beats: Thick Shakes, Brownies, Coffee, Waffles & Ice Cream, Snacks | Product names |
| 17–21.2 s | Storefront hero: rack focus, slow push-in, sign light sweep | YOUR CRAVINGS. / Your Place. · COME EXPERIENCE BROWLETTO. |
| 21.2–25 s | End card: wordmark letters tip into place | Thick Shakes · Ice Cream · Brownies · Coffee · Waffles · Snacks · AKOLA, MAHARASHTRA · Meet you at Browletto. |

The menu visuals are illustrated vector graphics, not photographs. No phone number, address, website or offer is shown.

## Structure

```
photos-src/            original uploads (storefront, interior, neon wall)
scripts/prep_photos.py upscales them into public/photos/*.jpg
scripts/make_score.py  synthesises public/audio/score.wav (100 BPM café groove, whooshes, impacts, café ambience)
src/story.json         scene times, menu beats, sound hits (shared by picture and score)
src/tokens.ts          colour palette + fonts
src/components/Kit.tsx reusable typography (Line, Extruded, Kicker, Rule), Photo / Backdrop / Sweep, Motes, Bean, Shell transitions
src/components/Menu.tsx menu illustrations
src/Film.tsx           the six scenes; layouts switch on aspect ratio
```

## Render

```bash
npm install
npm run photos     # after replacing photos in photos-src/
npm run score
npx remotion render Browletto out/browletto-9x16.mp4
npx remotion render BrowlettoWide out/browletto-16x9.mp4
```

Higher-resolution photos (ideally 2000 px or more on the long side), real food photos and the logo file
will all make this sharper: drop them into `photos-src/` with the same names and re-run.
