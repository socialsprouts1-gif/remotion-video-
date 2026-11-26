import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { products } from '../brand'
import { ScrollTrigger } from '../lib/smooth'

const ease = [0.76, 0, 0.24, 1]
const featured = products.slice(0, 3)
// Matches the hold windows in three/choreography.js (section-local progress).
const indexAt = (p) => (p < 0.225 ? 0 : p < 0.525 ? 1 : 2)

export default function Showcase() {
  const ref = useRef(null)
  const bar = useRef(null)
  const [index, setIndex] = useState(0)

  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        setIndex(indexAt(self.progress))
        bar.current.style.transform = `scaleY(${Math.min(1, self.progress / 0.667)})`
      },
    })
    return () => st.kill()
  }, [])

  const p = featured[index]
  return (
    <section id="showcase" className="showcase" data-theme="light" ref={ref}>
      <div className="sticky">
        <div className="showcase__num under" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={p.no}
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 1.1, ease }}
            >
              {p.no}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="showcase__label">
          <span className="label">(02) — Signatures</span>
          <span className="label muted">Three to begin with</span>
        </div>

        <div className="showcase__info">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={p.id} className="showcase__card" initial="in" animate="show" exit="out">
              {[
                <span className="label" key="a">N°{p.no} — Extrait de parfum</span>,
                <h3 className="serif showcase__name" key="b">{p.name}</h3>,
                <p className="showcase__notes" key="c">{p.notes}</p>,
                <div className="showcase__row" key="d">
                  <span>{p.size}</span>
                  <span>{p.price}</span>
                  <button className="link" data-cursor="Explore">Explore the scent ⟶</button>
                </div>,
              ].map((el, i) => (
                <div className="mask" key={i}>
                  <motion.div
                    variants={{
                      in: { y: '105%' },
                      show: { y: '0%', transition: { duration: 0.9, ease, delay: 0.1 + i * 0.06 } },
                      out: { y: '-105%', transition: { duration: 0.5, ease, delay: i * 0.03 } },
                    }}
                  >
                    {el}
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="showcase__progress">
          {featured.map((f, i) => (
            <span key={f.id} className={i === index ? 'is-active' : ''}>{f.no}</span>
          ))}
          <div className="showcase__track"><i ref={bar} /></div>
        </div>
      </div>
    </section>
  )
}
