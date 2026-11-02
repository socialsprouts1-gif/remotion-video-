import { scrollTo } from '../lib/smooth'
import Magnetic from './Magnetic'

const LINKS = [
  ['How it works', '#journey'],
  ['Live demos', '#demos'],
  ['ROI', '#roi'],
  ['Builds', '#builds'],
]

export default function Nav() {
  return (
    <header className="nav">
      <button className="nav__logo" onClick={() => scrollTo(0)} aria-label="Neuraxine, back to top">
        <span className="nav__mark" aria-hidden="true" />
        Neuraxine
      </button>
      <nav className="nav__links" aria-label="Primary">
        {LINKS.map(([l, h]) => (
          <button key={h} onClick={() => scrollTo(h)}>{l}</button>
        ))}
      </nav>
      <div className="nav__right">
        <span className="nav__status mono"><i />System live</span>
        <Magnetic strength={0.35}>
          <button className="btn btn--lime btn--sm" onClick={() => scrollTo('#contact')} data-cursor="Book">
            Free audit
          </button>
        </Magnetic>
      </div>
    </header>
  )
}
