// Claude calls. Every function returns null when AI is unavailable or the
// model declines, so routes can fall back to the scripted engine.
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

export const MODEL = 'claude-opus-5-5'

export function createAI(env = process.env) {
  if (!env.ANTHROPIC_API_KEY) return null
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: 30_000, maxRetries: 1 })
}

const ACTION_TYPES = ['intent_detected', 'availability_checked', 'lead_created', 'slot_booked', 'payment_link', 'reminder_scheduled', 'faq_answered', 'handoff_human']

const ChatTurn = z.object({
  reply: z.string(),
  quick_replies: z.array(z.string()),
  actions: z.array(z.object({ type: z.enum(ACTION_TYPES), detail: z.string() })),
})

async function parse(ai, { system, messages, schema, maxTokens = 4000 }) {
  try {
    const res = await ai.messages.parse({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
      output_config: { effort: 'low', format: zodOutputFormat(schema) },
    })
    if (res.stop_reason === 'refusal' || !res.parsed_output) return null
    return res.parsed_output
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn('[ai] rate limited')
    else if (err instanceof Anthropic.AuthenticationError) console.warn('[ai] invalid ANTHROPIC_API_KEY')
    else if (err instanceof Anthropic.APIError) console.warn(`[ai] API error ${err.status}: ${err.message}`)
    else console.warn('[ai] request failed:', err?.message)
    return null
  }
}

export function chatSystemPrompt(ind, days, slots) {
  const menu = ind.services.map(([n, p]) => `- ${n}: ${p === 0 ? 'free' : `₹${p}`}`).join('\n')
  return `You are the WhatsApp assistant for ${ind.business}, a ${ind.label.toLowerCase()} in India. This is a live demo on the Neuraxine website, so keep it realistic and short.

Business facts (use only these, never invent others):
${menu}
Location and hours: ${ind.location}
Bookable days: ${days.join(', ')}. Free slots each day: ${slots.join(', ')}.

How to reply:
- Answer in the customer's language. If they write Hinglish, reply in natural Hinglish.
- One or two short WhatsApp-style sentences. No markdown headings.
- To book a ${ind.noun} you need a service, a day and a slot. Ask for whatever is missing, one thing at a time.
- When all three are known, confirm the booking. Say a payment link has been sent only for paid services.
- quick_replies: up to 3 short tap options that move the conversation forward (service names, days, or slots from the lists above).
- actions: log what the system did this turn, using the allowed types. Booking confirmed means lead_created, slot_booked, reminder_scheduled, and payment_link for paid services. Anything you cannot answer from the facts means handoff_human.`
}

export async function aiChatTurn(ai, { ind, days, slots, messages }) {
  if (!ai) return null
  const out = await parse(ai, {
    system: chatSystemPrompt(ind, days, slots),
    messages: messages.map((m) => ({ role: m.role, content: m.text })),
    schema: ChatTurn,
  })
  if (!out) return null
  return { replies: [out.reply], quick_replies: out.quick_replies.slice(0, 3), actions: out.actions.slice(0, 5) }
}

const LeadScore = z.object({ score: z.number(), segment: z.enum(['hot', 'warm', 'cold']), reason: z.string() })

export async function aiScoreLead(ai, lead) {
  if (!ai) return null
  const out = await parse(ai, {
    system: 'You qualify inbound real-estate leads for an Indian agency. Score 0-100 for purchase intent and readiness. Reason: one sentence.',
    messages: [{ role: 'user', content: JSON.stringify(lead) }],
    schema: LeadScore,
    maxTokens: 2000,
  })
  return out ? { ...out, score: Math.max(0, Math.min(100, Math.round(out.score))) } : null
}

const Drafts = z.object({ drafts: z.array(z.object({ name: z.string(), message: z.string() })) })

export async function aiDraftOutreach(ai, { leads, category, city, benefit }) {
  if (!ai || !leads.length) return null
  const out = await parse(ai, {
    system: `You write first-touch WhatsApp messages for Neuraxine, an AI automation agency. The offer: we help ${category.toLowerCase()} in ${city} ${benefit}. Each message: under 60 words, warm, specific to the business using only the given facts, ends with a soft question. No emojis, no exaggerated claims.`,
    messages: [{ role: 'user', content: JSON.stringify(leads.map((l) => ({ name: l.name, area: l.area, rating: l.rating, reviews: l.reviews, has_website: l.website }))) }],
    schema: Drafts,
  })
  return out ? Object.fromEntries(out.drafts.map((d) => [d.name, d.message])) : null
}
