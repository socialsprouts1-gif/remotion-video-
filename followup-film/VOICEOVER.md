# Voiceover — Hindi (male, 25–35)

Read it like a founder explaining a problem he has lived through, to one person across the table: confident, a little serious, unhurried, never announcer-ish.
Leave the gaps. The silence at 7.6–9.8s is part of the story: say nothing there.

Each line starts at the time shown, which is where the picture expects it. The times also live in `src/timeline.json` (`voiceover`).

| Start | Line |
|------:|------|
| 0.9s | एक lead. |
| 2.3s | जिसके लिए आपने पैसे दिए हैं। |
| 5.3s | वो आपको WhatsApp पर message करता है… |
| 8.4s | …और जवाब? कुछ नहीं। |
| 10.7s | एक minute। पंद्रह minute। एक घंटा। |
| 14.2s | पूरा दिन। |
| 15.1s | जितना इंतज़ार, connection उतना कमज़ोर। |
| 17.0s | और customer… किसी और के पास चला गया। |
| 21.6s | अब इसे सौ leads से multiply कीजिए। |
| 24.6s | हर missed follow-up — revenue जो आप खो रहे हैं। |
| 27.2s | Leads आते रहते हैं… messages आते रहते हैं… |
| 30.3s | Leads की कमी नहीं है। |
| 31.5s | Follow-up की speed की कमी है। |
| 33.0s | अब सोचिए — हर lead को instant response मिले। |
| 35.0s | AI qualify करे, follow-up करे, booking तक ले जाए। |
| 37.4s | Question हो, interest हो, या silence — हर lead को सही रास्ता। Automatically। |
| 41.6s | पूरा system… connected। |
| 44.6s | Lead मिलना शुरुआत है। |
| 46.2s | Follow-up ही conversion बनाता है। |
| 48.2s | Automate your follow-up. |

## Recording tips

- Record dry (no music), 48 kHz WAV, one continuous take or one file per line.
- One file: line it up so the first word lands at 0.9s, put it in `public/audio/voiceover.wav`, and set `AUDIO.voiceover = 'audio/voiceover.wav'` in `src/config.ts`. The score drops to 60 % automatically.
- If the read runs long, move the beat times in `src/timeline.json`. Picture and score both follow, so re-run `npm run score` after editing.
