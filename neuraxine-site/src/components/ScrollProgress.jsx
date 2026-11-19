import { useEffect, useRef } from 'react'
import { gsap } from '../lib/smooth'

// Thin lime bar along the top edge showing how far down the page you are.
export default function ScrollProgress() {
  const ref = useRef(null)
  useEffect(() => {
    const set = gsap.quickSetter(ref.current, 'scaleX')
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      set(max > 0 ? window.scrollY / max : 0)
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])
  return <div className="progress" ref={ref} aria-hidden="true" />
}
