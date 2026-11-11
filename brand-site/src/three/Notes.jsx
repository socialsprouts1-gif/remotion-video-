import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'
import { halfHeightAt } from './Actor'

const { damp } = THREE.MathUtils

// Trapezoid envelope: 0 → 1 over [a,b], hold, 1 → 0 over [c,d].
const trap = (x, a, b, c, d) =>
  THREE.MathUtils.smoothstep(x, a, b) * (1 - THREE.MathUtils.smoothstep(x, c, d))

// Section-local windows for each act; mirrored in sections/Experience.jsx.
const PHASES = [
  { win: [-0.06, 0.03, 0.2, 0.27] },
  { win: [0.2, 0.27, 0.44, 0.51] },
  { win: [0.44, 0.51, 0.66, 0.74] },
]

function material(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.3, ...opts })
}

// Raw materials of each act orbit the open bottle: citrus and pepper (top),
// iris petals (heart), resin and vetiver (base).
function buildPhase(k, count) {
  const rand = (i, n) => {
    const x = Math.sin((i + 1) * 12.9898 + n * 78.233 + k * 37.719) * 43758.5453
    return x - Math.floor(x)
  }
  const items = []
  for (let i = 0; i < count; i++) {
    let geometry, mat, shape
    if (k === 0) {
      const pepper = i % 3 === 0
      geometry = new THREE.SphereGeometry(1, 32, 24)
      mat = pepper ? material('#a8382e') : material(i % 2 ? '#e2a93b' : '#d47a2a', { roughness: 0.45 })
      shape = pepper ? [0.07, 0.07, 0.07] : [0.17, 0.17, 0.17]
    } else if (k === 1) {
      geometry = new THREE.SphereGeometry(1, 32, 16)
      mat = material(i % 3 === 0 ? '#8d7aa3' : '#c3b2d6', { roughness: 0.55, sheen: 1, sheenColor: new THREE.Color('#efe6ff') })
      shape = [0.26, 0.04, 0.15]
    } else {
      const stick = i % 3 === 0
      geometry = stick ? new THREE.CylinderGeometry(1, 1, 1, 8) : new THREE.DodecahedronGeometry(1, 0)
      mat = stick
        ? material('#5c4a2c', { roughness: 0.8, clearcoat: 0 })
        : material('#b5631c', { roughness: 0.12, transmission: 0, sheen: 0.5, emissive: '#3a1404', emissiveIntensity: 0.4 })
      shape = stick ? [0.025, 0.7, 0.025] : [0.13, 0.13, 0.13]
    }
    items.push({
      geometry,
      mat,
      shape,
      radius: 1.45 + rand(i, 1) * 0.9,
      angle: rand(i, 2) * Math.PI * 2,
      y: (rand(i, 3) - 0.5) * 2.4,
      speed: 0.15 + rand(i, 4) * 0.25,
      spin: [rand(i, 5) * 3, rand(i, 6) * 3, rand(i, 7) * 3],
    })
  }
  return items
}

function Phase({ k }) {
  const refs = useRef([])
  const items = useMemo(() => buildPhase(k, store.mobile ? 7 : 12), [k])
  const env = useRef(0)

  useFrame((state, dt) => {
    const q = store.s - 3
    const [a, b, c, d] = PHASES[k].win
    env.current = damp(env.current, trap(q, a, b, c, d), 4, dt)
    const w = env.current
    const t = state.clock.elapsedTime
    const hh = halfHeightAt(state.camera.position.z, 0.6)
    const cy = -0.06 * hh
    const aspect = state.size.width / state.size.height
    const fit = aspect < 0.85 ? THREE.MathUtils.clamp(aspect * 1.45, 0.62, 1) : 1
    items.forEach((it, i) => {
      const m = refs.current[i]
      if (!m) return
      m.visible = w > 0.01
      if (!m.visible) return
      const r = it.radius * (0.55 + 0.45 * w) * fit
      const ang = it.angle + t * it.speed + q * 3
      m.position.set(Math.cos(ang) * r, cy + it.y * (0.6 + 0.4 * w) + Math.sin(t + i) * 0.05, 0.6 + Math.sin(ang) * r * 0.55)
      m.scale.set(it.shape[0] * w, it.shape[1] * w, it.shape[2] * w)
      m.rotation.set(it.spin[0] + t * 0.3, it.spin[1] + t * 0.2, it.spin[2])
    })
  })

  return items.map((it, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)} geometry={it.geometry} material={it.mat} visible={false} />
  ))
}

export default function Notes() {
  return [0, 1, 2].map((k) => <Phase key={k} k={k} />)
}
