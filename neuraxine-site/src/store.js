// Render-free shared state between the DOM (GSAP / Lenis) and WebGL.

export const SECTIONS = ['hero', 'journey', 'demos', 'more', 'industries', 'roi', 'process', 'stack', 'builds', 'faq', 'contact']

export const store = {
  s: 0, // continuous section coordinate (see brand-site/src/store.js)
  tops: [],
  maxScroll: 1,
  pointer: { x: 0, y: 0, sx: 0, sy: 0 },
  intro: 0,
  ready: false,
  mobile: typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
  reducedMotion:
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
}

export function measureSections() {
  const y = window.scrollY
  store.tops = SECTIONS.map((id) => {
    const el = document.getElementById(id)
    return el ? el.getBoundingClientRect().top + y : 0
  })
  store.maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
}

export function updateScroll() {
  const y = window.scrollY
  const t = store.tops
  if (!t.length) return
  let i = t.length - 1
  for (let k = 0; k < t.length - 1; k++) {
    if (y < t[k + 1]) {
      i = k
      break
    }
  }
  const end = i < t.length - 1 ? t[i + 1] : store.maxScroll
  store.s = i + Math.min(1, Math.max(0, (y - t[i]) / Math.max(1, end - t[i])))
}

// Journey: share of the sticky part the packet uses to travel the whole path.
export const JOURNEY_TRAVEL = 0.8
export const journeyProgress = () => Math.min(1, Math.max(0, (store.s - 1) / JOURNEY_TRAVEL))
