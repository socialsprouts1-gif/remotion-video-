import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Pulls its child toward the pointer while hovered, then springs back.
export default function Magnetic({ children, strength = 0.35, className = '', as = 'div', ...rest }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 160, damping: 14, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 160, damping: 14, mass: 0.6 })
  const Comp = motion[as]

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <Comp
      ref={ref}
      className={`magnetic ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      {...rest}
    >
      {children}
    </Comp>
  )
}
