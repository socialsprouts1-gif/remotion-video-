// Sample data for the live demos. Every business, price and number here is
// fictional and labelled as a sample on screen.

export const industries = {
  salon: {
    label: 'Salon',
    business: 'Glow Studio',
    noun: 'appointment',
    greeting: 'Hi! Glow Studio mein aapka swagat hai. Main aapki kaise help karun?',
    services: [['Haircut', 400], ['Facial', 1200], ['Hair spa', 900]],
    location: 'Shop 4, MG Road, Pune. Open 10 AM to 9 PM, Tuesday closed.',
  },
  clinic: {
    label: 'Clinic',
    business: 'SmileCare Dental',
    noun: 'appointment',
    greeting: 'Namaste! SmileCare Dental here. Appointment, fees ya location, kya jaanna hai?',
    services: [['Consultation', 300], ['Teeth cleaning', 1500], ['Whitening', 6000]],
    location: '2nd floor, Lotus Plaza, Nashik. Mon to Sat, 9 AM to 8 PM.',
  },
  realestate: {
    label: 'Real estate',
    business: 'Skyline Realty',
    noun: 'site visit',
    greeting: 'Hello! Skyline Realty. Main aapko projects, prices aur site visit mein help kar sakta hoon.',
    services: [['2 BHK site visit', 0], ['3 BHK site visit', 0], ['Plot enquiry', 0]],
    location: 'Sales office: Baner Road, Pune. Site visits daily, 10 AM to 6 PM.',
  },
  ca: {
    label: 'CA firm',
    business: 'Mehta & Co.',
    noun: 'consultation call',
    greeting: 'Hello, Mehta & Co. Chartered Accountants. GST, ITR ya company registration?',
    services: [['GST filing (monthly)', 1500], ['ITR filing', 999], ['Company registration', 7999]],
    location: 'Office 12, Commerce House, Ahmedabad. Mon to Fri, 10 AM to 7 PM.',
  },
  gym: {
    label: 'Gym',
    business: 'IronFit Gym',
    noun: 'trial session',
    greeting: 'Hey! IronFit Gym. Free trial, memberships ya timings, bataiye?',
    services: [['Free trial', 0], ['Monthly membership', 1500], ['Personal training', 4000]],
    location: 'Above Croma, FC Road, Pune. Open 5 AM to 11 PM, all days.',
  },
}

export const days = ['Today', 'Tomorrow', 'Saturday']
export const slots = ['11:00 AM', '4:30 PM', '6:00 PM']

export const rupees = (n) => (n === 0 ? 'Free' : `₹${n.toLocaleString('en-IN')}`)

// ── Workflow demo ────────────────────────────────────────────────
export const workflows = {
  lead: {
    label: 'Website lead → WhatsApp',
    nodes: [
      { app: 'Webhook', title: 'Form submitted', kind: 'trigger', out: { name: 'Rohit Kulkarni', phone: '+91 98•••• 4410', interest: '3 BHK, Baner', budget: '1.2 Cr' } },
      { app: 'OpenAI', title: 'Score the lead', kind: 'ai', out: { score: 82, reason: 'Clear budget, specific location, ready to visit', segment: 'hot' } },
      { app: 'IF', title: 'score ≥ 70', kind: 'logic', out: { branch: 'true', path: 'hot lead' } },
      { app: 'WhatsApp', title: 'Send intro + brochure', kind: 'action', out: { status: 'delivered', template: 'project_intro_v2', attachments: 1 } },
      { app: 'Sheets', title: 'Append to Leads', kind: 'action', out: { sheet: 'Leads 2026', row: 418, updated: true } },
    ],
  },
  order: {
    label: 'New order → review request',
    nodes: [
      { app: 'Shopify', title: 'Order created', kind: 'trigger', out: { order: '#5821', items: 2, total: '₹1,840', city: 'Indore' } },
      { app: 'Code', title: 'Format items', kind: 'logic', out: { summary: 'Cold brew ×2', eta: '3 days' } },
      { app: 'WhatsApp', title: 'Order confirmation', kind: 'action', out: { status: 'read', template: 'order_confirmed' } },
      { app: 'Wait', title: 'Until delivered', kind: 'logic', out: { resumed: 'on delivery webhook' } },
      { app: 'WhatsApp', title: 'Ask for a review', kind: 'action', out: { status: 'delivered', template: 'review_request', link: 'g.page/r/…' } },
    ],
  },
  missed: {
    label: 'Missed call → callback',
    nodes: [
      { app: 'Exotel', title: 'Missed call', kind: 'trigger', out: { from: '+91 97•••• 1203', at: '19:42', duration: '0s' } },
      { app: 'CRM', title: 'Find contact', kind: 'action', out: { found: true, name: 'Sneha P.', lastVisit: '12 Sep' } },
      { app: 'IF', title: 'Existing customer?', kind: 'logic', out: { branch: 'true', path: 'returning' } },
      { app: 'WhatsApp', title: 'Sorry we missed you', kind: 'action', out: { status: 'delivered', buttons: ['Call me back', 'Book online'] } },
      { app: 'Slack', title: 'Alert the front desk', kind: 'action', out: { channel: '#front-desk', posted: true } },
    ],
  },
}

// ── Lead agent demo ──────────────────────────────────────────────
export const leadCategories = {
  Dentists: { parts: [['Smile', 'Pearl', 'Bright', 'Care', 'Dent'], ['Dental Studio', 'Dental Clinic', 'Dentistry', 'Smile Care']], benefit: 'fill appointment slots from WhatsApp enquiries automatically' },
  Gyms: { parts: [['Iron', 'Pulse', 'Core', 'Beast', 'Flex'], ['Fitness', 'Gym', 'Fitness Club', 'Strength Studio']], benefit: 'turn trial enquiries into memberships without chasing every lead by phone' },
  'Interior designers': { parts: [['Studio', 'Nest', 'Urban', 'Form', 'Casa'], ['Interiors', 'Design Co.', 'Spaces', 'Living']], benefit: 'qualify enquiries and book site visits before your team picks up the phone' },
  'CA firms': { parts: [['Shah', 'Mehta', 'Joshi', 'Patel', 'Rao'], ['& Associates', '& Co.', 'Tax Advisors', 'Consultants']], benefit: 'collect client documents and send GST reminders on WhatsApp automatically' },
  'Real estate agents': { parts: [['Prime', 'Sky', 'Key', 'Urban', 'Home'], ['Realty', 'Properties', 'Estates', 'Homes']], benefit: 'answer project enquiries instantly and book site visits 24/7' },
}
export const leadCities = ['Pune', 'Nashik', 'Indore', 'Jaipur', 'Ahmedabad', 'Lucknow']
export const leadAreas = {
  Pune: ['Baner', 'Kothrud', 'Viman Nagar', 'Wakad', 'Aundh'],
  Nashik: ['College Road', 'Gangapur Road', 'Indira Nagar', 'Panchavati', 'Cidco'],
  Indore: ['Vijay Nagar', 'Palasia', 'Rajwada', 'Bhawarkua', 'Sapna Sangeeta'],
  Jaipur: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Mansarovar', 'Raja Park'],
  Ahmedabad: ['Satellite', 'Navrangpura', 'Bopal', 'Prahlad Nagar', 'Maninagar'],
  Lucknow: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Aminabad'],
}

export function seeded(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

export function makeLeads(category, city, n = 6) {
  const rnd = seeded(category + city)
  const { parts } = leadCategories[category]
  const used = new Set()
  const out = []
  while (out.length < n) {
    const name = `${parts[0][(rnd() * parts[0].length) | 0]} ${parts[1][(rnd() * parts[1].length) | 0]}`
    if (used.has(name)) continue
    used.add(name)
    const website = rnd() > 0.45
    const whatsapp = rnd() > 0.25
    const rating = +(3.7 + rnd() * 1.2).toFixed(1)
    const reviews = 20 + ((rnd() * 380) | 0)
    // Higher score = more room to help: busy (many reviews) but weak online booking.
    const score = Math.min(98, Math.round(40 + reviews / 10 + (website ? 0 : 18) + (whatsapp ? 8 : 0) + (rating > 4.4 ? 6 : 0)))
    out.push({ name, area: leadAreas[city][(rnd() * 5) | 0], website, whatsapp, rating, reviews, score })
  }
  return out.sort((a, b) => b.score - a.score)
}

// ── SaaS demo (gym admin) ────────────────────────────────────────
export const members = [
  ['Aarav Shah', 'Monthly', 'Active', 'Today 7:10'],
  ['Isha Kulkarni', 'Quarterly', 'Active', 'Today 6:45'],
  ['Kabir Mehta', 'Monthly', 'Expiring', 'Yesterday'],
  ['Neha Joshi', 'Personal training', 'Active', 'Today 8:30'],
  ['Rohan Patil', 'Monthly', 'Expiring', '3 days ago'],
  ['Sara Khan', 'Annual', 'Active', 'Today 9:05'],
  ['Vikram Rao', 'Monthly', 'Expired', '2 weeks ago'],
  ['Ananya Iyer', 'Quarterly', 'Expiring', 'Today 6:20'],
  ['Dev Malhotra', 'Monthly', 'Active', 'Yesterday'],
]
export const checkins = [4, 18, 31, 22, 9, 6, 5, 7, 12, 26, 38, 29, 14]
export const checkinHours = ['5', '6', '7', '8', '9', '10', '12', '2', '4', '5', '6', '7', '9']
