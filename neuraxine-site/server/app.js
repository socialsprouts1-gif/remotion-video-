// Express app factory. Dependencies are injected so tests can swap them.
import express from 'express'
import { z } from 'zod'
import { industries, days, slots, leadCategories, leadCities, workflows } from '../src/demos/data.js'
import { scriptedTurn, greeting } from '../src/demos/engine.js'
import { aiChatTurn, createAI } from './ai.js'
import { createStore } from './store.js'
import { rateLimit } from './rateLimit.js'
import { searchLeads } from './leads.js'
import { runWorkflow } from './workflow.js'

const Contact = z.object({
  name: z.string().trim().min(2).max(80),
  business: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[\d\s-]{8,18}$/, 'Enter a valid phone number'),
  needs: z.array(z.string().max(40)).max(6).default([]),
  website: z.string().max(0).optional(), // honeypot: must stay empty
})

const Chat = z.object({
  industry: z.enum(Object.keys(industries)),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().min(1).max(500) })).min(1).max(24),
  state: z.object({ service: z.string().max(60).optional(), day: z.string().max(20).optional() }).default({}),
})

const LeadSearch = z.object({ category: z.enum(Object.keys(leadCategories)), city: z.enum(leadCities) })
const WorkflowRun = z.object({
  template: z.enum(Object.keys(workflows)),
  input: z.record(z.string(), z.string().max(120)).optional(),
})

const bad = (res, err) => res.status(400).json({ ok: false, error: err.issues?.[0]?.message || 'Invalid request', issues: err.issues })

export function createApp({ env = process.env, ai = createAI(env), store = createStore(env.DATA_DIR || 'data'), fetchImpl = fetch, limits = {} } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '32kb' }))

  const started = Date.now()
  const services = () => ({
    ai: Boolean(ai),
    places: Boolean(env.GOOGLE_PLACES_API_KEY),
    webhook: Boolean(env.N8N_WEBHOOK_URL),
    email: Boolean(env.RESEND_API_KEY && env.LEAD_EMAIL_TO),
  })

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, status: 'operational', uptime_s: Math.round((Date.now() - started) / 1000), services: services() })
  })

  app.post('/api/contact', rateLimit({ windowMs: 10 * 60e3, max: limits.contact ?? 5 }), async (req, res) => {
    const parsed = Contact.safeParse(req.body)
    if (!parsed.success) return bad(res, parsed.error)
    const { website, ...lead } = parsed.data
    const row = await store.append('contacts', { ...lead, source: 'website', ua: req.get('user-agent')?.slice(0, 200) })
    const delivered = { stored: true, webhook: false, email: false }

    const jobs = []
    if (env.N8N_WEBHOOK_URL)
      jobs.push(
        fetchImpl(env.N8N_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'audit.requested', ...row }), signal: AbortSignal.timeout(8000) })
          .then((r) => (delivered.webhook = r.ok))
          .catch((e) => console.warn('[contact] webhook failed:', e.message)),
      )
    if (env.RESEND_API_KEY && env.LEAD_EMAIL_TO)
      jobs.push(
        fetchImpl('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
          body: JSON.stringify({
            from: env.LEAD_EMAIL_FROM || 'Neuraxine <onboarding@resend.dev>',
            to: env.LEAD_EMAIL_TO,
            subject: `New audit request: ${lead.business}`,
            text: `Name: ${lead.name}\nBusiness: ${lead.business}\nWhatsApp: ${lead.phone}\nWants: ${lead.needs.join(', ') || '-'}\n`,
          }),
          signal: AbortSignal.timeout(8000),
        })
          .then((r) => (delivered.email = r.ok))
          .catch((e) => console.warn('[contact] email failed:', e.message)),
      )
    await Promise.all(jobs)
    res.status(201).json({ ok: true, id: row.id, delivered })
  })

  app.get('/api/agent/greeting', (req, res) => {
    const industry = industries[req.query.industry] ? req.query.industry : 'salon'
    res.json({ ok: true, mode: ai ? 'ai' : 'scripted', ...greeting(industry) })
  })

  app.post('/api/agent/chat', rateLimit({ windowMs: 10 * 60e3, max: limits.chat ?? 60 }), async (req, res) => {
    const parsed = Chat.safeParse(req.body)
    if (!parsed.success) return bad(res, parsed.error)
    const { industry, messages, state } = parsed.data
    const last = messages[messages.length - 1]
    if (last.role !== 'user') return res.status(400).json({ ok: false, error: 'Last message must be from the user' })

    const ind = industries[industry]
    const aiTurn = await aiChatTurn(ai, { ind, days, slots, messages })
    if (aiTurn) return res.json({ ok: true, mode: 'ai', ...aiTurn, state: {} })
    res.json({ ok: true, mode: 'scripted', ...scriptedTurn(industry, last.text, state) })
  })

  app.post('/api/leads/search', rateLimit({ windowMs: 10 * 60e3, max: limits.leads ?? 15 }), async (req, res) => {
    const parsed = LeadSearch.safeParse(req.body)
    if (!parsed.success) return bad(res, parsed.error)
    res.json({ ok: true, ...(await searchLeads({ ...parsed.data, ai, env, fetchImpl })) })
  })

  app.post('/api/workflow/run', rateLimit({ windowMs: 10 * 60e3, max: limits.workflow ?? 30 }), async (req, res) => {
    const parsed = WorkflowRun.safeParse(req.body)
    if (!parsed.success) return bad(res, parsed.error)
    res.json({ ok: true, ...(await runWorkflow({ ...parsed.data, ai, env, store, fetchImpl })) })
  })

  app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'Not found' }))
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[server]', err)
    res.status(err.type === 'entity.parse.failed' ? 400 : 500).json({ ok: false, error: err.type === 'entity.parse.failed' ? 'Invalid JSON' : 'Server error' })
  })
  return app
}
