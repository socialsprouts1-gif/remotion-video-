import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, ChevronLeft, Video, Phone as PhoneIcon } from 'lucide-react'
import { industries } from './data'
import { scriptedTurn, greeting } from './engine'
import { api } from '../lib/api'
import { Phone, ModeBadge } from '../components/Devices'

const now = () => new Date().toTimeString().slice(0, 5)
const LOG_LABELS = {
  intent_detected: 'Intent detected',
  availability_checked: 'Calendar checked',
  lead_created: 'Lead saved to CRM',
  slot_booked: 'Appointment booked',
  payment_link: 'Payment link sent',
  reminder_scheduled: 'Reminders scheduled',
  faq_answered: 'FAQ answered',
  handoff_human: 'Handed to a human',
}

// WhatsApp agent. Talks to /api/agent/chat (Claude when the server has a key);
// falls back to the same scripted engine in the browser if the API is unreachable.
export default function WhatsAppDemo({ health }) {
  const [key, setKey] = useState('salon')
  const [msgs, setMsgs] = useState([])
  const [options, setOptions] = useState([])
  const [typing, setTyping] = useState(false)
  const [log, setLog] = useState([])
  const [text, setText] = useState('')
  const [mode, setMode] = useState('scripted')
  const state = useRef({})
  const history = useRef([])
  const run = useRef(0)
  const body = useRef(null)
  const ind = industries[key]

  const deliver = useCallback((turn, id) => {
    let delay = 300
    turn.replies.forEach((line, i) => {
      setTimeout(() => id === run.current && setTyping(true), delay)
      delay += Math.min(1300, 500 + line.length * 12)
      setTimeout(() => {
        if (id !== run.current) return
        setTyping(false)
        setMsgs((m) => [...m, { from: 'bot', text: line, t: now() }])
        history.current.push({ role: 'assistant', text: line })
        if (i === turn.replies.length - 1) setOptions(turn.quick_replies || [])
      }, delay)
      delay += 160
    })
    if (turn.actions?.length) setLog((l) => [...l, ...turn.actions.map((a) => ({ ...a, t: now() }))].slice(-8))
  }, [])

  const reset = useCallback(() => {
    const id = ++run.current
    state.current = {}
    history.current = []
    setMsgs([])
    setOptions([])
    setLog([{ type: 'online', detail: ind.business, t: now() }])
    deliver(greeting(key), id)
  }, [key, ind, deliver])

  useEffect(reset, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight
  }, [msgs, typing, options])

  const send = async (raw) => {
    const t = raw.trim()
    if (!t) return
    const id = run.current
    setOptions([])
    setMsgs((m) => [...m, { from: 'me', text: t, t: now() }])
    if (t === 'Start over') return reset()
    history.current.push({ role: 'user', text: t })
    setTyping(true)
    let turn
    try {
      turn = await api('/api/agent/chat', { industry: key, messages: history.current.slice(-20), state: state.current })
      setMode(turn.mode)
    } catch {
      turn = scriptedTurn(key, t, state.current)
      setMode('offline')
    }
    if (id !== run.current) return
    setTyping(false)
    state.current = turn.state || {}
    deliver(turn, id)
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
        <ModeBadge live={mode === 'ai' || (mode !== 'offline' && health?.services?.ai)} liveText="Live AI · Claude" offText={mode === 'offline' ? 'Offline demo' : 'Scripted demo'} />
      </div>
      <div className="demo-wa__grid">
        <Phone>
          <div className="wa">
            <div className="wa__head">
              <ChevronLeft size={22} />
              <span className="wa__avatar">{ind.business[0]}</span>
              <div className="wa__who">
                <b>{ind.business}</b>
                <small>{typing ? 'typing…' : 'Business account'}</small>
              </div>
              <Video size={19} />
              <PhoneIcon size={17} />
            </div>
            <div className="wa__body" ref={body} data-lenis-prevent>
              <span className="wa__day">Today</span>
              {msgs.map((m, i) => (
                <div key={i} className={`wa-msg ${m.from === 'me' ? 'out' : 'in'}`}>
                  {m.text}
                  <time>{m.t}{m.from === 'me' && <span className="ticks">✓✓</span>}</time>
                </div>
              ))}
              {typing && <div className="wa-typing"><i /><i /><i /></div>}
              {!!options.length && (
                <div className="wa-quick">
                  {options.map((o) => (
                    <button key={o} onClick={() => send(o)}>{o}</button>
                  ))}
                </div>
              )}
            </div>
            <form
              className="wa__input"
              onSubmit={(e) => {
                e.preventDefault()
                send(text)
                setText('')
              }}
            >
              <input id="wa-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" aria-label="Type a message" />
              <button aria-label="Send"><Send size={17} /></button>
            </form>
          </div>
        </Phone>
        <div className="log">
          <div className="log__head">Behind the scenes</div>
          <ol data-lenis-prevent>
            {log.map((l, i) => (
              <li key={i}>
                <span className="log__dot" />
                <div>
                  <b>{l.type === 'online' ? 'Agent online' : LOG_LABELS[l.type] || l.type}</b>
                  <em>{l.detail}</em>
                </div>
                <time>{l.t}</time>
              </li>
            ))}
          </ol>
          <p className="note">Try typing your own question, like “price kitna hai?” or “kal 6 baje free ho?”. Sample business; in production this runs on the official WhatsApp Business API.</p>
        </div>
      </div>
    </div>
  )
}
