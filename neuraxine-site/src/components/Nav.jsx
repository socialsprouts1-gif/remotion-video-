import { useEffect, useState } from 'react'
import { scrollTo } from '../lib/smooth'
import { getHealth } from '../lib/api'
import Magnetic from './Magnetic'

const LINKS = [
  ['How it works', '#journey'],
  ['Services', '#demos'],
  ['Industries', '#industries'],
  ['Work', '#builds'],
  ['FAQ', '#faq'],
]

export default function Nav() {
  const [health, setHealth] = useState(undefined)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    getHealth().then(setHealth)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <button className="nav__logo" onClick={() => scrollTo(0)} aria-label="Neuraxine, back to top">
        <img src={`${import.meta.env.BASE_URL}brand/logo.svg`} alt="" width="34" height="22" />
        <span>Neuraxine</span>
      </button>
      <nav className="nav__links" aria-label="Primary">
        {LINKS.map(([l, h]) => (
          <button key={h} onClick={() => scrollTo(h)}>{l}</button>
        ))}
      </nav>
      <div className="nav__right">
        {health && (
          <span className="nav__status" title="Live status from /api/health">
            <i />All systems operational
          </span>
        )}
        <Magnetic strength={0.35}>
          <button className="btn btn--primary btn--sm" onClick={() => scrollTo('#contact')} data-cursor="Book">
            Book free audit
          </button>
        </Magnetic>
      </div>
    </header>
  )
}
