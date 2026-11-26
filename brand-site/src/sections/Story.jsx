import { useLayoutEffect, useRef } from 'react'
import { brand } from '../brand'
import { gsap } from '../lib/smooth'
import { ScrubWords, SplitWords, FadeUp } from '../components/Reveal'

export default function Story() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.story__bg',
        { xPercent: 12 },
        { xPercent: -28, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      gsap.fromTo(
        '.story__rot',
        { rotate: -8, yPercent: 30 },
        { rotate: 6, yPercent: -40, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="story" className="story" data-theme="light" ref={ref}>
      <div className="story__bg under outline" aria-hidden="true">Maison</div>
      <div className="story__head">
        <span className="label">(01) — {brand.story.label}</span>
        <span className="story__rot serif" aria-hidden="true">since {brand.est}</span>
      </div>
      <div className="story__body">
        <ScrubWords text={brand.story.lead} className="story__lead serif" />
        <div className="story__aside">
          <FadeUp as="p">{brand.story.aside}</FadeUp>
          <SplitWords as="div" className="story__sig serif" text="— A. Vérane, perfumer" />
        </div>
      </div>
      <div className="story__count">
        <FadeUp className="bignum"><span>05</span><small className="label">extraits</small></FadeUp>
        <FadeUp className="bignum" delay={0.15}><span>01</span><small className="label">atelier</small></FadeUp>
        <FadeUp className="bignum" delay={0.3}><span>∞</span><small className="label">memories</small></FadeUp>
      </div>
    </section>
  )
}
