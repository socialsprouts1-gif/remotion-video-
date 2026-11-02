import { builds } from '../site'

export default function Builds() {
  return (
    <section id="builds" className="builds">
      <div className="builds__head">
        <span className="eyebrow mono">Built by Neuraxine</span>
        <h2 className="h2">Real systems, <em>running.</em></h2>
      </div>
      <ul className="builds__list">
        {builds.map((b, i) => (
          <li key={b.name} className="build" data-cursor="View">
            <span className="mono build__no">{String(i + 1).padStart(2, '0')}</span>
            <span className="build__name">{b.name}</span>
            <span className="build__copy muted">{b.copy}</span>
            <span className="mono build__tag">{b.tag}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
