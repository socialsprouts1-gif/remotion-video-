import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { brass, lacquer, travertine, marble, makeGlass, makeLiquid, makeLabelTexture } from './materials'

const HEIGHT = 2.4
const LABEL_SQUARE = { width: 420, height: 420 }

// Centres a model on the origin and scales it to a common height so every
// bottle shares the same scale vocabulary in the choreography.
function Normalize({ children }) {
  const outer = useRef()
  const inner = useRef()
  useLayoutEffect(() => {
    // Measure in the outer group's local space so parent transforms (the
    // actor's entrance scale) don't leak into the fit.
    outer.current.updateWorldMatrix(true, true)
    const toLocal = outer.current.matrixWorld.clone().invert()
    const box = new THREE.Box3().setFromObject(inner.current).applyMatrix4(toLocal)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const k = HEIGHT / size.y
    outer.current.scale.setScalar(k)
    inner.current.position.set(-center.x, -center.y, -center.z)
  }, [])
  return (
    <group ref={outer}>
      <group ref={inner}>{children}</group>
    </group>
  )
}

// Glass rendered as two passes (inner walls, then outer walls) so the far side
// of the bottle reads through the near side.
function Glass({ geometry, tint, flat = false, ...props }) {
  const [back, front] = useMemo(() => {
    const b = makeGlass(tint, THREE.BackSide)
    const f = makeGlass(tint, THREE.FrontSide)
    b.flatShading = f.flatShading = flat
    return [b, f]
  }, [tint, flat])
  return (
    <group {...props}>
      <mesh geometry={geometry} material={back} renderOrder={2} />
      <mesh geometry={geometry} material={front} renderOrder={3} castShadow />
    </group>
  )
}

const geo = (fn) => fn()
const useGeo = (fn) => useMemo(() => geo(fn), []) // eslint-disable-line react-hooks/exhaustive-deps

function useLabel(product, size) {
  return useMemo(() => {
    const tex = makeLabelTexture(product, size)
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, metalness: 0 })
  }, [product, size])
}

// N°01 — rectangular flacon, brass cylinder cap (the cap lifts in the Experience).
export function Ambre({ product, rig }) {
  const liquid = useMemo(() => makeLiquid(product.liquid), [product])
  const label = useLabel(product)
  const body = useGeo(() => new RoundedBoxGeometry(1.25, 1.55, 0.6, 6, 0.12))
  const fill = useGeo(() => new RoundedBoxGeometry(1.07, 1.12, 0.44, 5, 0.08))
  const neck = useGeo(() => new THREE.CylinderGeometry(0.17, 0.17, 0.16, 48))
  const cap = useRef()
  useLayoutEffect(() => {
    if (rig) rig.current.cap = cap.current
  }, [rig])
  return (
    <Normalize>
      <Glass geometry={body} tint={product.glass} position={[0, -0.35, 0]} />
      <mesh geometry={fill} position={[0, -0.53, 0]} material={liquid} castShadow />
      <mesh position={[0, -0.42, 0.302]} material={label}>
        <planeGeometry args={[0.62, 0.39]} />
      </mesh>
      <Glass geometry={neck} tint={product.glass} position={[0, 0.5, 0]} />
      <mesh position={[0, 0.47, 0]} material={brass}>
        <cylinderGeometry args={[0.21, 0.21, 0.06, 48]} />
      </mesh>
      <group ref={cap} position={[0, 0.88, 0]}>
        <mesh material={brass} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.62, 72]} />
        </mesh>
        <mesh position={[0, -0.25, 0]} material={lacquer}>
          <cylinderGeometry args={[0.364, 0.364, 0.025, 72]} />
        </mesh>
      </group>
    </Normalize>
  )
}

function circleProfile(r, cy, a0, a1, steps) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps
    pts.push(new THREE.Vector2(r * Math.cos(a), cy + r * Math.sin(a)))
  }
  return pts
}

// N°02 — round flask with a travertine stone stopper.
export function Iris({ product }) {
  const liquid = useMemo(() => makeLiquid(product.liquid), [product])
  const [outer, fill] = useMemo(() => {
    const o = circleProfile(0.78, -0.35, -1.02, 1.12, 40)
    o.unshift(new THREE.Vector2(0, o[0].y))
    o.push(new THREE.Vector2(0.17, 0.42), new THREE.Vector2(0.17, 0.62), new THREE.Vector2(0, 0.62))
    const l = circleProfile(0.66, -0.35, -1.02, 0.25, 30)
    l.unshift(new THREE.Vector2(0, l[0].y))
    l.push(new THREE.Vector2(0, l[l.length - 1].y))
    return [new THREE.LatheGeometry(o, 96), new THREE.LatheGeometry(l, 72)]
  }, [])
  return (
    <Normalize>
      <Glass geometry={outer} tint={product.glass} />
      <mesh geometry={fill} material={liquid} castShadow />
      <mesh position={[0, 0.62, 0]} material={brass}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 48]} />
      </mesh>
      <mesh position={[0, 1.02, 0]} material={travertine} castShadow>
        <sphereGeometry args={[0.38, 64, 48]} />
      </mesh>
    </Normalize>
  )
}

// N°03 — tall column with a faceted lacquer cap and a wrapped label.
export function Figue({ product }) {
  const liquid = useMemo(() => makeLiquid(product.liquid), [product])
  const label = useLabel(product, LABEL_SQUARE)
  const body = useGeo(() => new THREE.CylinderGeometry(0.45, 0.45, 1.9, 72))
  const flatLacquer = useMemo(() => {
    const m = lacquer.clone()
    m.flatShading = true
    return m
  }, [])
  return (
    <Normalize>
      <Glass geometry={body} tint={product.glass} position={[0, -0.2, 0]} />
      <mesh position={[0, -0.45, 0]} material={liquid} castShadow>
        <cylinderGeometry args={[0.39, 0.39, 1.35, 64]} />
      </mesh>
      <mesh position={[0, -0.32, 0]} material={label}>
        <cylinderGeometry args={[0.453, 0.453, 0.55, 48, 1, true, -0.6, 1.2]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={brass}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 48]} />
      </mesh>
      <mesh position={[0, 1.24, 0]} material={flatLacquer} castShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.8, 8]} />
      </mesh>
    </Normalize>
  )
}

// N°04 — a sea-worn pebble of glass with a marble cube stopper.
export function Sel({ product }) {
  const liquid = useMemo(() => makeLiquid(product.liquid), [product])
  const body = useGeo(() => new THREE.SphereGeometry(1, 72, 48))
  const stopper = useGeo(() => new RoundedBoxGeometry(0.5, 0.5, 0.5, 4, 0.07))
  return (
    <Normalize>
      <Glass geometry={body} tint={product.glass} position={[0, -0.3, 0]} scale={[0.85, 0.62, 0.62]} />
      <mesh position={[0, -0.4, 0]} scale={[0.72, 0.46, 0.5]} material={liquid} castShadow>
        <sphereGeometry args={[1, 48, 32]} />
      </mesh>
      <mesh position={[0, 0.36, 0]} material={brass}>
        <cylinderGeometry args={[0.18, 0.2, 0.12, 48]} />
      </mesh>
      <mesh geometry={stopper} position={[0, 0.68, 0]} rotation={[0, Math.PI / 4, 0]} material={marble} castShadow />
    </Normalize>
  )
}

// N°05 — tapered obelisk with a brass pyramid cap.
export function Cuir({ product }) {
  const liquid = useMemo(() => makeLiquid(product.liquid), [product])
  const label = useLabel(product)
  const body = useGeo(() => new THREE.CylinderGeometry(0.42, 0.66, 1.8, 4))
  const flatBrass = useMemo(() => {
    const m = brass.clone()
    m.flatShading = true
    return m
  }, [])
  return (
    <Normalize>
      <Glass geometry={body} tint={product.glass} flat rotation={[0, Math.PI / 4, 0]} />
      <mesh position={[0, -0.22, 0]} rotation={[0, Math.PI / 4, 0]} material={liquid} castShadow>
        <cylinderGeometry args={[0.35, 0.56, 1.3, 4]} />
      </mesh>
      <mesh position={[0, -0.3, 0.42]} rotation={[-0.094, 0, 0]} material={label}>
        <planeGeometry args={[0.46, 0.29]} />
      </mesh>
      <mesh position={[0, 0.95, 0]} material={brass}>
        <cylinderGeometry args={[0.19, 0.19, 0.1, 48]} />
      </mesh>
      <mesh position={[0, 1.27, 0]} rotation={[0, Math.PI / 4, 0]} material={flatBrass} castShadow>
        <cylinderGeometry args={[0, 0.34, 0.55, 4]} />
      </mesh>
    </Normalize>
  )
}

export const models = { ambre: Ambre, iris: Iris, figue: Figue, sel: Sel, cuir: Cuir }
