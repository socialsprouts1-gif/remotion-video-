import { useLayoutEffect, useRef } from 'react'
import { brand } from '../brand'
import { gsap } from '../lib/smooth'

export default function Statement() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
      })
      tl.fromTo('.st__a', { xPercent: -30, scale: 0.8 }, { xPercent: 4, scale: 1, ease: 'none' }, 0)
        .fromTo('.st__b', { xPercent: 45 }, { xPercent: -18, ease: 'none' }, 0)
        .fromTo('.st__rot', { rotate: -90, opacity: 0 }, { rotate: -90, opacity: 1, ease: 'none', duration: 0.3 }, 0.35)
        .fromTo('.st__small', { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'none', duration: 0.25 }, 0.6)
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="statement" className="statement" data-theme="dark" ref={ref}>
      {/* Back layer sits under the WebGL canvas, front layer above it, so the
          bottle drifts between the two lines. */}
      <div className="sticky">
        <span className="st__b statement__line" aria-hidden="true"><em>{brand.statement[1]}</em></span>
        <span className="st__rot label">Since {brand.est} — {brand.city}</span>
      </div>
      <div className="sticky sticky--front">
        <h2 className="statement__line st__a">
          {brand.statement[0]}
          <span className="sr-only"> {brand.statement[1]}</span>
        </h2>
        <p className="st__small">
          A scent is the only thing you wear that other people keep. We make it last long enough to be theirs.
        </p>
      </div>
    </section>
  )
}
