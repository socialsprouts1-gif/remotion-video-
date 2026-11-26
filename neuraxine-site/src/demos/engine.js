// Scripted WhatsApp agent. Pure functions, shared by the browser (offline
// fallback) and the server (used when no AI key is configured).
import { industries, days, slots, rupees } from './data.js'

export const homeOptions = (ind) => [`Book ${ind.noun}`, 'Prices', 'Location & timings']

export function greeting(industry) {
  const ind = industries[industry]
  return { replies: [ind.greeting], quick_replies: homeOptions(ind), actions: [], state: {} }
}

// One turn: the latest user text plus the booking state carried between turns.
export function scriptedTurn(industry, text, state = {}) {
  const ind = industries[industry]
  const t = String(text || '').trim()
  const s = t.toLowerCase()
  const next = { ...state }
  const service = ind.services.find((x) => x[0].toLowerCase() === s)

  if (t === 'Start over') return greeting(industry)

  if (service) {
    next.service = service[0]
    return { replies: [`${service[0]} ke liye kaunsa din theek rahega?`], quick_replies: days, actions: [], state: next }
  }
  if (next.service && days.map((d) => d.toLowerCase()).includes(s)) {
    next.day = days.find((d) => d.toLowerCase() === s)
    return {
      replies: [`${next.day} ke available slots:`],
      quick_replies: slots,
      actions: [{ type: 'availability_checked', detail: `${next.day}: ${slots.length} free slots` }],
      state: next,
    }
  }
  if (next.service && next.day && slots.map((x) => x.toLowerCase()).includes(s)) {
    const slot = slots.find((x) => x.toLowerCase() === s)
    const price = ind.services.find((x) => x[0] === next.service)?.[1] ?? 0
    const actions = [
      { type: 'lead_created', detail: `${next.service} · source: WhatsApp` },
      { type: 'slot_booked', detail: `${next.day} ${slot}` },
    ]
    if (price > 0) actions.push({ type: 'payment_link', detail: rupees(price) })
    actions.push({ type: 'reminder_scheduled', detail: '-24h and -2h' })
    return {
      replies: [
        `Done! Aapka ${ind.noun} book ho gaya: ${next.service}, ${next.day} ${slot}.`,
        price > 0 ? `Advance ke liye payment link bhej diya hai (${rupees(price)}).` : 'Koi charge nahi hai, bas time pe aa jaiye.',
        'Ek din pehle reminder aa jayega. Kuch aur?',
      ],
      quick_replies: ['Prices', 'Location & timings', 'Start over'],
      actions,
      state: {},
    }
  }
  if (/^book|slot|appointment|visit|trial|booking|kal |aaj |schedule/.test(s)) {
    return {
      replies: ['Zaroor! Kaunsi service ke liye?'],
      quick_replies: ind.services.map((x) => x[0]),
      actions: [{ type: 'intent_detected', detail: `book_${ind.noun.replace(/ /g, '_')}` }],
      state: {},
    }
  }
  if (/price|rate|kitna|cost|fees|charge/.test(s)) {
    return {
      replies: [ind.services.map((x) => `• ${x[0]}: ${rupees(x[1])}`).join('\n')],
      quick_replies: [`Book ${ind.noun}`, 'Location & timings'],
      actions: [{ type: 'faq_answered', detail: 'prices' }],
      state: next,
    }
  }
  if (/where|location|address|kahan|timing|open|time/.test(s)) {
    return {
      replies: [ind.location],
      quick_replies: [`Book ${ind.noun}`, 'Prices'],
      actions: [{ type: 'faq_answered', detail: 'location' }],
      state: next,
    }
  }
  return {
    replies: ['Iska sahi answer main team se confirm karke thodi der mein bhejti hoon.'],
    quick_replies: homeOptions(ind),
    actions: [{ type: 'handoff_human', detail: 'team notified on WhatsApp' }],
    state: next,
  }
}

// Lead scoring heuristic shared by sample and live lead search.
export function scoreLead({ website, whatsapp, rating, reviews }) {
  return Math.min(98, Math.round(40 + (reviews || 0) / 10 + (website ? 0 : 18) + (whatsapp ? 8 : 0) + ((rating || 0) > 4.4 ? 6 : 0)))
}

export function draftMessage(lead, category, city, benefit) {
  const insight = !lead.website
    ? `${lead.name} doesn't have a website yet, so people who find you on Google can only call`
    : lead.reviews > 150
      ? `you have ${lead.reviews} Google reviews, which usually means a lot of enquiries to answer`
      : `you get steady enquiries but there's no quick way to book on WhatsApp`
  return `Hi ${lead.name} team, I came across you${lead.area ? ` in ${lead.area}` : ''}. I noticed ${insight}. We help ${category.toLowerCase()} in ${city} ${benefit}. Can I send a 2-minute demo video?`
}
