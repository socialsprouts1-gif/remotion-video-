import { useState } from 'react'
import { site } from '../site'
import { SplitWords } from '../components/Reveal'
import Magnetic from '../components/Magnetic'
import { scrollTo } from '../lib/smooth'

const NEEDS = ['WhatsApp agent', 'Lead generation', 'n8n workflows', 'Custom SaaS', 'Not sure yet']

export default function Contact() {
  const [needs, setNeeds] = useState(['WhatsApp agent'])
  const [status, setStatus] = useState('idle')

  const submit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    data.needs = needs
    setStatus('sending')
    try {
      if (site.formEndpoint) {
        const r = await fetch(site.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (!r.ok) throw new Error()
      } else {
        // No endpoint configured yet: never pretend the request was delivered.
        console.warn('Set site.formEndpoint in src/site.js to receive audit requests.', data)
        setStatus('unconfigured')
        return
      }
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="contact__main">
        <span className="eyebrow mono">Free automation audit</span>
        <SplitWords as="h2" className="h1" text={['Let’s automate', 'your first workflow.']} />
        <p className="muted">Tell us what eats your team’s time. We’ll show you what can run on autopilot and what it would cost.</p>
      </div>
      <form className="contact__form" onSubmit={submit}>
        {status === 'sent' ? (
          <div className="sent">
            <span className="mono lime">● request received</span>
            <h3 className="h3">Thanks. We’ll get back to you soon.</h3>
            <button type="button" className="link" onClick={() => setStatus('idle')}>Send another</button>
          </div>
        ) : (
          <>
            <label>
              <span className="mono label">Your name</span>
              <input id="c-name" name="name" required autoComplete="name" />
            </label>
            <label>
              <span className="mono label">Business</span>
              <input id="c-business" name="business" required placeholder="e.g. dental clinic in Pune" />
            </label>
            <label>
              <span className="mono label">WhatsApp number</span>
              <input id="c-phone" name="phone" required type="tel" autoComplete="tel" placeholder="+91" />
            </label>
            <fieldset>
              <legend className="mono label">What do you want to automate?</legend>
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
              <button className="btn btn--lime" disabled={status === 'sending'} data-cursor="Send">
                {status === 'sending' ? 'Sending…' : 'Book my free audit →'}
              </button>
            </Magnetic>
            {status === 'error' && <p className="err">Couldn’t send. Please try again in a moment.</p>}
            {status === 'unconfigured' && <p className="err">This form isn’t connected yet. Set <code>formEndpoint</code> in <code>src/site.js</code>.</p>}
          </>
        )}
      </form>
      <footer className="footer">
        <div className="footer__mark" aria-hidden="true">NEURAXINE</div>
        <div className="footer__row mono">
          <span>© 2026 Neuraxine · AI automation, made in {site.country}</span>
          <button onClick={() => scrollTo(0, { duration: 3 })}>Back to top ↑</button>
        </div>
      </footer>
    </section>
  )
}
