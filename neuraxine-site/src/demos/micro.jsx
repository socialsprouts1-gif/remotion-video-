import { useEffect, useRef, useState } from 'react'
import { PhoneCall, PhoneOff, Volume2, Check, FileText, MousePointer2 } from 'lucide-react'
import BrandIcon from '../components/BrandIcon'

// Small looping demos for the services bento. Each one only animates while
// it is on screen, and holds a readable resting frame otherwise.

function useInView(ref) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [ref])
  return seen
}

// Advances 0..steps-1 every `ms` while visible, then loops after a pause.
function useLoop(ref, steps, ms, rest = 2200) {
  const visible = useInView(ref)
  const [i, setI] = useState(steps - 1)
  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let step = 0
    let t
    const tick = () => {
      setI(step)
      const wait = step === steps - 1 ? rest : ms
      step = (step + 1) % steps
      t = setTimeout(tick, wait)
    }
    tick()
    return () => clearTimeout(t)
  }, [visible, steps, ms, rest])
  return i
}

// ── Voice agent: plays a real spoken sample call with the browser's voice ──
const CALL = [
  ['agent', 'Hello, thank you for calling SmileCare Dental. How can I help you today?'],
  ['caller', 'Hi, I want to book a teeth cleaning this week.'],
  ['agent', 'Sure. I have Thursday at eleven, or Saturday at four thirty. Which works for you?'],
  ['caller', 'Saturday works.'],
  ['agent', 'Done. You are booked for Saturday at four thirty. I have sent the details on WhatsApp.'],
]

export function VoiceMicro() {
  const [line, setLine] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timers = useRef([])
  const tts = typeof window !== 'undefined' && 'speechSynthesis' in window

  const stop = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (tts) window.speechSynthesis.cancel()
    setPlaying(false)
  }
  useEffect(() => {
    // Voices load asynchronously in most browsers; warm the list early.
    if (tts) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices())
    }
    return stop
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    stop()
    setPlaying(true)
    setLine(-1)
    const voices = tts ? window.speechSynthesis.getVoices() : []
    const pick = (re) => voices.find((v) => re.test(v.lang)) || voices.find((v) => /^en/.test(v.lang))
    const indian = pick(/en-IN/)
    const say = (i) => {
      if (i >= CALL.length) return (setLine(CALL.length), setPlaying(false))
      setLine(i)
      const [who, text] = CALL[i]
      if (tts && voices.length) {
        const u = new SpeechSynthesisUtterance(text)
        u.voice = indian || null
        u.rate = 1.02
        u.pitch = who === 'agent' ? 1.1 : 0.85
        u.onend = () => timers.current.push(setTimeout(() => say(i + 1), 250))
        window.speechSynthesis.speak(u)
      } else {
        timers.current.push(setTimeout(() => say(i + 1), 900 + text.length * 38))
      }
    }
    say(0)
  }

  const shown = line < 0 ? CALL.slice(0, 2) : line >= CALL.length ? CALL.slice(-2) : CALL.slice(Math.max(0, line - 1), line + 1)
  return (
    <div className="micro micro-voice">
      <div className="call-head">
        <span className="call-avatar"><PhoneCall size={16} /></span>
        <div>
          <b>Incoming call · SmileCare Dental</b>
          <small>{playing ? 'AI agent speaking' : line >= CALL.length ? 'Call ended · 0:24' : '+91 98••• ••210'}</small>
        </div>
        <button className={`call-btn ${playing ? 'is-on' : ''}`} onClick={playing ? stop : play} aria-label={playing ? 'Stop sample call' : 'Play sample call'}>
          {playing ? <PhoneOff size={16} /> : <Volume2 size={16} />}
          {playing ? 'Stop' : 'Play sample call'}
        </button>
      </div>
      <div className={`wave ${playing ? 'is-live' : ''}`} aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <i key={i} style={{ '--i': i, '--h': `${20 + ((i * 37) % 70)}%` }} />
        ))}
      </div>
      <div className="transcript" aria-live="polite">
        {shown.map(([who, text]) => (
          <p key={text} className={who}>
            <span>{who === 'agent' ? 'Agent' : 'Caller'}</span>
            {text}
          </p>
        ))}
      </div>
      <div className={`call-out ${line >= CALL.length ? 'is-in' : ''}`}>
        <span><Check size={13} strokeWidth={3} /> Appointment booked</span>
        <span><BrandIcon name="siWhatsapp" size={13} color="currentColor" /> Summary sent</span>
      </div>
    </div>
  )
}

// ── Website chatbot ──
const CHAT = [
  ['in', 'Do you do weekend appointments?'],
  ['out', 'Yes, Saturdays 9 AM to 6 PM. Want me to check a slot for you?'],
  ['in', 'Yes please, this Saturday.'],
  ['out', '11:00 or 4:30 are free. I’ll hold one, may I have your WhatsApp number?'],
]
export function ChatbotMicro() {
  const ref = useRef(null)
  const i = useLoop(ref, CHAT.length + 1, 1500)
  return (
    <div className="micro micro-chat" ref={ref}>
      <div className="mc-head"><span className="dot" />Ask SmileCare · AI assistant</div>
      <div className="mc-body">
        {CHAT.slice(0, Math.min(i + 1, CHAT.length)).map(([d, t]) => (
          <p key={t} className={d}>{t}</p>
        ))}
        {i >= CHAT.length && <span className="mc-lead"><Check size={12} strokeWidth={3} /> Lead captured · sent to WhatsApp</span>}
      </div>
    </div>
  )
}

// ── Document processing ──
const FIELDS = [
  ['Vendor', 'Shree Traders'],
  ['GSTIN', '27AAPFS••••1Z5'],
  ['Invoice no.', 'ST/24-25/0418'],
  ['Total', '₹18,640.00'],
]
export function DocsMicro() {
  const ref = useRef(null)
  const i = useLoop(ref, FIELDS.length + 2, 850)
  return (
    <div className="micro micro-docs" ref={ref}>
      <div className={`doc ${i < FIELDS.length ? 'is-scanning' : ''}`}>
        <FileText size={16} />
        <i /><i /><i /><i className="short" /><i /><i className="short" />
        <span className="scan" aria-hidden="true" />
      </div>
      <dl>
        {FIELDS.map(([k, v], n) => (
          <div key={k} className={n <= i ? 'is-in' : ''}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div className={`saved ${i >= FIELDS.length ? 'is-in' : ''}`}>
          <BrandIcon name="siGooglesheets" size={13} /> Saved to Sheets
        </div>
      </dl>
    </div>
  )
}

// ── Content calendar ──
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const POSTS = [0, 2, 3, 5, 7, 8, 10, 12, 13]
export function ContentMicro() {
  const ref = useRef(null)
  const i = useLoop(ref, POSTS.length + 1, 320, 2600)
  return (
    <div className="micro micro-content" ref={ref}>
      <div className="cal">
        {DAYS.map((d, n) => <span key={n} className="dow">{d}</span>)}
        {Array.from({ length: 14 }, (_, n) => {
          const k = POSTS.indexOf(n)
          return (
            <span key={n} className={`day ${k > -1 && k <= i ? `has k${k % 3}` : ''}`}>
              {k > -1 && k <= i && <BrandIcon name="siInstagram" size={11} color="currentColor" />}
            </span>
          )
        })}
      </div>
      <span className="micro-foot">{Math.min(i + 1, POSTS.length)} of {POSTS.length} posts scheduled</span>
    </div>
  )
}

// ── CRM pipeline ──
const STAGES = ['New', 'Contacted', 'Booked']
export function CrmMicro() {
  const ref = useRef(null)
  const i = useLoop(ref, 3, 1300)
  return (
    <div className="micro micro-crm" ref={ref}>
      <div className="pipe">
        {STAGES.map((s, n) => (
          <div key={s} className="col">
            <span>{s}</span>
            {n === i && (
              <div className="deal" key={i}>
                <b>Rahul M.</b>
                <small>{['Form · just now', 'WhatsApp sent · day 0', 'Site visit · Sat'][i]}</small>
              </div>
            )}
            <div className="ghost" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Website builder ──
const BLOCKS = ['b-nav', 'b-hero', 'b-cta', 'b-c1', 'b-c2', 'b-c3', 'b-chat']
export function WebMicro() {
  const ref = useRef(null)
  const i = useLoop(ref, BLOCKS.length + 1, 420, 2400)
  return (
    <div className="micro micro-web" ref={ref}>
      <div className="site">
        {BLOCKS.map((b, n) => (
          <span key={b} className={`blk ${b} ${n <= i ? 'is-in' : ''}`} />
        ))}
        <MousePointer2 size={16} className="ptr" style={{ '--x': `${[20, 60, 30, 18, 50, 80, 88, 88][i] || 20}%`, '--y': `${[8, 32, 52, 78, 78, 78, 88, 88][i] || 10}%` }} />
      </div>
    </div>
  )
}

export const micro = { voice: VoiceMicro, chatbot: ChatbotMicro, docs: DocsMicro, content: ContentMicro, crm: CrmMicro, web: WebMicro }
