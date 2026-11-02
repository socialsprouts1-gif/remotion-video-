import { useRef, useState } from 'react'
import { leadCategories, leadCities, makeLeads } from './data'

const STEPS = ['Searching public business listings', 'Visiting websites', 'Checking WhatsApp availability', 'Scoring against your criteria', 'Drafting first messages']

export default function LeadAgentDemo() {
  const [category, setCategory] = useState('Dentists')
  const [city, setCity] = useState('Pune')
  const [step, setStep] = useState(-1)
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)
  const timers = useRef([])

  const runAgent = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setRows([])
    setOpen(null)
    const leads = makeLeads(category, city)
    let t = 0
    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i), t))
      t += 650
    })
    leads.forEach((l, i) => {
      timers.current.push(setTimeout(() => setRows((r) => [...r, l]), 1300 + i * 380))
    })
    timers.current.push(
      setTimeout(() => {
        setStep(STEPS.length)
        setOpen(0)
      }, Math.max(t, 1300 + leads.length * 380) + 200),
    )
  }

  const draft = (l) => {
    const insight = !l.website
      ? `${l.name} doesn't have a website yet, so people who find you on Google can only call`
      : l.whatsapp
        ? `you already take enquiries on WhatsApp, and with ${l.reviews} reviews that must be a lot of messages`
        : `you get steady enquiries (${l.reviews} Google reviews) but there's no quick way to book on WhatsApp`
    return `Hi ${l.name} team, I came across you in ${l.area}. I noticed ${insight}. We help ${category.toLowerCase()} in ${city} ${leadCategories[category].benefit}. Can I send a 2-minute demo video?`
  }

  const busy = step >= 0 && step < STEPS.length
  return (
    <div className="demo demo-lead">
      <form
        className="demo__bar lead-form"
        onSubmit={(e) => {
          e.preventDefault()
          runAgent()
        }}
      >
        <label>
          <span className="mono label">Find</span>
          <select id="lead-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.keys(leadCategories).map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span className="mono label">in</span>
          <select id="lead-city" value={city} onChange={(e) => setCity(e.target.value)}>
            {leadCities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <button className="btn btn--lime btn--sm" disabled={busy}>{busy ? 'Agent working…' : '▶ Run agent'}</button>
      </form>

      <ol className="agent-steps mono">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>{s}</li>
        ))}
      </ol>

      <div className="lead-table" data-lenis-prevent>
        <div className="row head mono"><span>Business</span><span>Area</span><span>Site</span><span>WA</span><span>Rating</span><span>Fit</span></div>
        {rows.map((l, i) => (
          <button key={l.name} className={`row ${open === i ? 'is-open' : ''}`} onClick={() => setOpen(i)}>
            <span>{l.name}</span>
            <span className="muted">{l.area}</span>
            <span>{l.website ? 'Yes' : <b className="warn">No</b>}</span>
            <span>{l.whatsapp ? 'Yes' : 'No'}</span>
            <span className="mono">{l.rating} ({l.reviews})</span>
            <span className="score"><i style={{ width: `${l.score}%` }} /><em className="mono">{l.score}</em></span>
          </button>
        ))}
        {!rows.length && <p className="muted empty">Pick a business type and city, then run the agent.</p>}
      </div>

      {open !== null && rows[open] && (
        <div className="lead-draft">
          <div className="mono label">Drafted first message · {rows[open].name}</div>
          <p>{draft(rows[open])}</p>
        </div>
      )}
      <p className="log__note">Sample data generated for this demo. The real agent researches public listings and pushes approved leads to your CRM.</p>
    </div>
  )
}
