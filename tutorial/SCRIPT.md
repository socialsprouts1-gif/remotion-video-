# Neura Chat — complete setup tutorial (script)

3:02 · 1920×1080 (16:9, for YouTube / website / LinkedIn) · English.
The on-screen captions already carry the whole tutorial, so it works muted. To add a voice, record the lines below at their start times
(the captions are this script), save as `public/audio/voiceover.wav`, set `AUDIO.voiceover` in `src/config.ts`, and re-render. The music ducks automatically.

| Time | Shot | Narration / caption |
|-----:|------|---------------------|
| 0:00.5 | Intro | Welcome to Neura Chat. In the next three minutes we'll go from the homepage to your first connected WhatsApp number, in five steps. |
| 0:11.0 | Step 1 | Step 1: Explore the homepage. |
| 0:14.0 | home | This is the Neura Chat homepage: neurachat.in |
| 0:17.5 | home | Neura Chat turns WhatsApp into your sales machine: AI replies, campaigns and follow-ups, with no code. |
| 0:22.5 | home | AI chatbots, bulk campaigns, a built-in CRM, auto follow-ups and analytics. |
| 0:27.5 | home | On the right: what an AI conversation looks like to your customer on WhatsApp. |
| 0:32.5 | home | The menu takes you to Features, Pricing, Use Cases, Integrations and Docs. |
| 0:36.0 | home | Next, let's see what Neura Chat connects with. |
| 0:39.0 | Step 2 | Step 2: See the integrations. |
| 0:42.0 | integrations-home | Scroll down to Integrations: Neura Chat connects with your entire stack. |
| 0:45.0 | integrations-home | It runs on the official WhatsApp Cloud API, through Meta's Business Platform. |
| 0:49.0 | integrations-home | AI replies can be powered by Claude, OpenAI or Gemini. |
| 0:53.0 | integrations-home | Shopify and WooCommerce for orders, Razorpay and Stripe for payments, plus shipping, Sheets and CRM sync. |
| 0:57.0 | integrations-home | And Zapier, n8n, Calendly, Twilio and webhooks for everything else. |
| 1:01.0 | Step 3 | Step 3: Start your free trial. |
| 1:04.0 | cta | Ready? On the homepage, click 'Start 7-day free trial'. |
| 1:11.5 | register | The sign-up page opens. Create your account in three quick steps. |
| 1:14.5 | register | 1. Personal details   2. Verify your number   3. Set a password. |
| 1:18.5 | register | Sign up with Google in one click, or fill in your details below. |
| 1:21.5 | register | Enter your first and last name, |
| 1:23.8 | register | your work email, |
| 1:25.8 | register | and your company name. |
| 1:27.8 | register | Click Continue, verify your number, set a password, and you're in. |
| 1:32.0 | Step 4 | Step 4: Your dashboard. |
| 1:35.0 | dashboard | Welcome to your dashboard: your whole WhatsApp business in one place. |
| 1:38.0 | dashboard | The overview shows that your number is connected and how many bots are running. |
| 1:42.5 | dashboard | Messages sent and received, open conversations, and the share answered automatically. |
| 1:47.0 | dashboard | Quick cards for messages, contacts and active bots. |
| 1:51.0 | dashboard | The sidebar has it all: Inbox, WhatsApp Numbers, Leads, Drip Campaigns, Reminders, Appointments... |
| 1:55.5 | dashboard | To connect your WhatsApp number, open Integrations. |
| 2:01.0 | Step 5 | Step 5: Connect your WhatsApp number. |
| 2:04.0 | integrations-dash | Find the WhatsApp Business card. |
| 2:07.0 | integrations-dash | A number can be on the WhatsApp app or the Cloud API, not both. Moving it over clears its chat history on the phone. |
| 2:11.2 | integrations-dash | Click Configure. |
| 2:14.0 | modal | Choose 'Connect through Meta'. Meta walks you through it; no IDs or tokens to copy. |
| 2:18.0 | modal | 'Connect WhatsApp' keeps an existing WhatsApp Business number. 'Use a brand new number' is for a fresh one. |
| 2:22.0 | click-connect | Click 'Connect WhatsApp'. |
| 2:24.4 | opening-meta | Meta opens in a new window. |
| 2:26.5 | consent | Log in with Facebook and click Continue to link your Meta business account. |
| 2:29.0 | phone | Now add your WhatsApp phone number. |
| 2:31.5 | phone | Choose 'Enter a new phone number', pick your country code and type the number. |
| 2:34.5 | phone | Choose how to get your verification code: text message or phone call. Then click Next. |
| 2:37.5 | verify | Meta sends a 6-digit code by SMS or call. Enter it to verify the number. |
| 2:39.4 | verify | Confirm the remaining prompts in the Meta window. |
| 2:41.1 | verify | Done. Neura Chat receives your number's credentials automatically. |
| 2:43.0 | connected | Back in Neura Chat, WhatsApp Business now shows Connected. You're live. |
| 2:50.4 | Outro | You're all set: homepage, integrations, free trial, dashboard and your WhatsApp number. Start your 7-day free trial at neurachat.in. |

## What is real footage and what is motion graphics

- Real screenshots: homepage, homepage integrations section, sign-up page, dashboard (dark), integrations page (light).
- Real screen recording: Integrations → WhatsApp Business → Connect through Meta → Meta consent → "Add your WhatsApp phone number".
  The recording ended there (it switched to Instagram at ~13.5s), so the last part, entering the 6-digit code and finishing in Meta,
  is a motion-graphics illustration with a sample code. It ends on the real "Connected" state of the WhatsApp Business card.
- Privacy: the account e-mail in the dashboard header is softly blurred (`blur` rects in `src/tutorial.json`).
