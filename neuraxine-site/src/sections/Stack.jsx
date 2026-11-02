import { stack } from '../site'
import BrandIcon from '../components/BrandIcon'

// Two counter-rotating rings of real tool logos around the Neuraxine mark.
export default function Stack() {
  const inner = stack.slice(0, 8)
  const outer = stack.slice(8)
  return (
    <section id="stack" className="stack">
      <div className="stack__head">
        <span className="eyebrow">Integrations</span>
        <h2 className="h2">Works with the tools <em className="serif">you already use.</em></h2>
        <p className="lead">If it has an API, a webhook or a spreadsheet, we can connect it.</p>
        <ul className="stack__list">
          {stack.map(([label, icon]) => (
            <li key={label}><BrandIcon name={icon} size={16} color="currentColor" />{label}</li>
          ))}
        </ul>
      </div>
      <div className="orbit" aria-hidden="true">
        <div className="orbit__core"><img src="/brand/logo.svg" alt="" /></div>
        {[inner, outer].map((ring, r) => (
          <div key={r} className={`orbit__ring r${r}`} style={{ '--n': ring.length }}>
            {ring.map(([label, icon], i) => (
              <span key={label} className="orbit__item" style={{ '--i': i }}>
                <span title={label}><BrandIcon name={icon} size={26} color={icon === 'siN8n' || icon === 'siClaude' || icon === 'siNotion' ? '#fff' : undefined} /></span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
