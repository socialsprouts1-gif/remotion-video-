import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'
import { tracks, sample, anchorWeight, compressX, smoothstep } from './choreography'
import { models } from './Bottles'

const { damp, lerp } = THREE.MathUtils
const TAN = Math.tan(THREE.MathUtils.degToRad(35 / 2))
const BOTTLE_H = 2.4

const frame = new Array(8).fill(0)
const target = new THREE.Vector3()
const anchorPos = new THREE.Vector3()

// Visible half-height of the frustum at depth z for a camera on the z axis.
export const halfHeightAt = (camZ, z) => (camZ - z) * TAN

// One bottle: samples its scroll track, blends toward its DOM anchor in the
// collection, then layers pointer parallax and an idle float on top.
export default function Actor({ product, seed = 0 }) {
  const group = useRef()
  const rig = useRef({})
  const anchorEl = useRef(null)
  const Model = models[product.id]
  const track = tracks[product.id]

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    dt = Math.min(dt, 1 / 20)
    const { camera, size, clock } = state
    const t = clock.elapsedTime
    const aspect = size.width / size.height
    const portrait = aspect < 0.85
    const s = store.s

    sample(track, s, frame)
    let [x, y, z, rx, ry, rz, sc, cap] = frame
    if (portrait) {
      x = compressX(x)
      if (Math.abs(y) < 1) y += 0.1
      // Phones: step aside from the story paragraph instead of covering it.
      if (product.id === 'ambre') {
        const aside = smoothstep(0.45, 0.9, s) * (1 - smoothstep(1.6, 1.95, s))
        x = lerp(x, 0.78, aside)
        y = lerp(y, 0.62, aside)
        sc *= 1 - 0.35 * aside
      }
    }

    const hh = halfHeightAt(camera.position.z, z)
    // On narrow screens bottles scale down so they keep breathing room.
    const fit = portrait ? THREE.MathUtils.clamp(aspect * 1.45, 0.62, 1) : 1
    target.set(x * hh * aspect, y * hh, z)
    let scale = sc * fit

    // Pin to the collection panel this product belongs to.
    const w = anchorWeight(s)
    if (w > 0.001) {
      if (!anchorEl.current) anchorEl.current = document.querySelector(`[data-anchor="${product.id}"]`)
      const el = anchorEl.current
      if (el) {
        const r = el.getBoundingClientRect()
        const h0 = halfHeightAt(camera.position.z, 0)
        const nx = ((r.left + r.width / 2) / size.width) * 2 - 1
        const ny = -(((r.top + r.height / 2) / size.height) * 2 - 1)
        anchorPos.set(nx * h0 * aspect, ny * h0, 0)
        const anchorScale = ((r.height / size.height) * 2 * h0 * 0.6) / BOTTLE_H
        target.lerp(anchorPos, w)
        scale = lerp(scale, anchorScale, w)
        rx = lerp(rx, 0.04, w)
        ry = lerp(ry, Math.round(ry / (Math.PI * 2)) * Math.PI * 2 + Math.sin(t * 0.4 + seed) * 0.5, w)
        rz = lerp(rz, 0, w)
      }
    }

    // Entrance after the loader.
    const intro = store.intro
    const introEase = 1 - Math.pow(1 - intro, 3)
    scale *= 0.001 + introEase * 0.999
    target.y -= (1 - introEase) * 1.6
    ry -= (1 - introEase) * 1.4

    // Pointer parallax: nearer objects travel further.
    const depth = 1 + z * 0.12
    const px = store.pointer.sx ?? 0
    const py = store.pointer.sy ?? 0
    target.x += px * 0.22 * depth
    target.y += py * 0.14 * depth

    // Idle float.
    const reduce = store.reducedMotion ? 0 : 1
    target.y += Math.sin(t * 0.9 + seed) * 0.07 * scale * reduce
    rx += (Math.cos(t * 0.5 + seed) * 0.03 - py * 0.18) * reduce
    ry += (Math.sin(t * 0.25 + seed) * 0.3 + px * 0.35) * reduce
    rz += Math.sin(t * 0.6 + seed) * 0.035 * reduce

    const k = lerp(3.2, 10, w)
    g.position.x = damp(g.position.x, target.x, k, dt)
    g.position.y = damp(g.position.y, target.y, k, dt)
    g.position.z = damp(g.position.z, target.z, k, dt)
    g.rotation.x = damp(g.rotation.x, rx, 3, dt)
    g.rotation.y = damp(g.rotation.y, ry, 3, dt)
    g.rotation.z = damp(g.rotation.z, rz, 3, dt)
    const sNow = damp(g.scale.x, scale, k, dt)
    g.scale.setScalar(Math.max(sNow, 0.0001))
    g.visible = sNow > 0.01

    const capObj = rig.current.cap
    if (capObj) {
      capObj.position.y = damp(capObj.position.y, 0.88 + cap * 0.62, 3.5, dt)
      capObj.rotation.y = damp(capObj.rotation.y, cap * 1.2, 3.5, dt)
      capObj.rotation.z = damp(capObj.rotation.z, cap * 0.12, 3.5, dt)
    }
  })

  return (
    <group ref={group} scale={0.0001}>
      <Model product={product} rig={rig} />
    </group>
  )
}
