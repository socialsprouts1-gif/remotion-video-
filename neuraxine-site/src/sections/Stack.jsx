import { stack } from '../site'

// Two counter-rotating rings of tools around the core.
export default function Stack() {
  const inner = stack.slice(0, 7)
  const outer = stack.slice(7)
  return (
    <section id="stack" className="stack">
      <div className="stack__head">
        <span className="eyebrow mono">Integrations</span>
        <h2 className="h2">Works with the tools <em>you already use.</em></h2>
        <p className="muted">If it has an API, a webhook or a spreadsheet, we can connect it.</p>
      </div>
      <div className="orbit" aria-label={`Tools: ${stack.join(', ')}`}>
        <div className="orbit__core"><span className="mono">neuraxine</span><b>core</b></div>
        {[inner, outer].map((ring, r) => (
          <div key={r} className={`orbit__ring r${r}`} style={{ '--n': ring.length }}>
            {ring.map((t, i) => (
              <span key={t} className="orbit__item" style={{ '--i': i }}>
                <span className="mono">{t}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
