import { useLayoutEffect, useRef } from 'react'
import { Icons } from '../lib/icons'
import { industries } from '../site'
import { gsap, ScrollTrigger } from '../lib/smooth'

// Vertical scroll drives a horizontal rail of industries.
export default function Industries() {
  const ref = useRef(null)
  const track = useRef(null)

  useLayoutEffect(() => {
    const section = ref.current
    const distance = () => Math.max(0, track.current.scrollWidth - window.innerWidth)
    const setHeight = () => (section.style.height = `${distance() + window.innerHeight}px`)
    setHeight()
    const ctx = gsap.context(() => {
      gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
      })
      gsap.to('.ind__bar i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true } })
    }, section)
    ScrollTrigger.addEventListener('refreshInit', setHeight)
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', setHeight)
      ctx.revert()
    }
  }, [])

  return (
    <section id="industries" className="industries" ref={ref}>
      <div className="sticky">
        <div className="ind__track" ref={track}>
          <div className="ind__intro">
            <span className="eyebrow">Industries</span>
            <h2 className="h2">Built for how <em className="serif">your</em> business runs.</h2>
            <p className="lead">Same building blocks, tuned to each trade’s conversations, rush hours and paperwork.</p>
            <span className="ind__hint">Scroll <Icons.ArrowRight size={16} /></span>
          </div>
          {industries.map((ind, n) => {
            const Icon = Icons[ind.icon]
            return (
              <article className="ind__card" key={ind.name}>
                <span className="ind__no">{String(n + 1).padStart(2, '0')}</span>
                <span className="ind__icon"><Icon size={30} strokeWidth={1.6} /></span>
                <h3 className="ind__name">{ind.name}</h3>
                <ul>
                  {ind.uses.map((u) => (
                    <li key={u}><Icons.Check size={15} strokeWidth={2.5} />{u}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
        <div className="ind__bar" aria-hidden="true"><i /></div>
      </div>
    </section>
  )
}
