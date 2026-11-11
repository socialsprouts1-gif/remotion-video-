import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { createApp } from '../app.js'
import { createStore } from '../store.js'

let dir, store
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nx-'))
  store = createStore(dir)
})

const okFetch = (calls) => async (url, init) => {
  calls.push({ url, body: init?.body ? JSON.parse(init.body) : null })
  return { ok: true, status: 200, json: async () => ({}) }
}

// Minimal stand-in for the Anthropic client: messages.parse returns a fixed turn.
const fakeAI = (parsed_output, stop_reason = 'end_turn') => ({
  messages: { parse: async () => ({ stop_reason, parsed_output }) },
})

describe('GET /api/health', () => {
  it('reports which services are configured', async () => {
    const app = createApp({ env: { N8N_WEBHOOK_URL: 'https://hook' }, ai: null, store })
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true, status: 'operational', services: { ai: false, places: false, webhook: true, email: false } })
  })
})

describe('POST /api/contact', () => {
  const valid = { name: 'Priya Sharma', business: 'Dental clinic, Pune', phone: '+91 98765 43210', needs: ['WhatsApp agent'] }

  it('rejects invalid input with a readable error', async () => {
    const app = createApp({ env: {}, ai: null, store })
    const res = await request(app).post('/api/contact').send({ ...valid, phone: 'abc' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/phone/i)
  })

  it('stores the lead and forwards it to the webhook and email', async () => {
    const calls = []
    const app = createApp({ env: { N8N_WEBHOOK_URL: 'https://hook.example', RESEND_API_KEY: 'k', LEAD_EMAIL_TO: 'me@x.com' }, ai: null, store, fetchImpl: okFetch(calls) })
    const res = await request(app).post('/api/contact').send(valid)
    expect(res.status).toBe(201)
    expect(res.body.delivered).toEqual({ stored: true, webhook: true, email: true })
    const rows = await store.list('contacts')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ name: 'Priya Sharma', phone: '+91 98765 43210' })
    expect(calls.map((c) => c.url)).toEqual(['https://hook.example', 'https://api.resend.com/emails'])
    expect(calls[0].body.event).toBe('audit.requested')
  })

  it('silently drops honeypot submissions', async () => {
    const app = createApp({ env: {}, ai: null, store })
    const res = await request(app).post('/api/contact').send({ ...valid, website: 'spam.com' })
    expect(res.status).toBe(400) // honeypot must be empty: schema rejects
    expect(await store.list('contacts')).toHaveLength(0)
  })

  it('rate limits repeated submissions', async () => {
    const app = createApp({ env: {}, ai: null, store, limits: { contact: 2 } })
    await request(app).post('/api/contact').send(valid)
    await request(app).post('/api/contact').send(valid)
    const res = await request(app).post('/api/contact').send(valid)
    expect(res.status).toBe(429)
  })
})

describe('POST /api/agent/chat', () => {
  it('runs a full booking in scripted mode without an AI key', async () => {
    const app = createApp({ env: {}, ai: null, store })
    const say = async (text, state) => (await request(app).post('/api/agent/chat').send({ industry: 'salon', messages: [{ role: 'user', text }], state })).body
    const a = await say('Book appointment')
    expect(a.mode).toBe('scripted')
    expect(a.quick_replies).toContain('Haircut')
    const b = await say('Haircut', a.state)
    const c = await say('Tomorrow', b.state)
    expect(c.quick_replies).toContain('4:30 PM')
    const d = await say('4:30 PM', c.state)
    expect(d.actions.map((x) => x.type)).toEqual(['lead_created', 'slot_booked', 'payment_link', 'reminder_scheduled'])
    expect(d.replies[0]).toMatch(/Haircut, Tomorrow 4:30 PM/)
  })

  it('answers price questions typed in Hinglish', async () => {
    const app = createApp({ env: {}, ai: null, store })
    const res = await request(app).post('/api/agent/chat').send({ industry: 'clinic', messages: [{ role: 'user', text: 'cleaning ka price kitna hai?' }] })
    expect(res.body.replies[0]).toMatch(/Teeth cleaning: ₹1,500/)
  })

  it('uses Claude when configured', async () => {
    const ai = fakeAI({ reply: 'Haircut ke liye kaunsa din?', quick_replies: ['Today', 'Tomorrow', 'Saturday', 'Extra'], actions: [{ type: 'intent_detected', detail: 'book' }] })
    const app = createApp({ env: {}, ai, store })
    const res = await request(app).post('/api/agent/chat').send({ industry: 'salon', messages: [{ role: 'user', text: 'haircut book karna hai' }] })
    expect(res.body).toMatchObject({ mode: 'ai', replies: ['Haircut ke liye kaunsa din?'] })
    expect(res.body.quick_replies).toHaveLength(3)
  })

  it('falls back to the scripted engine when the model declines', async () => {
    const app = createApp({ env: {}, ai: fakeAI(null, 'refusal'), store })
    const res = await request(app).post('/api/agent/chat').send({ industry: 'gym', messages: [{ role: 'user', text: 'timing kya hai' }] })
    expect(res.body.mode).toBe('scripted')
    expect(res.body.replies[0]).toMatch(/FC Road/)
  })

  it('validates the industry', async () => {
    const app = createApp({ env: {}, ai: null, store })
    const res = await request(app).post('/api/agent/chat').send({ industry: 'bank', messages: [{ role: 'user', text: 'hi' }] })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/leads/search', () => {
  it('returns scored sample leads with drafts when Places is not configured', async () => {
    const app = createApp({ env: {}, ai: null, store })
    const res = await request(app).post('/api/leads/search').send({ category: 'Dentists', city: 'Pune' })
    expect(res.body.mode).toBe('sample')
    expect(res.body.leads).toHaveLength(6)
    const scores = res.body.leads.map((l) => l.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
    expect(res.body.leads[0].draft).toMatch(/dentists in Pune/)
  })

  it('maps real Google Places results in live mode', async () => {
    const calls = []
    const fetchImpl = async (url, init) => {
      calls.push({ url, headers: init.headers, body: JSON.parse(init.body) })
      return {
        ok: true,
        json: async () => ({
          places: [{ displayName: { text: 'Bright Smile Dental' }, formattedAddress: 'Shop 2, Baner Road, Baner, Pune, Maharashtra 411045, India', rating: 4.7, userRatingCount: 212, nationalPhoneNumber: '098765 43210', googleMapsUri: 'https://maps.google.com/?cid=1' }],
        }),
      }
    }
    const app = createApp({ env: { GOOGLE_PLACES_API_KEY: 'key' }, ai: null, store, fetchImpl })
    const res = await request(app).post('/api/leads/search').send({ category: 'Dentists', city: 'Pune' })
    expect(res.body.mode).toBe('live')
    expect(calls[0].body.textQuery).toBe('Dentists in Pune')
    expect(calls[0].headers['X-Goog-Api-Key']).toBe('key')
    expect(res.body.leads[0]).toMatchObject({ name: 'Bright Smile Dental', website: false, whatsapp: true, reviews: 212 })
  })
})

describe('POST /api/workflow/run', () => {
  it('executes every node of the lead workflow and writes the row', async () => {
    const app = createApp({ env: {}, ai: null, store })
    const res = await request(app).post('/api/workflow/run').send({ template: 'lead', input: { name: 'Test Lead', budget: '90L', interest: '2 BHK', phone: '+91 9876543210' } })
    expect(res.body.nodes).toHaveLength(5)
    expect(res.body.nodes.every((n) => n.status === 'done')).toBe(true)
    expect(res.body.nodes[1].out.engine).toBe('rules')
    expect(await store.list('workflow-leads')).toHaveLength(1)
  })

  it('recognises a returning caller in the missed-call workflow', async () => {
    const app = createApp({ env: {}, ai: null, store })
    await store.append('contacts', { name: 'Sneha P', phone: '+91 97000 01203' })
    const res = await request(app).post('/api/workflow/run').send({ template: 'missed' })
    expect(res.body.nodes[1].out).toEqual({ found: true, name: 'Sneha P' })
  })

  it('posts to the n8n webhook when configured', async () => {
    const calls = []
    const app = createApp({ env: { N8N_WEBHOOK_URL: 'https://n8n.example/webhook/x' }, ai: null, store, fetchImpl: okFetch(calls) })
    const res = await request(app).post('/api/workflow/run').send({ template: 'order' })
    expect(calls[0].body.event).toBe('order.confirmed')
    expect(res.body.nodes[2].live).toBe(true)
  })
})
