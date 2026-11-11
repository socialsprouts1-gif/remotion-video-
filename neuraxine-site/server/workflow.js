// Executes the demo workflows server-side and reports real per-node timings.
import { workflows } from '../src/demos/data.js'
import { aiScoreLead } from './ai.js'

function heuristicScore(lead) {
  let score = 40
  if (lead.budget) score += 20
  if (/\d\s*bhk|plot|villa/i.test(lead.interest || '')) score += 15
  if ((lead.phone || '').replace(/\D/g, '').length >= 10) score += 10
  score = Math.min(95, score)
  return { score, segment: score >= 70 ? 'hot' : score >= 50 ? 'warm' : 'cold', reason: 'Rule-based score: budget, specific requirement and a valid phone number.' }
}

async function postWebhook(url, payload, fetchImpl) {
  if (!url) return { delivered: false, note: 'Set N8N_WEBHOOK_URL to send this step to your n8n workflow.' }
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  })
  return { delivered: res.ok, status: res.status }
}

export async function runWorkflow({ template, input, ai, env, store, fetchImpl }) {
  const wf = workflows[template]
  const results = []
  const ctx = { ...(input || {}) }

  const step = async (i, fn) => {
    const node = wf.nodes[i]
    const t0 = performance.now()
    let out
    let live = false
    let status = 'done'
    try {
      ;({ out, live = false } = await fn())
    } catch (err) {
      status = 'error'
      out = { error: err.message }
    }
    results.push({ app: node.app, title: node.title, kind: node.kind, status, live, ms: Math.max(1, Math.round(performance.now() - t0)), out })
    return out
  }

  if (template === 'lead') {
    const lead = { name: ctx.name || 'Rohit Kulkarni', phone: ctx.phone || '+91 98765 44410', interest: ctx.interest || '3 BHK, Baner', budget: ctx.budget || '1.2 Cr' }
    await step(0, async () => ({ out: { ...lead, received_at: new Date().toISOString() }, live: true }))
    const scored = await step(1, async () => {
      const r = await aiScoreLead(ai, lead)
      return r ? { out: { ...r, engine: 'claude' }, live: true } : { out: { ...heuristicScore(lead), engine: 'rules' } }
    })
    const hot = (scored?.score ?? 0) >= 70
    await step(2, async () => ({ out: { condition: 'score >= 70', branch: String(hot), path: hot ? 'hot lead' : 'nurture' }, live: true }))
    await step(3, async () => {
      const r = await postWebhook(env.N8N_WEBHOOK_URL, { event: 'lead.hot', lead, score: scored }, fetchImpl)
      return { out: { action: hot ? 'send intro + brochure' : 'add to nurture', webhook: r }, live: r.delivered }
    })
    await step(4, async () => {
      const row = await store.append('workflow-leads', { lead, score: scored?.score, segment: scored?.segment })
      return { out: { stored: true, row_id: row.id }, live: true }
    })
  } else if (template === 'order') {
    const order = { order: ctx.order || '#5821', items: [{ name: 'Cold brew', qty: 2, price: 920 }], city: ctx.city || 'Indore' }
    await step(0, async () => ({ out: order, live: true }))
    const summary = await step(1, async () => {
      const total = order.items.reduce((s, i) => s + i.qty * i.price, 0)
      return { out: { summary: order.items.map((i) => `${i.name} ×${i.qty}`).join(', '), total: `₹${total.toLocaleString('en-IN')}` }, live: true }
    })
    await step(2, async () => {
      const r = await postWebhook(env.N8N_WEBHOOK_URL, { event: 'order.confirmed', order, summary }, fetchImpl)
      return { out: { template: 'order_confirmed', webhook: r }, live: r.delivered }
    })
    await step(3, async () => ({ out: { resume_on: 'delivery webhook', scheduled_for: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10) }, live: true }))
    await step(4, async () => {
      const row = await store.append('workflow-orders', { order: order.order, review_request: 'queued' })
      return { out: { template: 'review_request', queued: true, row_id: row.id }, live: true }
    })
  } else {
    const call = { from: ctx.phone || '+91 97000 01203', at: new Date().toTimeString().slice(0, 5) }
    await step(0, async () => ({ out: call, live: true }))
    const contacts = await store.list('contacts')
    const digits = call.from.replace(/\D/g, '')
    const found = contacts.find((c) => (c.phone || '').replace(/\D/g, '').endsWith(digits.slice(-10)))
    await step(1, async () => ({ out: found ? { found: true, name: found.name } : { found: false }, live: true }))
    await step(2, async () => ({ out: { condition: 'existing customer?', branch: String(Boolean(found)) }, live: true }))
    await step(3, async () => {
      const r = await postWebhook(env.N8N_WEBHOOK_URL, { event: 'call.missed', call, known: Boolean(found) }, fetchImpl)
      return { out: { message: 'Sorry we missed your call', buttons: ['Call me back', 'Book online'], webhook: r }, live: r.delivered }
    })
    await step(4, async () => {
      const row = await store.append('workflow-missed-calls', call)
      return { out: { alert: 'front desk', logged: true, row_id: row.id }, live: true }
    })
  }
  return { template, nodes: results, total_ms: results.reduce((s, n) => s + n.ms, 0) }
}
