// Express app factory. Dependencies are injected so tests can swap them.
import express from 'express'
import { z } from 'zod'
import { industries, days, slots, leadCategories, leadCities, workflows } from '../src/demos/data.js'
import { scriptedTurn, greeting } from '../src/demos/engine.js'
import { aiChatTurn, createAI } from './ai.js'
import { createMemoryStore } from './store.js'
import { rateLimit } from './rateLimit.js'
import { searchLeads } from './leads.js'
import { runWorkflow } from './workflow.js'

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

export function createApp({ env = process.env, ai = createAI(env), store = createMemoryStore(), fetchImpl = fetch, limits = {} } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '32kb' }))

  const started = Date.now()
  const services = () => ({
    ai: Boolean(ai),
    places: Boolean(env.GOOGLE_PLACES_API_KEY),
    webhook: Boolean(env.N8N_WEBHOOK_URL),
  })

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, status: 'operational', uptime_s: Math.round((Date.now() - started) / 1000), services: services() })
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
