import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/smooth'

function Counter({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const state = useRef({ v: 0 })
  useEffect(() => {
    const tw = gsap.to(state.current, {
      v: value,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = prefix + Math.round(state.current.v).toLocaleString('en-IN') + suffix
      },
    })
    return () => tw.kill()
  }, [value, prefix, suffix])
  return <span ref={ref}>{prefix}0{suffix}</span>
}

const fields = [
  { id: 'msgs', label: 'Customer messages per day', min: 10, max: 500, step: 10, fmt: (v) => v },
  { id: 'mins', label: 'Minutes per manual reply', min: 1, max: 10, step: 1, fmt: (v) => `${v} min` },
  { id: 'share', label: 'Share an agent can handle', min: 30, max: 90, step: 5, fmt: (v) => `${v}%` },
  { id: 'cost', label: 'Staff cost per hour', min: 100, max: 1000, step: 50, fmt: (v) => `₹${v}` },
]

export default function Roi() {
  const [v, setV] = useState({ msgs: 120, mins: 3, share: 70, cost: 250 })
  const hours = Math.round((v.msgs * v.mins * (v.share / 100) * 30) / 60)
  const money = hours * v.cost
  return (
    <section id="roi" className="roi">
      <div className="roi__head">
        <span className="eyebrow mono">ROI calculator</span>
        <h2 className="h2">What is manual work <em>costing you?</em></h2>
        <p className="muted">Move the sliders to match your business. It's an estimate, not a promise; the audit gives you real numbers.</p>
      </div>
      <div className="roi__grid">
        <div className="roi__inputs">
          {fields.map((f) => (
            <label key={f.id} className="slider">
              <span className="slider__top">
                <span>{f.label}</span>
                <b className="mono">{f.fmt(v[f.id])}</b>
              </span>
              <input
                id={`roi-${f.id}`}
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={v[f.id]}
                style={{ '--p': `${((v[f.id] - f.min) / (f.max - f.min)) * 100}%` }}
                onChange={(e) => setV((o) => ({ ...o, [f.id]: +e.target.value }))}
              />
            </label>
          ))}
        </div>
        <div className="roi__out">
          <div>
            <span className="mono label">Hours back every month</span>
            <b className="big"><Counter value={hours} /></b>
          </div>
          <div>
            <span className="mono label">Staff cost saved / month</span>
            <b className="big lime"><Counter value={money} prefix="₹" /></b>
          </div>
          <div>
            <span className="mono label">First reply time</span>
            <b className="mid">Under 5 seconds, 24/7</b>
          </div>
        </div>
      </div>
    </section>
  )
}
