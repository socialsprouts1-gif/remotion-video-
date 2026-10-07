import { useLayoutEffect, useRef } from 'react'
import { brand } from '../brand'
import { gsap } from '../lib/smooth'
import { SplitWords } from '../components/Reveal'

const materials = [
  { key: 'brass', title: 'Brushed brass', caption: 'Cap, collar and seal' },
  { key: 'glass', title: 'Flint glass', caption: 'Nine millimetres, hand-polished' },
  { key: 'resin', title: 'Labdanum resin', caption: 'The amber at the base of N°01' },
]

export default function Details() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.mat').forEach((el) => {
        const img = el.querySelector('.mat__img')
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } },
        )
        gsap.fromTo(img, { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })

        // Hover: ripple the texture through the shared SVG displacement filter.
        const disp = document.querySelector('#distort feDisplacementMap')
        const turb = document.querySelector('#distort feTurbulence')
        const state = { s: 0, f: 0.012 }
        const apply = () => {
          disp.setAttribute('scale', state.s.toFixed(2))
          turb.setAttribute('baseFrequency', `${state.f.toFixed(4)} ${(state.f * 1.6).toFixed(4)}`)
        }
        el.addEventListener('pointerenter', () => {
          img.style.filter = 'url(#distort)'
          gsap.fromTo(state, { s: 0, f: 0.008 }, { s: 38, f: 0.018, duration: 0.5, ease: 'power2.out', onUpdate: apply, yoyo: true, repeat: 1, onComplete: () => (img.style.filter = '') })
        })
      })
      gsap.fromTo(
        '.details__vertical',
        { yPercent: 20 },
        { yPercent: -60, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="details" className="details" data-theme="light" ref={ref}>
      <div className="details__vertical vertical-rot under outline" aria-hidden="true">Details</div>
      <div className="details__head">
        <span className="label">(04) — Atelier</span>
        <SplitWords as="h2" className="display details__title" text={['Every detail,', 'considered.']} />
      </div>

      <div className="details__specs">
        {brand.details.map((d) => (
          <div className="spec" key={d.label}>
            <span className="spec__value serif">{d.value}<small>{d.unit}</small></span>
            <span className="spec__label">{d.label}</span>
          </div>
        ))}
      </div>

      <div className="details__mats">
        {materials.map((m, i) => (
          <figure className={`mat mat--${i}`} key={m.key} data-cursor="Touch">
            <div className={`mat__img tex-${m.key}`} />
            <figcaption>
              <span className="label">0{i + 1}</span>
              <span className="serif">{m.title}</span>
              <span className="label muted">{m.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
