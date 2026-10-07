import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// A dot that tracks exactly and a ring that trails on a spring. Elements with
// data-cursor="Label" grow the ring and print the label inside it.
export default function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 220, damping: 26, mass: 0.5 })
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button')
      setHover(!!t)
      setLabel(t?.dataset?.cursor ?? '')
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} />
      <motion.div
        className={`cursor-ring ${hover ? 'is-hover' : ''} ${label ? 'has-label' : ''}`}
        style={{ x: rx, y: ry }}
      >
        <span>{label}</span>
      </motion.div>
    </>
  )
}
