import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { brand } from '../brand'
import { ScrollTrigger } from '../lib/smooth'

const ease = [0.76, 0, 0.24, 1]
// Section-local progress thresholds; mirrored in three/Notes.jsx.
const phaseAt = (p) => (p < 0.243 ? 0 : p < 0.478 ? 1 : 2)

export default function Experience() {
  const ref = useRef(null)
  const ring = useRef(null)
  const [phase, setPhase] = useState(0)

  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        setPhase(phaseAt(self.progress))
        const k = Math.min(1, self.progress / 0.714)
        ring.current.style.strokeDashoffset = String(1 - k)
      },
    })
    return () => st.kill()
  }, [])

  const ph = brand.experience[phase]
  return (
    <section id="experience" className="experience" data-theme="dark" ref={ref}>
      <div className="sticky">
        <div className="experience__word under" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ph.word}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-60%', opacity: 0 }}
              transition={{ duration: 1.2, ease }}
            >
              {ph.word}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="experience__head">
          <span className="label">(03) — The Experience</span>
          <span className="label muted">A scent, in three acts</span>
        </div>

        <div className="experience__phase">
          <svg viewBox="0 0 100 100" className="experience__ring">
            <circle cx="50" cy="50" r="46" pathLength="1" />
            <circle ref={ring} cx="50" cy="50" r="46" pathLength="1" className="fg" />
          </svg>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={ph.roman}
              className="serif"
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 20 }}
              transition={{ duration: 0.6, ease }}
            >
              {ph.roman}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="experience__copy">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ph.key}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.8, ease }}
            >
              <h3 className="serif">{ph.title}</h3>
              <p>{ph.copy}</p>
              <ul>
                {ph.notes.map((n) => (
                  <li key={n} className="label">{n}</li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="experience__steps">
          {brand.experience.map((e, i) => (
            <li key={e.key} className={i === phase ? 'is-active' : ''}>
              <span className="label">{e.roman}</span>
              <span>{e.word} notes</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
