import { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react'
import { initSmoothScroll, gsap, ScrollTrigger, stopScroll, startScroll } from './lib/smooth'
import { store } from './store'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Cursor from './components/Cursor'
import Hero from './sections/Hero'
import Story from './sections/Story'
import Showcase from './sections/Showcase'
import Experience from './sections/Experience'
import Details from './sections/Details'
import Collection from './sections/Collection'
import Statement from './sections/Statement'
import Finale from './sections/Finale'

// The WebGL scene (three + r3f + drei) ships as its own chunk so the type and
// layout paint before the heavy 3D code arrives.
const Scene = lazy(() => import('./three/Scene'))

const THEMES = {
  light: { '--bg': '#ECE7DF', '--fg': '#15130F', '--muted': '#857E73', '--line': 'rgba(21,19,15,0.14)' },
  dark: { '--bg': '#100E0C', '--fg': '#EDE7DD', '--muted': '#8C8478', '--line': 'rgba(237,231,221,0.14)' },
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useLayoutEffect(() => {
    const kill = initSmoothScroll()
    stopScroll()
    window.scrollTo(0, 0)
    return kill
  }, [])

  // Each section declares data-theme; the page colour eases between them.
  useEffect(() => {
    const triggers = gsap.utils.toArray('[data-theme]').map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (!self.isActive) return
          const name = el.dataset.theme
          store.themeTarget = name === 'dark' ? 1 : 0
          gsap.to(document.documentElement, { ...THEMES[name], duration: 1.1, ease: 'power2.inOut' })
          document.documentElement.dataset.mode = name
        },
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  useEffect(() => {
    if (!loaded) return
    startScroll()
    gsap.to(store, { intro: 1, duration: store.reducedMotion ? 0.01 : 2.6, ease: 'expo.out', delay: 0.1 })
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [loaded])

  return (
    <>
      <Loader onDone={() => setLoaded(true)} />
      <div className="stage" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav />
      <main className={loaded ? 'is-loaded' : ''}>
        <Hero />
        <Story />
        <Showcase />
        <Experience />
        <Details />
        <Collection />
        <Statement />
        <Finale />
      </main>
      <svg className="defs" aria-hidden="true">
        <filter id="distort">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  )
}
