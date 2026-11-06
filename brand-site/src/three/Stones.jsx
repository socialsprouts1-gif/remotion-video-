import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'
import { brass, travertine, makeGlass } from './materials'
import { halfHeightAt } from './Actor'

const { damp } = THREE.MathUtils

// Abstract companions: pebbles, brass rings and glass beads that drift upward
// through the hero/story at depth-dependent speeds, and gather again at the end.
const ITEMS = [
  { kind: 'pebble', x: -0.36, y: -0.62, z: -3, sc: 0.55, speed: 1.4, origin: 0 },
  { kind: 'ring', x: 0.55, y: 0.5, z: -1.5, sc: 0.5, speed: 1.0, origin: 0 },
  { kind: 'pebble', x: 0.66, y: 0.12, z: -4.2, sc: 0.8, speed: 0.7, origin: 0 },
  { kind: 'bead', x: -0.12, y: 0.64, z: 2, sc: 0.22, speed: 2.0, origin: 0 },
  { kind: 'pebble', x: -0.62, y: -0.12, z: 3.2, sc: 0.2, speed: 2.4, origin: 0, desktop: true },
  { kind: 'ring', x: 0.2, y: -1.5, z: -2, sc: 0.7, speed: 1.3, origin: 0 },
  { kind: 'pebble', x: 0.42, y: -1.9, z: -1, sc: 0.42, speed: 1.6, origin: 0 },
  { kind: 'bead', x: -0.7, y: -1.7, z: 0.5, sc: 0.3, speed: 1.8, origin: 0, desktop: true },
  // Finale
  { kind: 'pebble', x: 0.05, y: -0.7, z: -3, sc: 0.6, speed: 1.2, origin: 7 },
  { kind: 'ring', x: 0.48, y: 0.15, z: -2.5, sc: 0.45, speed: 0.9, origin: 7, desktop: true },
  { kind: 'bead', x: 0.9, y: 0.3, z: 1.5, sc: 0.2, speed: 1.6, origin: 7 },
]

function pebbleGeometry(seed) {
  const g = new THREE.IcosahedronGeometry(1, 5)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n =
      Math.sin(v.x * 2.1 + seed) * 0.08 +
      Math.sin(v.y * 3.3 + seed * 2.0) * 0.05 +
      Math.sin(v.z * 4.7 + seed * 0.7) * 0.03
    v.multiplyScalar(1 + n)
    v.y *= 0.62
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

function Item({ item, index }) {
  const ref = useRef()
  const { geometry, material } = useMemo(() => {
    if (item.kind === 'pebble') return { geometry: pebbleGeometry(index * 1.7), material: travertine }
    if (item.kind === 'ring') return { geometry: new THREE.TorusGeometry(1, 0.075, 32, 128), material: brass }
    return { geometry: new THREE.SphereGeometry(1, 48, 32), material: makeGlass('#ffffff') }
  }, [item, index])

  useFrame((state, dt) => {
    const g = ref.current
    const { camera, size, clock } = state
    const aspect = size.width / size.height
    const t = clock.elapsedTime
    const rel = store.s - item.origin
    const yFrac = item.y + rel * item.speed
    const hh = halfHeightAt(camera.position.z, item.z)
    const x = (aspect < 0.85 ? item.x * 1.15 : item.x) * hh * aspect + (store.pointer.sx ?? 0) * 0.3 * (1 + item.z * 0.15)
    const y = yFrac * hh + (store.pointer.sy ?? 0) * 0.2 * (1 + item.z * 0.15) + Math.sin(t * 0.7 + index) * 0.08
    const intro = 1 - Math.pow(1 - store.intro, 3)
    const visible = item.origin === 0 ? 1 : THREE.MathUtils.smoothstep(store.s, item.origin - 0.6, item.origin - 0.2)
    const sc = item.sc * intro * visible
    g.position.x = damp(g.position.x, x, 3, dt)
    g.position.y = damp(g.position.y, y, 3, dt)
    g.position.z = item.z
    g.scale.setScalar(Math.max(0.0001, damp(g.scale.x, sc, 3, dt)))
    g.visible = Math.abs(yFrac) < 2.2 && g.scale.x > 0.01
    g.rotation.x = t * 0.12 + index + rel * 1.2
    g.rotation.y = t * 0.18 + index * 0.5 + rel * 0.8
  })

  return <mesh ref={ref} geometry={geometry} material={material} castShadow scale={0.0001} renderOrder={item.kind === 'bead' ? 3 : 0} />
}

export default function Stones() {
  const items = useMemo(() => ITEMS.filter((i) => !(store.mobile && i.desktop)), [])
  return items.map((item, i) => <Item key={i} item={item} index={i} />)
}
