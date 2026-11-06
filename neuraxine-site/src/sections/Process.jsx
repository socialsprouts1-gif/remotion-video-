import { useLayoutEffect, useRef } from 'react'
import { process } from '../site'
import { gsap } from '../lib/smooth'

export default function Process() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.process__line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.process__list', start: 'top 70%', end: 'bottom 60%', scrub: true } })
      gsap.utils.toArray('.process__item').forEach((el) => {
        gsap.from(el, { opacity: 0.15, x: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 75%' } })
        ScrollTriggerToggle(el)
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="process" className="process" ref={ref}>
      <div className="process__head">
        <span className="eyebrow">Process</span>
        <h2 className="h2">From audit <em className="serif">to autopilot.</em></h2>
      </div>
      <div className="process__list">
        <div className="process__line" aria-hidden="true"><i /></div>
        {process.map((p, i) => (
          <div className="process__item" key={p.title}>
            <span className="process__dot" aria-hidden="true" />
            <span className="process__no">Step {i + 1}</span>
            <h3 className="h3">{p.title}</h3>
            <p className="muted">{p.copy}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ScrollTriggerToggle(el) {
  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 60%', toggleClass: 'is-on' } })
}
