import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { journey } from '../site'
import { ScrollTrigger } from '../lib/smooth'
import { JOURNEY_TRAVEL } from '../store'

const ease = [0.76, 0, 0.24, 1]

// Mini UI for each step: what the system actually does at that node.
function StepUI({ id }) {
  switch (id) {
    case 'wa':
      return (
        <div className="ui ui-chat">
          <div className="ui-chat__head"><i />Priya · WhatsApp<span className="mono">11:42 PM</span></div>
          <div className="bubble in">Hi! Kal shaam 5 baje haircut ka slot milega?</div>
          <div className="typing"><i /><i /><i /></div>
        </div>
      )
    case 'ai':
      return (
        <pre className="ui ui-code mono">{`{
  "intent":   "book_appointment",
  "service":  "Haircut",
  "when":     "tomorrow 17:00",
  "language": "hinglish",
  "confidence": 0.94
}`}</pre>
      )
    case 'crm':
      return (
        <div className="ui ui-table">
          <div className="row head mono"><span>Name</span><span>Source</span><span>Status</span></div>
          <div className="row new"><span>Priya S.</span><span>WhatsApp</span><span className="pill">New lead</span></div>
          <div className="row"><span>Rahul M.</span><span>Instagram</span><span className="pill dim">Booked</span></div>
          <div className="row"><span>Ankita J.</span><span>Website</span><span className="pill dim">Follow-up</span></div>
        </div>
      )
    case 'cal':
      return (
        <div className="ui ui-cal">
          {['3:00', '3:30', '4:00', '4:30', '5:00', '5:30'].map((t) => (
            <div key={t} className={`slot ${t === '5:00' ? 'is-booked' : t === '3:30' ? 'is-taken' : ''}`}>
              <span className="mono">{t} PM</span>
              {t === '5:00' && <b>Priya · Haircut</b>}
            </div>
          ))}
        </div>
      )
    case 'fu':
      return (
        <div className="ui ui-chat">
          <div className="ui-chat__head"><i />Reminder · scheduled<span className="mono">-24h</span></div>
          <div className="bubble out">Hi Priya, kal 5:00 PM aapka haircut hai. Confirm karne ke liye 1 reply karein.</div>
          <div className="bubble in short">1</div>
          <div className="bubble out">Confirmed. See you tomorrow!</div>
        </div>
      )
    default:
      return (
        <div className="ui ui-report">
          <span className="mono tag">Daily summary · sample</span>
          <div className="stats">
            <div><b>38</b><span>chats handled</span></div>
            <div><b>12</b><span>bookings</span></div>
            <div><b>3</b><span>need a human</span></div>
          </div>
        </div>
      )
  }
}

export default function Journey() {
  const ref = useRef(null)
  const bar = useRef(null)
  const [index, setIndex] = useState(0)

  useLayoutEffect(() => {
    const n = journey.length
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        const p = Math.min(1, self.progress / JOURNEY_TRAVEL)
        setIndex(Math.min(n - 1, Math.floor(p * (n - 1) + 0.12)))
        bar.current.style.transform = `scaleX(${p})`
      },
    })
    return () => st.kill()
  }, [])

  const step = journey[index]
  return (
    <section id="journey" className="journey">
      <div className="sticky">
        <div className="journey__head">
          <span className="eyebrow mono">How it works</span>
          <h2 className="h2">One message. <em>Zero manual work.</em></h2>
        </div>

        <div className="journey__card">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="journey__no mono">
                Step 0{index + 1} / 0{journey.length} · {step.label}
              </span>
              <h3 className="h3">{step.title}</h3>
              <p className="muted">{step.copy}</p>
              <StepUI id={step.id} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="journey__rail">
          <div className="journey__steps mono">
            {journey.map((j, i) => (
              <span key={j.id} className={i <= index ? 'is-done' : ''}>{j.label}</span>
            ))}
          </div>
          <div className="journey__track"><i ref={bar} /></div>
        </div>
      </div>
    </section>
  )
}
