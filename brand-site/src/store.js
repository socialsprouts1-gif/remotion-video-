// Mutable, render-free shared state between the DOM (GSAP / Lenis) and the
// WebGL scene. Read inside useFrame; never put this in React state.

export const SECTIONS = [
  'hero',
  'story',
  'showcase',
  'experience',
  'details',
  'collection',
  'statement',
  'finale',
]

export const store = {
  // Continuous section coordinate: `s = 2.5` means halfway between the top of
  // section 2 reaching the viewport top and section 3 doing the same.
  s: 0,
  tops: [],
  maxScroll: 1,
  pointer: { x: 0, y: 0 },
  intro: 0,
  theme: 0, // 0 = light, 1 = dark (eased)
  themeTarget: 0,
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
  const start = t[i]
  const end = i < t.length - 1 ? t[i + 1] : store.maxScroll
  const span = Math.max(1, end - start)
  store.s = i + Math.min(1, Math.max(0, (y - start) / span))
}

// Local 0..1 progress through section `i`.
export const local = (i) => Math.min(1, Math.max(0, store.s - i))
