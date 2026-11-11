import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { brand } from '../brand'
import { store } from '../store'

const ease = [0.76, 0, 0.24, 1]

export default function Loader({ onDone }) {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(true)
  const done = useRef(false)

  useEffect(() => {
    let raf
    const start = performance.now()
    const minTime = store.reducedMotion ? 200 : 2000
    const fonts = document.fonts?.ready ?? Promise.resolve()
    let fontsReady = false
    fonts.then(() => (fontsReady = true))

    const tick = (now) => {
      const t = Math.min(1, (now - start) / minTime)
      // Hold at 90 until fonts and the 3D chunk have had their chance.
      const cap = fontsReady && store.ready ? 100 : 90
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.min(cap, Math.round(eased * 100)))
      if (t >= 1 && (cap === 100 || now - start > 6000)) {
        if (!done.current) {
          done.current = true
          setCount(100)
          setTimeout(() => setVisible(false), 250)
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="loader"
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 1.1, ease }}
        >
          <div className="loader__top">
            <span>{brand.descriptor}</span>
            <span>{brand.city} — {brand.est}</span>
          </div>
          <motion.div
            className="loader__mark"
            initial={{ y: '40%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-30%', opacity: 0 }}
            transition={{ duration: 1.2, ease }}
          >
            {brand.name}
          </motion.div>
          <div className="loader__count">
            <span>{String(count).padStart(3, '0')}</span>
            <i style={{ transform: `scaleX(${count / 100})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
