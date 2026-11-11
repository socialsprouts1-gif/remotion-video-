import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { store } from '../store'
import Network from './Network'
import Logo3D from './Logo3D'

function Pointer() {
  useFrame((_, dt) => {
    dt = Math.min(dt, 1 / 20)
    const p = store.pointer
    p.sx = THREE.MathUtils.damp(p.sx, p.x, 2.2, dt)
    p.sy = THREE.MathUtils.damp(p.sy, p.y, 2.2, dt)
  })
  return null
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
  const [dpr, setDpr] = useState(store.mobile ? 1.25 : 1.75)
  useEffect(() => () => (store.ready = false), [])
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 40, position: [0, 0, 18], near: 0.1, far: 120 }}
      onCreated={(state) => {
        if (import.meta.env.DEV || location.search.includes('debug')) window.__r3f = state
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(store.mobile ? 1.5 : 2)} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 10]} intensity={1.2} color="#e9f2e4" />
      {/* Studio reflections for the chrome logo and node bodies. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#060707']} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 7, 3]} rotation-x={Math.PI / 2} scale={[16, 3, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[-8, 1, 3]} rotation-y={Math.PI / 2} scale={[3, 10, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#d8ff7a" position={[8, -1, 2]} rotation-y={-Math.PI / 2} scale={[2, 9, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, -5, 6]} rotation-x={-Math.PI / 2.5} scale={[12, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[4, 3, 9]} scale={2.5} />
      </Environment>
      <Pointer />
      <Ready />
      <Network />
      <Logo3D />
    </Canvas>
  )
}
