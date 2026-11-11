import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { store } from '../store'
import { products } from '../brand'
import { glassMaterials } from './materials'
import Actor from './Actor'
import Stones from './Stones'
import Notes from './Notes'

const { damp, lerp } = THREE.MathUtils

// Per-frame globals: smoothed pointer, light/dark blend, glass opacity.
function Director({ keyLight, rimLight, ambient, shadowMat }) {
  const scene = useThree((s) => s.scene)
  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20)
    const p = store.pointer
    p.sx = damp(p.sx ?? 0, p.x, 2.2, dt)
    p.sy = damp(p.sy ?? 0, p.y, 2.2, dt)
    store.theme = damp(store.theme, store.themeTarget, 2.2, dt)
    const d = store.theme
    keyLight.current.intensity = lerp(2.4, 1.1, d)
    rimLight.current.intensity = lerp(1.2, 9, d)
    ambient.current.intensity = lerp(0.55, 0.08, d)
    if (shadowMat.current) shadowMat.current.opacity = lerp(0.14, 0.0, d)
    scene.environmentIntensity = lerp(1, 0.55, d)
    glassMaterials.forEach((m) => (m.opacity = m.userData.baseOpacity * lerp(1, 0.38, d)))

    // Gentle camera sway with the pointer for depth.
    const cam = state.camera
    cam.position.x = damp(cam.position.x, p.sx * 0.25, 2, dt)
    cam.position.y = damp(cam.position.y, p.sy * 0.15, 2, dt)
    cam.lookAt(0, 0, 0)
  })
  return null
}

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#1a1714']} />
      <Lightformer form="rect" intensity={3} color="#fff6ea" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 8, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#ffe2c0" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[2, 8, 1]} />
      <Lightformer form="ring" intensity={2} color="#ffffff" position={[2, 2, 8]} scale={2.5} />
      <Lightformer form="rect" intensity={0.6} color="#d9b48a" position={[0, -4, -6]} scale={[10, 2, 1]} />
    </Environment>
  )
}

function Ready() {
  const done = useRef(false)
  useFrame(() => {
    if (!done.current) {
      done.current = true
      store.ready = true
    }
  })
  return null
}

export default function Scene() {
  const mobile = store.mobile
  const [dpr, setDpr] = useState(mobile ? 1.25 : 1.75)
  const keyLight = useRef()
  const rimLight = useRef()
  const ambient = useRef()
  const shadowMat = useRef()

  useEffect(() => () => (store.ready = false), [])

  return (
    <Canvas
      dpr={dpr}
      shadows={!mobile ? { type: THREE.PCFShadowMap } : false}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 35, position: [0, 0, 10], near: 0.1, far: 60 }}
      onCreated={(state) => {
        const { gl } = state
        if (import.meta.env.DEV || location.search.includes('debug')) window.__r3f = state
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(mobile ? 1.5 : 2)} />
      <ambientLight ref={ambient} intensity={0.55} />
      <directionalLight
        ref={keyLight}
        position={[5, 7, 10]}
        intensity={2.4}
        color="#fff4e6"
        castShadow={!mobile}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-radius={8}
        shadow-bias={-0.0004}
      />
      <spotLight ref={rimLight} position={[-6, 5, -5]} angle={0.6} penumbra={1} intensity={1.2} color="#ffcf9a" />
      <pointLight position={[4, -3, 4]} intensity={6} distance={14} color="#f2e6d8" />

      {!mobile && (
        <mesh position={[0, 0, -6]} receiveShadow>
          <planeGeometry args={[80, 50]} />
          <shadowMaterial ref={shadowMat} transparent opacity={0.14} color="#2a1d12" />
        </mesh>
      )}

      <Studio />
      <Director keyLight={keyLight} rimLight={rimLight} ambient={ambient} shadowMat={shadowMat} />
      <Ready />

      {products.map((p, i) => (
        <Actor key={p.id} product={p} seed={i * 1.37} />
      ))}
      <Stones />
      <Notes />
    </Canvas>
  )
}
