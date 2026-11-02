import { useCallback, useEffect, useRef, useState } from 'react'
import { industries, days, slots, rupees } from './data'

const now = () => new Date().toTimeString().slice(0, 8)

// A scripted WhatsApp agent that runs entirely in the browser.
export default function WhatsAppDemo() {
  const [key, setKey] = useState('salon')
  const [msgs, setMsgs] = useState([])
  const [options, setOptions] = useState([])
  const [typing, setTyping] = useState(false)
  const [log, setLog] = useState([])
  const [text, setText] = useState('')
  const ctx = useRef({})
  const run = useRef(0)
  const body = useRef(null)
  const ind = industries[key]

  const addLog = (event, detail = '') => setLog((l) => [...l.slice(-7), { t: now(), event, detail }])

  // Bot replies arrive one by one with a typing indicator.
  const say = useCallback((lines, nextOptions) => {
    const id = run.current
    setOptions([])
    let delay = 250
    lines.forEach((line, i) => {
      setTimeout(() => id === run.current && setTyping(true), delay)
      delay += Math.min(1400, 550 + line.length * 14)
      setTimeout(() => {
        if (id !== run.current) return
        setTyping(false)
        setMsgs((m) => [...m, { from: 'bot', text: line }])
        if (i === lines.length - 1) setOptions(nextOptions)
      }, delay)
      delay += 180
    })
  }, [])

  const node = useCallback(
    (name, value) => {
      const c = ctx.current
      const home = [`Book ${ind.noun}`, 'Prices', 'Location & timings']
      switch (name) {
        case 'start':
          return say([ind.greeting], home)
        case 'book':
          addLog('intent.detected', `book_${ind.noun.replace(' ', '_')}`)
          return say([`Zaroor! Kaunsi service ke liye?`], ind.services.map((s) => s[0]))
        case 'day':
          c.service = ind.services.find((s) => s[0] === value)
          return say([`${c.service[0]} ke liye kaunsa din theek rahega?`], days)
        case 'slot':
          c.day = value
          addLog('calendar.availability', `${value}: ${slots.length} free slots`)
          return say([`${value} ke available slots:`], slots)
        case 'confirm': {
          c.slot = value
          const price = c.service[1]
          addLog('crm.lead.created', `${c.service[0]} · source: WhatsApp`)
          addLog('calendar.booked', `${c.day} ${value}`)
          if (price > 0) addLog('payment.link.sent', rupees(price))
          addLog('reminder.scheduled', '-24h and -2h')
          return say(
            [
              `Done! Aapka ${ind.noun} book ho gaya: ${c.service[0]}, ${c.day} ${value}.`,
              price > 0 ? `Advance pay karne ke liye link: pay.example/${key}-${Math.floor(Math.random() * 9000 + 1000)} (${rupees(price)})` : 'Koi charge nahi hai. Bas time pe aa jaiye.',
              'Ek din pehle reminder bhej denge. Kuch aur?',
            ],
            ['Prices', 'Location & timings', 'Start over'],
          )
        }
        case 'prices':
          addLog('faq.answered', 'prices')
          return say([ind.services.map((s) => `• ${s[0]}: ${rupees(s[1])}`).join('\n')], [`Book ${ind.noun}`, 'Location & timings'])
        case 'location':
          addLog('faq.answered', 'location')
          return say([ind.location], [`Book ${ind.noun}`, 'Prices'])
        default:
          addLog('handoff.human', 'notified team on WhatsApp')
          return say(['Iska sahi answer main team se confirm karke thodi der mein bhejti hoon.'], home)
      }
    },
    [ind, key, say],
  )

  const reset = useCallback(() => {
    run.current++
    ctx.current = {}
    setMsgs([])
    setLog([{ t: now(), event: 'agent.online', detail: ind.business }])
    setTyping(false)
    node('start')
  }, [ind, node])

  useEffect(reset, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight
  }, [msgs, typing, options])

  const choose = (label) => {
    setMsgs((m) => [...m, { from: 'me', text: label }])
    addLog('message.received', `"${label}"`)
    if (label === 'Start over') return reset()
    if (label.startsWith('Book')) return node('book')
    if (label === 'Prices') return node('prices')
    if (label.startsWith('Location')) return node('location')
    if (ind.services.some((s) => s[0] === label)) return node('day', label)
    if (days.includes(label)) return node('slot', label)
    if (slots.includes(label)) return node('confirm', label)
    return node('human')
  }

  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    setMsgs((m) => [...m, { from: 'me', text: t }])
    addLog('message.received', `"${t.slice(0, 28)}"`)
    const s = t.toLowerCase()
    if (/book|slot|appointment|visit|trial|kal|aaj|time/.test(s)) return node('book')
    if (/price|rate|kitna|cost|fees|charge/.test(s)) return node('prices')
    if (/where|location|address|kahan|timing|open/.test(s)) return node('location')
    return node('human')
  }

  return (
    <div className="demo demo-wa">
      <div className="demo__bar">
        <div className="chips" role="tablist" aria-label="Business type">
          {Object.entries(industries).map(([k, v]) => (
            <button key={k} role="tab" aria-selected={k === key} className={`chip ${k === key ? 'is-on' : ''}`} onClick={() => setKey(k)}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="demo-wa__grid">
        <div className="phone">
          <div className="phone__head">
            <span className="avatar">{ind.business[0]}</span>
            <div>
              <b>{ind.business}</b>
              <small>{typing ? 'typing…' : 'online · AI assistant'}</small>
            </div>
          </div>
          <div className="phone__body" ref={body} data-lenis-prevent>
            {msgs.map((m, i) => (
              <div key={i} className={`bubble ${m.from === 'me' ? 'out' : 'in'}`}>{m.text}</div>
            ))}
            {typing && <div className="typing"><i /><i /><i /></div>}
            {!!options.length && (
              <div className="quick">
                {options.map((o) => (
                  <button key={o} onClick={() => choose(o)}>{o}</button>
                ))}
              </div>
            )}
          </div>
          <form className="phone__input" onSubmit={submit}>
            <input id="wa-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message… try “price kitna hai?”" />
            <button aria-label="Send">➤</button>
          </form>
        </div>
        <div className="log">
          <div className="log__head mono"><i />Automation log</div>
          <ol data-lenis-prevent>
            {log.map((l, i) => (
              <li key={i} className="mono">
                <span>{l.t}</span>
                <b>{l.event}</b>
                <em>{l.detail}</em>
              </li>
            ))}
          </ol>
          <p className="log__note">Sample business. In production this runs on the official WhatsApp Business API and writes to your CRM, calendar and payment gateway.</p>
        </div>
      </div>
    </div>
  )
}
