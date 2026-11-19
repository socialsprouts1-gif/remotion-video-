import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { services } from '../site'
import { SplitWords } from '../components/Reveal'
import { gsap, scrollTo } from '../lib/smooth'
import { getHealth } from '../lib/api'

const demos = {
  WhatsAppDemo: lazy(() => import('../demos/WhatsAppDemo')),
  WorkflowDemo: lazy(() => import('../demos/WorkflowDemo')),
  LeadAgentDemo: lazy(() => import('../demos/LeadAgentDemo')),
  SaasDemo: lazy(() => import('../demos/SaasDemo')),
}

export default function Demos() {
  const ref = useRef(null)
  const [health, setHealth] = useState(null)
  useEffect(() => {
    getHealth().then(setHealth)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Each device tilts up out of perspective as it scrolls into view.
      gsap.utils.toArray('.service__demo').forEach((el) => {
        gsap.fromTo(
          el,
          { rotateX: 16, y: 80, scale: 0.94, opacity: 0.4 },
          { rotateX: 0, y: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: true } },
        )
      })
      gsap.utils.toArray('.service__info').forEach((el) => {
        gsap.from(el.children, { y: 30, opacity: 0, stagger: 0.07, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' } })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="demos" className="demos" ref={ref}>
      <div className="demos__head">
        <span className="eyebrow">Services · live demos</span>
        <SplitWords as="h2" className="h2" text={['Don’t take our word.', 'Try it.']} />
        <p className="lead">These demos are connected to a real backend. Type, click, run them. Nothing here is a video.</p>
      </div>
      {services.map((s) => {
        const Demo = demos[s.demo]
        return (
          <article key={s.id} className="service" id={`svc-${s.id}`}>
            <div className="service__info">
              <span className="service__no">{s.no}</span>
              <h3 className="h3">{s.name}</h3>
              <p>{s.line}</p>
              <ul>
                {s.points.map((p) => (
                  <li key={p}><Check size={16} strokeWidth={2.5} />{p}</li>
                ))}
              </ul>
              <button className="link" onClick={() => scrollTo('#contact')} data-cursor="Book">
                Get this for my business <ArrowRight size={16} />
              </button>
            </div>
            <div className="service__demo">
              <Suspense fallback={<div className="demo-loading">Loading demo…</div>}>
                <Demo health={health} />
              </Suspense>
            </div>
          </article>
        )
      })}
    </section>
  )
}
