import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import BrandIcon from '../components/BrandIcon'
import { site } from '../site'
import { SplitWords } from '../components/Reveal'
import Magnetic from '../components/Magnetic'
import { scrollTo } from '../lib/smooth'

const NEEDS = ['WhatsApp agent', 'Lead generation', 'n8n workflows', 'Custom SaaS', 'Not sure yet']

export default function Contact() {
  const [needs, setNeeds] = useState(['WhatsApp agent'])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  // No backend: the form opens WhatsApp with the details already typed in.
  const submit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const d = Object.fromEntries(new FormData(form))
    const text = [
      'Hi Neuraxine, I’d like a free automation audit.',
      '',
      `Name: ${d.name.trim()}`,
      `Business: ${d.business.trim()}`,
      `WhatsApp: ${d.phone.trim()}`,
      `Want to automate: ${needs.length ? needs.join(', ') : 'Not sure yet'}`,
    ].join('\n')
    const url = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`
    setError('')
    setStatus('sent')
    // Same tab on phones (opens the WhatsApp app); new tab on desktop.
    if (window.matchMedia('(pointer: coarse)').matches) window.location.href = url
    else if (!window.open(url, '_blank', 'noopener')) window.location.href = url
  }

  return (
    <section id="contact" className="contact">
      <div className="contact__main">
        <span className="eyebrow">Free automation audit</span>
        <SplitWords as="h2" className="h1" text={['Let’s automate', 'your first workflow.']} />
        <p className="lead">Tell us what eats your team’s time. We’ll show you what can run on autopilot and what it would cost to run each month.</p>
        <ul className="contact__points">
          <li>30-minute call, no slides</li>
          <li>A written automation plan you keep</li>
          <li>Fixed price before we build anything</li>
        </ul>
      </div>
      <form className="contact__form" onSubmit={submit} noValidate={false}>
        {status === 'sent' ? (
          <div className="sent">
            <CheckCircle2 size={36} className="lime" />
            <h3 className="h3">Opening WhatsApp…</h3>
            <p className="muted">Your details are typed in for you. Just press send in WhatsApp and we’ll reply there.</p>
            <button type="button" className="link" onClick={() => setStatus('idle')}>Back to the form</button>
          </div>
        ) : (
          <>
            <label>
              <span>Your name</span>
              <input id="c-name" name="name" required minLength={2} maxLength={80} autoComplete="name" />
            </label>
            <label>
              <span>Business</span>
              <input id="c-business" name="business" required minLength={2} maxLength={120} placeholder="e.g. dental clinic in Pune" />
            </label>
            <label>
              <span>WhatsApp number</span>
              <input id="c-phone" name="phone" required type="tel" pattern="\+?[0-9\s\-]{8,18}" autoComplete="tel" placeholder="+91 98765 43210" />
            </label>
            <fieldset>
              <legend>What do you want to automate?</legend>
              <div className="chips">
                {NEEDS.map((n) => (
                  <button
                    type="button"
                    key={n}
                    aria-pressed={needs.includes(n)}
                    className={`chip ${needs.includes(n) ? 'is-on' : ''}`}
                    onClick={() => setNeeds((a) => (a.includes(n) ? a.filter((x) => x !== n) : [...a, n]))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
            <Magnetic strength={0.2}>
              <button className="btn btn--primary" data-cursor="Send">
                <BrandIcon name="siWhatsapp" size={18} color="currentColor" /> Book my free audit <ArrowRight size={18} />
              </button>
            </Magnetic>
            {error && <p className="err" role="alert">{error}</p>}
            <p className="note">Opens WhatsApp with your details filled in. Nothing is stored on this website.</p>
          </>
        )}
      </form>
      <footer className="footer">
        <div className="footer__top">
          <img src={`${import.meta.env.BASE_URL}brand/logo.svg`} alt="Neuraxine" className="footer__logo" />
          <p className="muted">AI agents, WhatsApp automation and n8n workflows for growing businesses. Made in {site.country}.</p>
        </div>
        <div className="footer__row">
          <span>© 2026 Neuraxine</span>
          <button onClick={() => scrollTo(0, { duration: 3 })}>Back to top ↑</button>
        </div>
      </footer>
    </section>
  )
}
