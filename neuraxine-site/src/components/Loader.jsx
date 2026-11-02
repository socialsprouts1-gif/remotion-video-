import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { store } from '../store'

const ease = [0.76, 0, 0.24, 1]

export default function Loader({ onDone }) {
  const [p, setP] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let raf
    const start = performance.now()
    const min = store.reducedMotion ? 150 : 1700
    const tick = (now) => {
      const t = Math.min(1, (now - start) / min)
      const cap = store.ready ? 1 : 0.9
      setP(Math.min(cap, 1 - Math.pow(1 - t, 3)))
      if (t >= 1 && (store.ready || now - start > 7000)) return setTimeout(() => setVisible(false), 250)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div className="loader" exit={{ clipPath: 'inset(0% 0% 100% 0%)' }} initial={{ clipPath: 'inset(0% 0% 0% 0%)' }} transition={{ duration: 1, ease }}>
          <motion.img
            src="/brand/logo.svg"
            alt="Neuraxine"
            className="loader__logo"
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1.1, ease }}
          />
          <div className="loader__bar" aria-hidden="true"><i style={{ transform: `scaleX(${p})` }} /></div>
          <span className="loader__pct">{Math.round(p * 100)}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
