import { useLayoutEffect, useRef } from 'react'
import { site } from '../site'
import { gsap, scrollTo } from '../lib/smooth'
import Magnetic from '../components/Magnetic'
import Scramble from '../components/Scramble'

export default function Hero() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero__content', {
        yPercent: -30,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero__huge', {
        xPercent: -18,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="hero" className="hero" ref={ref}>
      <div className="hero__huge under" aria-hidden="true">AUTOMATE</div>
      <div className="hero__hud mono">
        <span>01 / Trigger: whatsapp.message</span>
        <span>02 / Agent: intent.classify</span>
        <span>03 / Action: crm.create · calendar.book</span>
      </div>
      <div className="hero__content">
        <Scramble className="eyebrow mono" text={`● ${site.hero.eyebrow}`} play />
        <h1 className="hero__title">
          {site.hero.title.map((l, i) => (
            <span className="line" key={i}>
              <span style={{ '--d': `${0.1 + i * 0.12}s` }}>{i === 1 ? <em>{l}</em> : l}</span>
            </span>
          ))}
        </h1>
        <p className="hero__sub">{site.hero.sub}</p>
        <div className="hero__ctas">
          <Magnetic strength={0.3}>
            <button className="btn btn--lime" onClick={() => scrollTo('#contact')} data-cursor="Book">
              {site.hero.primary} <span aria-hidden="true">→</span>
            </button>
          </Magnetic>
          <button className="btn btn--ghost" onClick={() => scrollTo('#journey')} data-cursor="Scroll">
            <span className="play" aria-hidden="true" /> {site.hero.secondary}
          </button>
        </div>
      </div>
      <div className="hero__scroll mono" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
