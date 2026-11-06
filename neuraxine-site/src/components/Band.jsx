import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/smooth'

// Oversized words that slide sideways with scroll, separating two sections.
export default function Band({ words = ['Automate', 'Respond', 'Convert', 'Scale'] }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.band__row', { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, ref)
    return () => ctx.revert()
  }, [])
  const row = [...words, ...words, ...words]
  return (
    <div className="band" ref={ref} aria-hidden="true">
      <div className="band__row">
        {row.map((w, i) => (
          <span key={i} className={i % 2 ? 'outline' : ''}>{w}<i /></span>
        ))}
      </div>
    </div>
  )
}
