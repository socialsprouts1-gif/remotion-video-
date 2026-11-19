import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_-+*#'

// Text that decodes from random glyphs the first time it scrolls into view
// (or immediately when `play` flips true).
export default function Scramble({ text, as: Tag = 'span', className = '', play, duration = 900 }) {
  const ref = useRef(null)
  const [out, setOut] = useState(text)
  const [go, setGo] = useState(false)

  useEffect(() => {
    if (play !== undefined) {
      if (play) setGo(true)
      return
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setGo(true), io.disconnect()), { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [play])

  useEffect(() => {
    if (!go || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setOut(text)
    let raf
    const start = performance.now()
    const tick = (now) => {
      const k = Math.min(1, (now - start) / duration)
      const n = Math.floor(k * text.length)
      setOut(
        text
          .split('')
          .map((c, i) => (i < n || c === ' ' ? c : CHARS[(Math.random() * CHARS.length) | 0]))
          .join(''),
      )
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [go, text, duration])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  )
}
