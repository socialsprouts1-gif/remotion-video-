import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import paths from './logoPaths.json'
import { store } from '../store'

const { damp, lerp, smoothstep } = THREE.MathUtils

// The Neuraxine mark, traced from the supplied logo and extruded:
// brushed chrome for the "N" stroke, lit lime metal for the "X".
function extrude(d) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => p.toShapes(true))
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 46, bevelEnabled: true, bevelThickness: 7, bevelSize: 5, bevelSegments: 4, curveSegments: 10 })
  return geo
}

export default function Logo3D() {
  const group = useRef()
  const silverRef = useRef()
  const limeRef = useRef()
  const sweep = useRef()
  const { silver, lime, scale } = useMemo(() => {
    const s = extrude(paths.silver)
    const l = extrude(paths.lime)
    // Center both on the combined bounds; flip Y (SVG is y-down).
    const box = new THREE.Box3().setFromBufferAttribute(s.attributes.position).union(new THREE.Box3().setFromBufferAttribute(l.attributes.position))
    const c = box.getCenter(new THREE.Vector3())
    const w = box.max.x - box.min.x
    for (const g of [s, l]) {
      g.translate(-c.x, -c.y, -c.z)
      g.rotateX(Math.PI) // flip SVG's y-down without reversing face winding
    }
    return { silver: s, lime: l, scale: 1 / w }
  }, [])

  const chrome = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0.62, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 2.2, side: THREE.DoubleSide }),
    [],
  )
  const limeMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#b9f227', metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1, emissive: '#5f9a00', emissiveIntensity: 0.35, envMapIntensity: 1.3, side: THREE.DoubleSide }),
    [],
  )

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20)
    const t = state.clock.elapsedTime
    const s = store.s
    const aspect = state.size.width / state.size.height
    const portrait = aspect < 0.85
    const intro = 1 - Math.pow(1 - store.intro, 4)
    const leave = smoothstep(s, 0.05, 0.85)

    // Hero placement: right of the headline on desktop, above it on phones.
    const width = portrait ? 3.4 : 6.2
    const baseX = portrait ? 0 : 3.7
    const baseY = portrait ? 4.8 : 0.35
    const g = group.current
    g.position.x = damp(g.position.x, baseX + store.pointer.sx * 0.25 - leave * 2, 4, dt)
    g.position.y = damp(g.position.y, baseY + Math.sin(t * 0.8) * 0.08 + leave * 7, 4, dt)
    g.position.z = damp(g.position.z, 1.5 - leave * 6, 4, dt)
    g.rotation.y = damp(g.rotation.y, -0.32 + store.pointer.sx * 0.35 + leave * 1.6 + Math.sin(t * 0.4) * 0.06, 4, dt)
    g.rotation.x = damp(g.rotation.x, -store.pointer.sy * 0.22 + Math.cos(t * 0.5) * 0.04, 4, dt)
    g.scale.setScalar(Math.max(0.0001, width * scale * lerp(0.6, 1, intro)))
    g.visible = leave < 0.999

    // Assembly on load: the two pieces slide in from opposite sides.
    silverRef.current.position.x = lerp(-420, 0, intro)
    silverRef.current.rotation.y = lerp(-0.9, 0, intro)
    limeRef.current.position.x = lerp(420, 0, intro)
    limeRef.current.rotation.y = lerp(0.9, 0, intro)

    // A light glint sweeping across the chrome every few seconds.
    sweep.current.position.x = ((t * 0.35) % 1.6 - 0.8) * 900
  })

  return (
    <group ref={group} position={[4.3, 0.35, 1.5]}>
      <mesh ref={silverRef} geometry={silver} material={chrome} />
      <mesh ref={limeRef} geometry={lime} material={limeMat} />
      <pointLight ref={sweep} position={[0, 180, 240]} intensity={18} distance={7} decay={1.2} color="#ffffff" />
    </group>
  )
}
