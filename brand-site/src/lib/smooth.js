import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { store, measureSections, updateScroll } from '../store'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function initSmoothScroll() {
  if (!store.reducedMotion) {
    lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  const onRefresh = () => {
    measureSections()
    updateScroll()
  }
  ScrollTrigger.addEventListener('refresh', onRefresh)
  gsap.ticker.add(updateScroll)

  const onPointer = (e) => {
    store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  const ro = new ResizeObserver(() => ScrollTrigger.refresh())
  ro.observe(document.body)

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh)
    gsap.ticker.remove(updateScroll)
    window.removeEventListener('pointermove', onPointer)
    ro.disconnect()
    lenis?.destroy()
    lenis = null
  }
}

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 2.2, ...opts })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : null
    window.scrollTo({ top: el ? el.offsetTop : typeof target === 'number' ? target : 0 })
  }
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()

export { gsap, ScrollTrigger }
