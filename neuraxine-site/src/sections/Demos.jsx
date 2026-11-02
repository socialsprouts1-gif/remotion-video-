import { lazy, Suspense } from 'react'
import { services } from '../site'
import { SplitWords, FadeUp } from '../components/Reveal'
import { scrollTo } from '../lib/smooth'

const demos = {
  WhatsAppDemo: lazy(() => import('../demos/WhatsAppDemo')),
  WorkflowDemo: lazy(() => import('../demos/WorkflowDemo')),
  LeadAgentDemo: lazy(() => import('../demos/LeadAgentDemo')),
  SaasDemo: lazy(() => import('../demos/SaasDemo')),
}

export default function Demos() {
  return (
    <section id="demos" className="demos">
      <div className="demos__head">
        <span className="eyebrow mono">Services · live demos</span>
        <SplitWords as="h2" className="h2" text={['Don’t take our word.', 'Try it.']} />
        <p className="muted">Every demo below runs in your browser. Click around, type, break it.</p>
      </div>
      {services.map((s) => {
        const Demo = demos[s.demo]
        return (
          <article key={s.id} className="service" id={`svc-${s.id}`}>
            <FadeUp className="service__info">
              <span className="service__no mono">{s.no}</span>
              <h3 className="h3">{s.name}</h3>
              <p>{s.line}</p>
              <ul>
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <button className="link" onClick={() => scrollTo('#contact')} data-cursor="Book">Get this for my business →</button>
            </FadeUp>
            <FadeUp className="service__demo" delay={0.1}>
              <span className="live mono"><i />Live demo</span>
              <Suspense fallback={<div className="demo demo--loading mono">loading demo…</div>}>
                <Demo />
              </Suspense>
            </FadeUp>
          </article>
        )
      })}
    </section>
  )
}
