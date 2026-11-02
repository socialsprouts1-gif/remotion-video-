// All copy and content for the site. Edit here; components only read it.
// Rule: no invented client results. Anything shown inside a demo is labelled
// as sample data on screen.

export const site = {
  name: 'Neuraxine',
  founder: 'Vivek',
  country: 'India',
  hero: {
    eyebrow: 'AI automation agency',
    title: ['Your business,', 'on autopilot.'],
    sub: 'We build AI agents, WhatsApp automation and n8n workflows that answer, book and follow up with your customers while you run the business.',
    primary: 'Book a free automation audit',
    secondary: 'Watch it work',
  },
  // WhatsApp for the floating chat button (country code + number, digits only).
  whatsapp: '918237982569',
  whatsappMessage: 'Hi Neuraxine, I want to automate my business. Can we talk?',
  // API base. Same origin by default (server/index.js serves both).
  api: import.meta.env?.VITE_API_URL || '',
}

// The scroll journey: one customer message travelling through the system.
// `id` matches a node in three/Network.jsx.
export const journey = [
  {
    id: 'wa',
    icon: 'siWhatsapp',
    label: 'WhatsApp',
    title: 'A customer messages you',
    copy: 'At 11:42 pm, while you sleep. Most businesses reply the next morning. By then the customer has booked somewhere else.',
  },
  {
    id: 'ai',
    icon: 'siClaude',
    label: 'AI Agent',
    title: 'The agent understands it',
    copy: 'Hindi, English or Hinglish. It reads the intent, the service, the date, and answers in your tone of voice.',
  },
  {
    id: 'crm',
    icon: 'siHubspot',
    label: 'CRM',
    title: 'The lead is saved',
    copy: 'Name, number, interest and source go straight into your CRM or Google Sheet. No copy-paste, no lost chats.',
  },
  {
    id: 'cal',
    icon: 'siGooglecalendar',
    label: 'Calendar',
    title: 'The slot gets booked',
    copy: 'It checks real availability, books the appointment and sends a payment link if you want one.',
  },
  {
    id: 'fu',
    icon: 'siN8n',
    label: 'Follow-up',
    title: 'Reminders go out on time',
    copy: 'A reminder the day before, a nudge if they go quiet, a review request after the visit. Fewer no-shows.',
  },
  {
    id: 'rep',
    icon: 'siGooglesheets',
    label: 'Report',
    title: 'You see everything',
    copy: 'One daily summary on WhatsApp: chats handled, bookings made, leads that need a human.',
  },
]

export const services = [
  {
    id: 'whatsapp',
    no: '01',
    name: 'WhatsApp AI Agents',
    line: 'A 24/7 assistant on the official WhatsApp Business API that replies, qualifies and books.',
    points: ['Official Meta Cloud API', 'FAQ, booking and payment flows', 'Hands over to a human when needed', 'Broadcasts and drip campaigns'],
    demo: 'WhatsAppDemo',
  },
  {
    id: 'workflows',
    no: '02',
    name: 'n8n Workflow Automation',
    line: 'Your apps talking to each other. Forms, sheets, CRM, email and payments, connected without manual work.',
    points: ['Self-hosted or cloud n8n', 'AI steps inside workflows', 'Error alerts and retries', 'Documented, so you own it'],
    demo: 'WorkflowDemo',
  },
  {
    id: 'leads',
    no: '03',
    name: 'AI Lead-Gen Agents',
    line: 'An agent that finds businesses that match your ideal client, scores them and drafts the first message.',
    points: ['Research from public listings', 'Scoring against your criteria', 'Personalised outreach drafts', 'Pushes to your CRM'],
    demo: 'LeadAgentDemo',
  },
  {
    id: 'saas',
    no: '04',
    name: 'Custom SaaS & Dashboards',
    line: 'When off-the-shelf tools don’t fit, we build the system around how you actually work.',
    points: ['Admin panels and member apps', 'Payments and renewals', 'Automations built in', 'Hosted and maintained'],
    demo: 'SaasDemo',
  },
]

export const process = [
  { title: 'Free audit', copy: 'A 30-minute call. We map where your team loses time to repetitive work.' },
  { title: 'Blueprint', copy: 'A clear plan: what gets automated, which tools, what it costs to run each month.' },
  { title: 'Build & connect', copy: 'We build the agents and workflows and connect them to the tools you already use.' },
  { title: 'Launch & improve', copy: 'Go live, watch the numbers, tune the prompts. You get the docs and full ownership.' },
]

// [label, simple-icons export name]
export const stack = [
  ['WhatsApp', 'siWhatsapp'], ['n8n', 'siN8n'], ['Claude', 'siClaude'], ['Google Sheets', 'siGooglesheets'],
  ['Gmail', 'siGmail'], ['Google Calendar', 'siGooglecalendar'], ['Razorpay', 'siRazorpay'], ['Shopify', 'siShopify'],
  ['HubSpot', 'siHubspot'], ['Zoho', 'siZoho'], ['Calendly', 'siCalendly'], ['Notion', 'siNotion'],
  ['Supabase', 'siSupabase'], ['Make', 'siMake'], ['Zapier', 'siZapier'], ['Airtable', 'siAirtable'],
  ['Meta', 'siMeta'], ['Stripe', 'siStripe'], ['Instagram', 'siInstagram'],
]

// Things that have been built (no metrics claimed).
export const builds = [
  { name: 'WhatsApp automation SaaS', tag: 'Product', copy: 'A multi-tenant platform on Meta Cloud API: chatbots, drip campaigns, appointments and lead inbox.' },
  { name: 'Lead-gen agent system', tag: 'AI agents', copy: 'Agents that research, qualify and draft outreach for service businesses.' },
  { name: 'AI website builder', tag: 'Product', copy: 'Generates complete, styled websites from a short brief.' },
  { name: 'Gym management SaaS', tag: 'Custom SaaS', copy: 'Members, renewals, attendance and payment reminders in one panel.' },
  { name: 'Video captioning pipeline', tag: 'Automation', copy: 'Transcribes, translates and burns styled captions into short-form videos.' },
  { name: 'Cinematic villa reel', tag: 'Creative', copy: 'A code-rendered property film for a villa client.' },
]
