# Neuraxine — Before vs After, editorial motion-graphics edition

Same Hinglish script and voice as `../neuraxine-before-after`, rebuilt in the style of the supplied reference reel:
cream "editorial poster" scenes alternating with dark rim-lit scenes, condensed headline type, a 3D hero object
on every beat, design-tool selection boxes, pill tags, wrapping word-tape, film strip, barcode and micro-text.

```bash
npm install
npm run render     # → out/neuraxine-editorial.mp4  (headless: add --browser-executable=/path/to/chrome)
```

## 3D hero objects (all built in three.js, `src/three/kit.tsx`)

iPhone-style phones with real-looking app screens, chess king and pawn (copper / silver / lime metal), chrome trophy,
glass light bulb that switches on, hourglass with flowing sand, moon, extruded WhatsApp and Gmail logos, calendar tile,
NX logo tile.

## Scenes

| Line | Look | Hero |
|---|---|---|
| Ek hi business. Do alag din… | dark, red/lime split rim light | two phones (flooded vs AI), VS |
| Subah 9 baje… price kya hai? | cream | phone in selection box, "50 UNREAD" count-up, pills |
| Reply karte karte dopahar… competitor | dark, red | hourglass + silver king, red "COMPETITOR" / "LEADS LOST" tape, "4 GHANTE" |
| Raat ko thak kar soye… kal phir wahi | dark | film strips, phone laid down, grey moon, "11:48 PM · 23 UNREAD" |
| Ab, wahi din, Neuraxine ke saath | cream | light bulb switches on, NX logo, "NEURAXINE MODE: ON" |
| Har message ka jawab, 3 second mein… | cream | AI chat phone in selection box, 3D WhatsApp, "3 SEC", ✓ pills |
| Serious leads khud CRM mein… calendar | cream | Leads CRM card, 3D calendar, "BOOKED" |
| Follow-ups apne aap… deals close | dark, lime | lime king beats silver pawn, 3D WhatsApp/Gmail, "DEAL CLOSED" tape, ₹24,999 |
| Raat ko aap so rahe ho… | dark, lime | AI chat at 1:12 AM, lime moon, "Order confirmed" |
| Pehle… Ab… | cream | chrome trophy, PEHLE (struck) vs AB columns |
| Comment karo AUTOMATE… follow | dark → lime | real neuraxine profile, AUTOMATE typed, Follow, NX lockup |

Fonts: Archivo (condensed headlines, SIL OFL), Inter, Instrument Serif. Business, names and prices are illustrative.
