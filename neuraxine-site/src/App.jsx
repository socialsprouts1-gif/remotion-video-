import { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react'
import { initSmoothScroll, gsap, ScrollTrigger, stopScroll, startScroll } from './lib/smooth'
import { store } from './store'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Cursor from './components/Cursor'
import Hero from './sections/Hero'
import Journey from './sections/Journey'
import Demos from './sections/Demos'
import Roi from './sections/Roi'
import Process from './sections/Process'
import Stack from './sections/Stack'
import Builds from './sections/Builds'
import Contact from './sections/Contact'

const Scene = lazy(() => import('./three/Scene'))

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useLayoutEffect(() => {
    const kill = initSmoothScroll()
    stopScroll()
    window.scrollTo(0, 0)
    return kill
  }, [])

  useEffect(() => {
    if (!loaded) return
    startScroll()
    gsap.to(store, { intro: 1, duration: store.reducedMotion ? 0.01 : 2.4, ease: 'expo.out' })
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
      <div className="scan" aria-hidden="true" />
      <Cursor />
      <Nav />
      <main className={loaded ? 'is-loaded' : ''}>
        <Hero />
        <Journey />
        <Demos />
        <Roi />
        <Process />
        <Stack />
        <Builds />
        <Contact />
      </main>
    </>
  )
}
