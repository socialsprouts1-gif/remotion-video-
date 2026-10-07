import { useLayoutEffect, useRef } from 'react'
import { products } from '../brand'
import { gsap, ScrollTrigger } from '../lib/smooth'

// Vertical scroll drives a horizontal track. The 3D bottles are pinned to the
// [data-anchor] boxes every frame, so they ride the track with the panels.
export default function Collection() {
  const ref = useRef(null)
  const track = useRef(null)

  useLayoutEffect(() => {
    const section = ref.current
    const setHeight = () => {
      const dist = Math.max(0, track.current.scrollWidth - window.innerWidth)
      section.style.height = `${dist + window.innerHeight}px`
    }
    setHeight()
    const ctx = gsap.context(() => {
      gsap.to(track.current, {
        x: () => -Math.max(0, track.current.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      gsap.utils.toArray('.coll__arch').forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 10 + (i % 2) * 8 },
          {
            yPercent: -6 - (i % 2) * 8,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
      gsap.fromTo(
        '.coll__marquee span',
        { xPercent: 0 },
        { xPercent: -35, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    }, section)
    ScrollTrigger.addEventListener('refreshInit', setHeight)
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', setHeight)
      ctx.revert()
    }
  }, [])

  return (
    <section id="collection" className="collection" data-theme="light" ref={ref}>
      <div className="sticky">
        <div className="coll__marquee under outline" aria-hidden="true">
          <span>{products.map((p) => p.name).join(' — ')} — {products[0].name}</span>
        </div>
        <div className="coll__track" ref={track}>
          <div className="coll__intro">
            <span className="label">(05) — The Collection</span>
            <h2 className="display">
              Five<br />
              <em>extraits.</em>
            </h2>
            <p>Each one composed around a single raw material, then left alone long enough to become something else.</p>
            <span className="label muted">Scroll ⟶</span>
          </div>
          {products.map((p, i) => (
            <article className={`coll__item coll__item--${i}`} key={p.id} style={{ '--arch': p.arch, '--liquid': p.liquid }}>
              <span className="coll__no serif">{p.no}</span>
              <div className="coll__arch">
                <div className="coll__anchor" data-anchor={p.id} />
              </div>
              <div className="coll__text">
                <h3 className="serif">{p.name}</h3>
                <span className="label muted">{p.notes}</span>
                <div className="coll__row">
                  <span className="label">{p.size}</span>
                  <span className="label">{p.price}</span>
                </div>
              </div>
            </article>
          ))}
          <div className="coll__outro">
            <span className="serif">Discovery set — five 2 ml vials, € 45</span>
            <button className="link" data-cursor="Add">Add to bag ⟶</button>
          </div>
        </div>
      </div>
    </section>
  )
}
