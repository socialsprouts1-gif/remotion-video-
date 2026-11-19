import { useLayoutEffect, useRef } from 'react'
import { brand, products } from '../brand'
import { gsap, scrollTo } from '../lib/smooth'
import Magnetic from '../components/Magnetic'

export default function Hero() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // The wordmark sits behind the bottles and drifts up/out at its own speed.
      gsap.to('.hero__mark', {
        yPercent: -38,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero__headline', {
        yPercent: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: '70% top', scrub: true },
      })
      gsap.to('.hero__float', {
        y: (i) => -120 - i * 90,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const p = products[0]
  return (
    <section id="hero" className="hero" data-theme="light" ref={ref}>
      <h1 className="hero__mark under" aria-label={brand.name}>
        {brand.name.split('').map((c, i) => (
          <span key={i} style={{ '--i': i }}>{c}</span>
        ))}
      </h1>

      <div className="hero__meta">
        <span className="label">{brand.descriptor}</span>
        <span className="label muted">{brand.city}, est. {brand.est}</span>
      </div>

      <div className="hero__float hero__tag">
        <i />
        <span className="label">N°{p.no}</span>
        <span className="serif">{p.name}</span>
        <span className="label muted">{p.size}</span>
      </div>
      <div className="hero__float hero__coords label muted">{brand.coords}</div>

      <div className="hero__headline">
        <h2 className="display">
          {brand.headline.map((l, i) => (
            <span className="line" key={i}>
              <span style={{ '--d': `${0.15 + i * 0.12}s` }}>{i === 1 ? <em>{l}</em> : l}</span>
            </span>
          ))}
        </h2>
        <p className="hero__sub">
          Five extraits, composed and poured by hand in a single Paris atelier.
        </p>
      </div>

      <Magnetic className="hero__cta" strength={0.4}>
        <button className="round-btn" onClick={() => scrollTo('#story')} data-cursor="Scroll">
          <span>{brand.cta}</span>
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4v16m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
        </button>
      </Magnetic>

      <div className="vertical hero__scroll label">
        <span>Scroll to explore</span>
        <span className="muted">01 / 08</span>
      </div>
    </section>
  )
}
