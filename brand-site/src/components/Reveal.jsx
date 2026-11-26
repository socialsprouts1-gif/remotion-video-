import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/smooth'

// Splits text into masked words that rise into place when scrolled into view.
export function SplitWords({ text, className = '', as: Tag = 'span', delay = 0, stagger = 0.045, start = 'top 85%' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const words = ref.current.querySelectorAll('.w > span')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115, rotate: 4 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.4,
          ease: 'expo.out',
          stagger,
          delay,
          scrollTrigger: { trigger: ref.current, start },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [delay, stagger, start])

  const parts = Array.isArray(text) ? text : [text]
  return (
    <Tag ref={ref} className={`split ${className}`}>
      {parts.map((line, li) => (
        <span className="line" key={li}>
          {line.split(' ').map((w, wi) => (
            <span className="w" key={wi}>
              <span>{w}&nbsp;</span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}

// Words fade from ghosted to solid as the paragraph scrubs past.
export function ScrubWords({ text, className = '' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current.querySelectorAll('.sw'),
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <p ref={ref} className={className}>
      {text.split(' ').map((w, i) => (
        <span className="sw" key={i}>
          {w}{' '}
        </span>
      ))}
    </p>
  )
}

// Fades/lifts an element the first time it enters the viewport.
export function FadeUp({ children, className = '', delay = 0, y = 40, as: Tag = 'div', ...rest }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y,
        opacity: 0,
        duration: 1.4,
        delay,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [delay, y])
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
