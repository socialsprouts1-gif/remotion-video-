import { useLayoutEffect, useRef } from 'react'
import { Icons } from '../lib/icons'
import { moreServices } from '../site'
import { gsap, scrollTo } from '../lib/smooth'
import { SplitWords } from '../components/Reveal'
import { micro } from '../demos/micro'

// Cursor-following spotlight on each card.
const spot = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function MoreServices() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bento__card', {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: { each: 0.08, from: 'start' },
        scrollTrigger: { trigger: '.bento', start: 'top 80%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="more" className="more" ref={ref}>
      <div className="more__head">
        <span className="eyebrow">More services</span>
        <SplitWords as="h2" className="h2" text={['Everything that repeats,', 'we automate.']} />
        <p className="lead">The same approach, applied to calls, documents, content and sales. Each system is built around how your team already works.</p>
      </div>
      <div className="bento">
        {moreServices.map((s, n) => {
          const Icon = Icons[s.icon]
          const Demo = micro[s.demo]
          return (
            <article key={s.id} className={`bento__card ${s.size ? `is-${s.size}` : ''}`} onPointerMove={spot}>
              <div className="bento__text">
                <span className="bento__icon"><Icon size={20} /></span>
                <span className="bento__no">{String(n + 5).padStart(2, "0")}</span>
                <h3 className="h3">{s.name}</h3>
                <p>{s.line}</p>
                <ul>
                  {s.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                <button className="link" onClick={() => scrollTo('#contact')} data-cursor="Book">
                  Talk to us <Icons.ArrowRight size={15} />
                </button>
              </div>
              <div className="bento__demo"><Demo /></div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
