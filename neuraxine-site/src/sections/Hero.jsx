import { useLayoutEffect, useRef } from 'react'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { site, stack } from '../site'
import { gsap, scrollTo } from '../lib/smooth'
import Magnetic from '../components/Magnetic'
import BrandIcon from '../components/BrandIcon'

export default function Hero() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero__content', {
        yPercent: -20,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: '10% top', end: '80% top', scrub: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const strip = [...stack, ...stack]
  return (
    <section id="hero" className="hero" ref={ref}>
      <div className="hero__scrim under" aria-hidden="true" />
      <div className="hero__content">
        <span className="pill-label">
          <i />
          {site.hero.eyebrow} · India
        </span>
        <h1 className="hero__title">
          <span className="line"><span style={{ '--d': '0.05s' }}>Your business,</span></span>
          <span className="line"><span style={{ '--d': '0.17s' }}>on <em className="serif">autopilot.</em></span></span>
        </h1>
        <p className="hero__sub">{site.hero.sub}</p>
        <div className="hero__ctas">
          <Magnetic strength={0.3}>
            <button className="btn btn--primary" onClick={() => scrollTo('#contact')} data-cursor="Book">
              {site.hero.primary} <ArrowRight size={18} />
            </button>
          </Magnetic>
          <button className="btn btn--ghost" onClick={() => scrollTo('#demos')} data-cursor="Try">
            <PlayCircle size={18} /> Try the live demos
          </button>
        </div>
      </div>
      <div className="hero__strip" aria-label="Tools we build with">
        <span className="hero__strip-label">Built on tools you already trust</span>
        <div className="marquee">
          <div className="marquee__track">
            {strip.map(([label, icon], i) => (
              <span className="marquee__item" key={i} aria-hidden={i >= stack.length}>
                <BrandIcon name={icon} size={18} color="currentColor" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
