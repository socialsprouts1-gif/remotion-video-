import { useRef, useState } from 'react'
import { Play, Loader2, Check, Globe, MessageCircle, Star, ExternalLink } from 'lucide-react'
import { leadCategories, leadCities, makeLeads } from './data'
import { draftMessage } from './engine'
import { api } from '../lib/api'
import { Browser, ModeBadge } from '../components/Devices'

const STEPS = ['Searching business listings', 'Reading websites', 'Checking WhatsApp', 'Scoring fit', 'Writing first messages']

export default function LeadAgentDemo({ health }) {
  const [category, setCategory] = useState('Dentists')
  const [city, setCity] = useState('Pune')
  const [step, setStep] = useState(-1)
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)
  const [meta, setMeta] = useState(null)
  const timers = useRef([])

  const runAgent = async () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setRows([])
    setOpen(null)
    setStep(0)
    STEPS.forEach((_, i) => timers.current.push(setTimeout(() => setStep((s) => Math.max(s, i)), i * 600)))
    let data
    try {
      data = await api('/api/leads/search', { category, city })
    } catch {
      const benefit = leadCategories[category].benefit
      data = { mode: 'offline', leads: makeLeads(category, city).map((l) => ({ ...l, draft: draftMessage(l, category, city, benefit) })) }
    }
    setMeta(data)
    const wait = Math.max(0, 1800 - 0)
    data.leads.forEach((l, i) => timers.current.push(setTimeout(() => setRows((r) => [...r, l]), wait + i * 260)))
    timers.current.push(setTimeout(() => (setStep(STEPS.length), setOpen(0)), wait + data.leads.length * 260 + 150))
  }

  const busy = step >= 0 && step < STEPS.length
  const lead = open !== null ? rows[open] : null
  return (
    <div className="demo demo-lead">
      <div className="demo__bar">
        <form className="lead-form" onSubmit={(e) => (e.preventDefault(), runAgent())}>
          <label>
            <span>Find</span>
            <select id="lead-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.keys(leadCategories).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span>in</span>
            <select id="lead-city" value={city} onChange={(e) => setCity(e.target.value)}>
              {leadCities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <button className="btn btn--primary btn--sm" disabled={busy}>
            {busy ? <Loader2 size={15} className="spin" /> : <Play size={15} />} {busy ? 'Agent working…' : 'Run agent'}
          </button>
        </form>
        <ModeBadge live={(meta ? meta.mode === 'live' : health?.services?.places) || false} liveText="Live Google business data" offText="Sample data" />
      </div>

      <Browser url={`agents.neuraxine.com/lead-gen?q=${encodeURIComponent(category.toLowerCase())}+${city.toLowerCase()}`}>
        <ol className="agent-steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>
              {i < step ? <Check size={13} strokeWidth={3} /> : i === step ? <Loader2 size={13} className="spin" /> : <span className="dot" />}
              {s}
            </li>
          ))}
        </ol>
        <div className="lead-table" data-lenis-prevent>
          <div className="row head"><span>Business</span><span>Area</span><span>Website</span><span>Rating</span><span>Fit score</span></div>
          {rows.map((l, i) => (
            <button key={l.name + i} className={`row ${open === i ? 'is-open' : ''}`} onClick={() => setOpen(i)}>
              <span className="name">{l.name}</span>
              <span className="muted">{l.area || '—'}</span>
              <span>{l.website ? <Globe size={15} /> : <b className="warn">None</b>}</span>
              <span className="rating"><Star size={13} fill="currentColor" /> {l.rating ?? '—'} <em>({l.reviews})</em></span>
              <span className="score"><i style={{ width: `${l.score}%` }} /><em>{l.score}</em></span>
            </button>
          ))}
          {!rows.length && !busy && <p className="empty">Pick a business type and city, then run the agent.</p>}
        </div>
        {lead && (
          <div className="lead-draft">
            <div className="lead-draft__head">
              <MessageCircle size={16} /> First message for <b>{lead.name}</b>
              {lead.mapsUrl && (
                <a href={lead.mapsUrl} target="_blank" rel="noreferrer">Maps <ExternalLink size={12} /></a>
              )}
            </div>
            <p>{lead.draft}</p>
          </div>
        )}
      </Browser>
      <p className="note">
        {meta?.mode === 'live'
          ? 'Real businesses from Google Places. Drafts written by Claude when an API key is set.'
          : 'Sample businesses for the demo. With a Google Places key on the server, this returns real businesses.'}
      </p>
    </div>
  )
}
