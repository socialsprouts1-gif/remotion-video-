# Neuraxine — Before vs After (Hinglish, 3D)

A 66-second vertical (1080 × 1920, 30 fps) Remotion reel for **@neuraxine**: one business owner, the same day twice.
The "before" day is cold grey with red alerts; the Neuraxine day is black with the NX logo's lime. Real 3D (three.js via
`@remotion/three`): iPhone-style phones with real-looking app screens, extruded WhatsApp / Gmail logos, 3D clock and
calendar tiles, the NX tile, a 3D moon. Hindi voiceover (Kokoro, free TTS) with word-by-word Hinglish captions.

```bash
npm install
node scripts/make_textures.mjs     # phone screens + tiles → public/tex/ (already committed)
npm run render                     # → out/neuraxine-before-after.mp4  (headless: add --browser-executable=/path/to/chrome)
```

## Story

| Voice | Picture |
|---|---|
| Ek hi business. Do alag din. Ek, bina automation ke… aur ek, Neuraxine ke saath. | Split screen: grey half with a flooded lock screen vs lime half with the AI chat; VS badge; labels BINA AUTOMATION / NEURAXINE |
| Subah 9 baje se phone bajna shuru… price kya hai? | 3D red clock, buzzing phone at 9:00, WhatsApp notifications raining in, "50 unread" |
| Reply karte karte dopahar ho gayi… competitor ke paas chale gaye. | Chats list full of unread badges at 1:30 PM; half of the waiting leads turn LOST and slide off to the competitor |
| Raat ko thak kar soye… aur kal phir wahi. | Grey moon, phone laid down at 11:48 PM with 23 unread, "Kal phir wahi." echoing |
| Ab, wahi din, Neuraxine ke saath. | Lime shockwave wipes the grey away; the 3D NX tile spins in: NEURAXINE MODE |
| Har message ka jawab, 3 second mein… | Phone with the AI reply (price, catalogue, location pin), 3D WhatsApp logo, "Reply in 3 sec" |
| Serious leads khud CRM mein save, aur appointment calendar mein book. | Leads CRM filling in, 3D calendar tile (TUE 25), "Booked · Kal 11:00 AM" |
| Follow-ups apne aap jaate hain, aur aap sirf deals close karte ho. | 3D WhatsApp → Gmail → WhatsApp follow-ups (Day 1/3/5), "Deal closed ₹24,999" |
| Raat ko aap so rahe ho, aur business phir bhi chal raha hai. | Lime moon, 1:12 AM chat where the AI confirms an order |
| Pehle, late reply, khoye hue leads, aur tension. Ab, instant reply, saved leads, aur sukoon. | PEHLE / AB columns, each item on its word |
| Comment karo AUTOMATE… Neuraxine ko follow karo. | Real neuraxine profile on the phone, AUTOMATE typed, Follow → Following, NX lockup with www.neuraxine.com |

Business, names and prices inside the story are illustrative.
