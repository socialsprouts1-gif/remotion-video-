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

// More services, shown as a bento grid. `demo` picks the micro-animation.
export const moreServices = [
  {
    id: 'voice',
    icon: 'PhoneCall',
    name: 'AI Voice Agents',
    line: 'Answers calls, books appointments and calls back missed leads, in Hindi or English.',
    points: ['Inbound and outbound calls', 'Natural Hindi, English, Hinglish', 'Call summary sent to WhatsApp'],
    demo: 'voice',
    size: 'wide',
  },
  {
    id: 'chatbot',
    icon: 'MessagesSquare',
    name: 'Website AI Chatbot',
    line: 'Trained on your services, prices and FAQs. Captures the lead before the visitor leaves.',
    points: ['Answers from your own documents', 'Hands over to WhatsApp', 'Works on any website'],
    demo: 'chatbot',
  },
  {
    id: 'docs',
    icon: 'ScanText',
    name: 'Document & Invoice Processing',
    line: 'Reads invoices, bills and forms, pulls out the fields and files them where they belong.',
    points: ['PDFs, photos and scans', 'GST numbers, totals, dates', 'Straight into Sheets or Tally'],
    demo: 'docs',
  },
  {
    id: 'content',
    icon: 'CalendarDays',
    name: 'Content & Social Automation',
    line: 'A month of posts planned, written and scheduled from one brief, in your brand voice.',
    points: ['Captions, hooks and hashtags', 'Auto-scheduling to Instagram', 'Weekly performance recap'],
    demo: 'content',
  },
  {
    id: 'crm',
    icon: 'Workflow',
    name: 'CRM & Sales Automation',
    line: 'Every lead gets followed up on time, so deals stop slipping through the cracks.',
    points: ['Lead routing and reminders', 'Email + WhatsApp sequences', 'Pipeline updates without typing'],
    demo: 'crm',
  },
  {
    id: 'web',
    icon: 'LayoutTemplate',
    name: 'AI-Built Websites',
    line: 'Fast, premium websites and landing pages with chat, booking and tracking built in.',
    points: ['Designed for conversions', 'WhatsApp and booking ready', 'Live in days, not months'],
    demo: 'web',
    size: 'full',
  },
]

export const industries = [
  { name: 'Salons & spas', icon: 'Scissors', uses: ['WhatsApp booking', 'No-show reminders', 'Review requests'] },
  { name: 'Clinics & dentists', icon: 'Stethoscope', uses: ['Appointment agent', 'Report delivery', 'Follow-up care'] },
  { name: 'Real estate', icon: 'Building2', uses: ['Lead scoring', 'Site-visit booking', 'Brochure on request'] },
  { name: 'CA & finance firms', icon: 'Landmark', uses: ['Document collection', 'GST reminders', 'Invoice reading'] },
  { name: 'Gyms & studios', icon: 'Dumbbell', uses: ['Trial to membership', 'Renewal reminders', 'Attendance alerts'] },
  { name: 'D2C & e-commerce', icon: 'ShoppingBag', uses: ['Order updates', 'Abandoned-cart nudges', 'Returns on WhatsApp'] },
  { name: 'Coaching & education', icon: 'GraduationCap', uses: ['Admission enquiries', 'Fee reminders', 'Class schedules'] },
  { name: 'Hotels & villas', icon: 'BedDouble', uses: ['Booking enquiries', 'Check-in details', 'Guest concierge'] },
]

export const faqs = [
  { q: 'Do I need the official WhatsApp Business API?', a: 'For automation, yes. We set it up for you on Meta’s Cloud API, including number verification and message templates. You keep full ownership of the number.' },
  { q: 'How long does a typical build take?', a: 'A single focused automation, like a booking agent or a lead workflow, usually takes one to two weeks. Larger systems are planned in phases so something useful goes live early.' },
  { q: 'What does it cost to run each month?', a: 'It depends on message volume and the tools involved. After the audit you get a written estimate of the monthly running cost before anything is built.' },
  { q: 'Will the AI say something wrong to my customers?', a: 'Agents answer only from the facts you approve, and hand over to a person when they’re unsure. Every conversation is logged so you can review it.' },
  { q: 'Can it work with the tools I already use?', a: 'Usually, yes. If a tool has an API, a webhook or even a spreadsheet export, we can connect it. We’ll tell you in the audit if something can’t be done.' },
  { q: 'Do I own what you build?', a: 'Yes. Workflows, code and documentation are handed over to you. We can maintain it on a retainer, but you’re never locked in.' },
]
