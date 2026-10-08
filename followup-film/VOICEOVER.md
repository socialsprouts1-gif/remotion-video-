# Voiceover — English (male, 25–35)

Read it like a founder explaining a problem he has lived through, to one person across the table: confident, a little serious, unhurried, never announcer-ish.
Leave the gaps. The silence at 7.6–9.8s is part of the story: say nothing there.

Each line starts at the time shown, which is where the picture expects it. The times also live in `src/timeline.json` (`voiceover`).

| Start | Line |
|------:|------|
| 0.9s | One lead. |
| 2.3s | One you've already paid for. |
| 5.3s | They message you on WhatsApp… |
| 8.4s | …and the reply? Nothing. |
| 10.7s | A minute. Fifteen minutes. An hour. |
| 14.2s | A whole day. |
| 15.1s | The longer you wait, the weaker the connection. |
| 17.0s | And the customer… goes to someone else. |
| 21.6s | Now multiply that by a hundred leads. |
| 24.6s | Every missed follow-up is revenue you're losing. |
| 27.2s | Leads keep coming. Messages keep coming… |
| 30.3s | Leads aren't the problem. |
| 31.5s | Follow-up speed is. |
| 33.0s | Now imagine every lead gets an instant response. |
| 35.0s | AI qualifies them, follows up, and takes them all the way to a booking. |
| 37.4s | A question, real interest, or silence — every lead finds the right path. Automatically. |
| 41.6s | One system… fully connected. |
| 44.6s | Getting the lead is the beginning. |
| 46.2s | The follow-up is the conversion. |
| 48.2s | Automate your follow-up. |

## Recording tips

- Record dry (no music), 48 kHz WAV, one continuous take or one file per line.
- One file: line it up so the first word lands at 0.9s, put it in `public/audio/voiceover.wav`, and set `AUDIO.voiceover = 'audio/voiceover.wav'` in `src/config.ts`. The score drops to 60 % automatically.
- If the read runs long, move the beat times in `src/timeline.json`. Picture and score both follow, so re-run `npm run score` after editing.
