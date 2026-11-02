import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { store } from '../store'

const LINES = [
  '> booting neuraxine.core',
  '> connecting whatsapp cloud api ........ ok',
  '> loading agents [6/6] ................. ok',
  '> syncing workflows .................... ok',
  '> system live',
]

export default function Loader({ onDone }) {
  const [shown, setShown] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const step = store.reducedMotion ? 30 : 320
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(i)
      if (i >= LINES.length) {
        clearInterval(id)
        const wait = () => (store.ready || performance.now() > 7000 ? setTimeout(() => setVisible(false), 350) : setTimeout(wait, 120))
        wait()
      }
    }, step)
    return () => clearInterval(id)
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="loader"
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="loader__mark">NEURAXINE</div>
          <pre className="loader__log">
            {LINES.slice(0, shown).map((l) => (
              <div key={l} className={l.endsWith('live') ? 'is-live' : ''}>{l}</div>
            ))}
            <span className="caret" />
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
