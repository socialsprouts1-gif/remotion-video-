import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { journey } from '../site'
import { store, journeyProgress } from '../store'
import { brandPath, brandHex } from '../components/BrandIcon'

const { damp, smoothstep, lerp, clamp } = THREE.MathUtils
const LIME = new THREE.Color('#C2FF3D')
const IDLE = new THREE.Color('#5d6a60')

// Node positions: a sweeping S through depth, left to right.
const POS = [
  [-7.6, 1.4, -1.0],
  [-4.4, -0.9, 0.6],
  [-1.2, 1.1, -0.6],
  [2.0, -1.0, 0.5],
  [5.1, 0.9, -0.4],
  [8.1, -0.5, 0.4],
]

// ── shared textures ───────────────────────────────────────────────
function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.25, 'rgba(255,255,255,0.35)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function iconTexture(icon, label) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const draw = () => {
    const g = c.getContext('2d')
    g.clearRect(0, 0, 256, 256)
    // Official brand mark (Simple Icons, 24x24 viewBox) in its brand colour.
    g.save()
    g.translate(128 - 48, 52)
    g.scale(4, 4)
    g.fillStyle = icon === 'siN8n' || icon === 'siClaude' ? '#ffffff' : brandHex(icon)
    g.fill(new Path2D(brandPath(icon)))
    g.restore()
    g.fillStyle = '#f2f4f2'
    g.textAlign = 'center'
    g.font = '600 25px "Instrument Sans", sans-serif'
    g.fillText(label, 128, 210)
    tex.needsUpdate = true
  }
  draw()
  document.fonts?.load('600 25px "Instrument Sans"').then(draw).catch(() => {})
  return tex
}

// ── flowing connection (dashes travel along the tube) ─────────────
const flowMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uHead: { value: 0 },
      uMode: { value: 0 },
      uDim: { value: 1 },
      uLime: { value: LIME },
      uIdle: { value: IDLE },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uHead, uMode, uDim;
      uniform vec3 uLime, uIdle;
      varying vec2 vUv;
      void main() {
        float x = vUv.x;
        float d = fract(x * 46.0 - uTime * 0.9);
        float dash = smoothstep(0.0, 0.08, d) * smoothstep(0.5, 0.3, d);
        float trail = smoothstep(uHead - 0.14, uHead, x) * step(x, uHead);
        float lit = mix(trail, step(x, uHead), uMode);
        vec3 col = mix(uIdle, uLime, lit);
        float a = (0.18 + dash * 0.35 + lit * 0.55) * uDim;
        gl_FragColor = vec4(col * a, a);
      }
    `,
  })

// ── background field: faint far-away network ──────────────────────
function Field({ count }) {
  const ref = useRef()
  const { points, lines } = useMemo(() => {
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const pts = []
    for (let i = 0; i < count; i++) pts.push(new THREE.Vector3((rnd() - 0.5) * 34, (rnd() - 0.5) * 20, -3 - rnd() * 12))
    const seg = []
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) if (pts[i].distanceTo(pts[j]) < 3.4) seg.push(pts[i], pts[j])
    return {
      points: new THREE.BufferGeometry().setFromPoints(pts),
      lines: new THREE.BufferGeometry().setFromPoints(seg),
    }
  }, [count])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.y = Math.sin(t * 0.04) * 0.12 + store.pointer.sx * 0.06
    ref.current.rotation.x = store.pointer.sy * -0.04
    ref.current.position.y = store.s * 1.2
  })
  return (
    <group ref={ref}>
      <points geometry={points}>
        <pointsMaterial size={0.07} color="#9fb0a2" transparent opacity={0.65} sizeAttenuation depthWrite={false} />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#C2FF3D" transparent opacity={0.07} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

// ── one workflow node ─────────────────────────────────────────────
const bodyGeo = new RoundedBoxGeometry(1.5, 1.5, 0.42, 5, 0.22)
const bodyMat = new THREE.MeshPhysicalMaterial({ color: '#16191b', metalness: 0.85, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.4 })

function Node({ index, step, glow, glowTex }) {
  const group = useRef()
  const face = useRef()
  const ring = useRef()
  const halo = useRef()
  const labelMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: iconTexture(step.icon, step.label), transparent: true, depthWrite: false }),
    [step],
  )
  const p = POS[index]
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const g = glow.current[index]
    // Nodes stay hidden behind the hero logo and build in as the journey begins.
    const appear = smoothstep(store.s, 0.3 + index * 0.06, 0.75 + index * 0.06)
    group.current.scale.setScalar(Math.max(0.0001, appear))
    group.current.position.set(p[0], p[1] + Math.sin(t * 0.8 + index) * 0.12, p[2])
    group.current.rotation.y = Math.sin(t * 0.3 + index) * 0.25 + store.pointer.sx * 0.2
    group.current.rotation.x = Math.cos(t * 0.25 + index) * 0.12 - store.pointer.sy * 0.15
    labelMat.opacity = 0.55 + g * 0.45
    ring.current.material.opacity = 0.15 + g * 0.85
    ring.current.rotation.z = t * 0.4 + index
    ring.current.scale.setScalar(1 + g * 0.08)
    halo.current.material.opacity = g * 0.55
    halo.current.scale.setScalar(3.4 + g * 1.2)
  })
  return (
    <group ref={group}>
      <mesh geometry={bodyGeo} material={bodyMat} />
      <mesh ref={face} position={[0, 0, 0.215]} material={labelMat}>
        <planeGeometry args={[1.3, 1.3]} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1.12, 0.022, 12, 96]} />
        <meshBasicMaterial color={LIME} transparent depthWrite={false} />
      </mesh>
      <sprite ref={halo} position={[0, 0, -0.3]}>
        <spriteMaterial map={glowTex} color={LIME} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

// ── the whole system: path, nodes, packet, camera rig ─────────────
export default function Network() {
  const glowTex = useMemo(glowTexture, [])
  const { curve, tube, nodeU } = useMemo(() => {
    const pts = [new THREE.Vector3(-12, 2.6, -2), ...POS.map((p) => new THREE.Vector3(...p)), new THREE.Vector3(12.5, -1.4, 0)]
    const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
    const samples = 800
    const us = POS.map((p) => {
      const v = new THREE.Vector3(...p)
      let best = 0
      let bd = Infinity
      for (let i = 0; i <= samples; i++) {
        const d = c.getPointAt(i / samples).distanceToSquared(v)
        if (d < bd) {
          bd = d
          best = i / samples
        }
      }
      return best
    })
    return { curve: c, tube: new THREE.TubeGeometry(c, 600, 0.045, 10, false), nodeU: us }
  }, [])
  const flow = useMemo(flowMaterial, [])
  const glow = useRef(POS.map(() => 0.2))
  const packet = useRef()
  const packetHalo = useRef()
  const packetLight = useRef()
  const trail = useRef()
  const trailPts = useMemo(() => Array.from({ length: 40 }, () => new THREE.Vector3(-12, 2.6, -2)), [])
  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(trailPts)
    const colors = new Float32Array(trailPts.length * 3)
    trailPts.forEach((_, i) => {
      const k = 1 - i / trailPts.length
      colors.set([0.76 * k, 1 * k, 0.24 * k], i * 3)
    })
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [trailPts])
  const target = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const lookNow = useRef(new THREE.Vector3(0, 0, 0))
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const group = useRef()

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20)
    const t = state.clock.elapsedTime
    const s = store.s
    const p = store.pointer
    const aspect = state.size.width / state.size.height
    const portrait = aspect < 0.85

    // Mode weights: hero (overview) → journey (follow) → ambient (backdrop).
    const jw = smoothstep(s, 0.6, 1.0) * (1 - smoothstep(s, 1.82, 2.05))
    const aw = smoothstep(s, 1.82, 2.1)
    const hw = Math.max(0, 1 - jw - aw)

    // Packet position along the path.
    const autoU = (t * 0.075) % 1
    const jU = lerp(nodeU[0], nodeU[nodeU.length - 1], journeyProgress())
    const following = jw > 0.5
    const u = following ? jU : autoU
    curve.getPointAt(u, tmp)
    const k = following ? 9 : 30
    packet.current.position.x = damp(packet.current.position.x, tmp.x, k, dt)
    packet.current.position.y = damp(packet.current.position.y, tmp.y, k, dt)
    packet.current.position.z = damp(packet.current.position.z, tmp.z, k, dt)
    const pp = packet.current.position
    packetHalo.current.position.copy(pp)
    packetLight.current.position.copy(pp)
    packetHalo.current.scale.setScalar(1.6 + Math.sin(t * 6) * 0.15)

    for (let i = trailPts.length - 1; i > 0; i--) trailPts[i].copy(trailPts[i - 1])
    trailPts[0].copy(pp)
    const attr = trail.current.geometry.attributes.position
    trailPts.forEach((v, i) => attr.setXYZ(i, v.x, v.y, v.z))
    attr.needsUpdate = true

    // Node glow: lit once passed while following; pulse on pass otherwise.
    nodeU.forEach((nu, i) => {
      const pulse = 1 - smoothstep(Math.abs(u - nu), 0, 0.04)
      const goal = following ? (u >= nu - 0.004 ? 1 : 0.1) : Math.max(0.22, pulse)
      glow.current[i] = damp(glow.current[i], goal, following ? 5 : 6, dt)
    })

    flow.uniforms.uTime.value = t
    flow.uniforms.uHead.value = u
    flow.uniforms.uMode.value = following ? 1 : 0
    const shown = smoothstep(s, 0.3, 0.8)
    flow.uniforms.uDim.value = lerp(1, 0.55, aw) * shown
    packet.current.visible = packetHalo.current.visible = trail.current.visible = shown > 0.02
    // Behind the demos and copy the network becomes a quiet backdrop.
    state.gl.domElement.style.opacity = String(lerp(1, 0.22, aw))

    // Camera rig.
    const heroZ = Math.min(32, 24.5 / Math.max(aspect, 0.5))
    const cam = state.camera
    target.set(0, 0, 0)
    look.set(0, 0, 0)
    // hero
    target.x += hw * (0.6 + p.sx * 0.9)
    target.y += hw * (0.4 + p.sy * 0.5)
    target.z += hw * heroZ
    look.x += hw * 0.3
    // journey: follow the packet, keep it off to one side of the copy
    const off = portrait ? [0.6, 1.6, 9.5] : [2.6, 1.4, 6.6]
    const lk = portrait ? [0, -1.6, 0] : [-2.4, 0.15, 0]
    target.x += jw * (pp.x + off[0] + p.sx * 0.4)
    target.y += jw * (pp.y + off[1] + p.sy * 0.3)
    target.z += jw * (pp.z + off[2])
    look.x += jw * (pp.x + lk[0])
    look.y += jw * (pp.y + lk[1])
    look.z += jw * pp.z
    // ambient: slow drift, far back
    target.x += aw * (Math.sin(t * 0.05) * 3 + p.sx * 1.2)
    target.y += aw * (1.2 + p.sy * 0.8)
    target.z += aw * (portrait ? 34 : 24)

    const ck = store.reducedMotion ? 20 : 2.6
    cam.position.x = damp(cam.position.x, target.x, ck, dt)
    cam.position.y = damp(cam.position.y, target.y, ck, dt)
    cam.position.z = damp(cam.position.z, target.z, ck, dt)
    lookNow.current.x = damp(lookNow.current.x, look.x, ck, dt)
    lookNow.current.y = damp(lookNow.current.y, look.y, ck, dt)
    lookNow.current.z = damp(lookNow.current.z, look.z, ck, dt)
    cam.lookAt(lookNow.current)

    const intro = 1 - Math.pow(1 - store.intro, 3)
    group.current.scale.setScalar(lerp(0.82, 1, intro))
    group.current.rotation.y = lerp(-0.25, 0, intro) + aw * Math.sin(t * 0.08) * 0.15
  })

  return (
    <>
      <Field count={store.mobile ? 70 : 150} />
      <group ref={group}>
        <mesh geometry={tube} material={flow} />
        {journey.map((step, i) => (
          <Node key={step.id} index={i} step={step} glow={glow} glowTex={glowTex} />
        ))}
        <mesh ref={packet} position={[-12, 2.6, -2]}>
          <sphereGeometry args={[0.17, 32, 16]} />
          <meshBasicMaterial color="#efffcf" />
        </mesh>
        <sprite ref={packetHalo}>
          <spriteMaterial map={glowTex} color={LIME} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <pointLight ref={packetLight} color={LIME} intensity={9} distance={5.5} decay={1.6} />
        <line ref={trail} geometry={trailGeo}>
          <lineBasicMaterial vertexColors transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </line>
      </group>
    </>
  )
}
