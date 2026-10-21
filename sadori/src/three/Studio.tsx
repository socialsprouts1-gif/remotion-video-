import React, {useLayoutEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Product-photography reflections: a dark room with long warm softboxes,
 * baked into a PMREM environment map so glossy acetate and gold pick up clean strip highlights.
 */
const makeEnvScene = () => {
  const s = new THREE.Scene();
  s.background = new THREE.Color('#030303');
  const box = (w: number, h: number, pos: [number, number, number], col: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(...col), side: THREE.DoubleSide}));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  box(14, 2.2, [0, 9, 4], [5.5, 5.1, 4.6]); // top strip
  box(2.4, 12, [-10, 1, 3], [3.0, 2.7, 2.3]); // left tall softbox
  box(2.0, 10, [10, 0, -2], [3.6, 3.0, 2.2]); // right warm rim
  box(10, 1.2, [0, -6, 8], [1.4, 1.2, 1.0]); // low fill bounce
  box(6, 6, [0, 2, 12], [0.6, 0.55, 0.5]); // soft front
  box(1.4, 8, [5, 3, -10], [2.6, 2.1, 1.4]); // back kicker (gold)
  return s;
};

export const Studio: React.FC<{intensity: number; key?: number; rim?: number}> = ({intensity, rim = 1}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(makeEnvScene(), 0.02).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
  }, [env, scene]);
  scene.environmentIntensity = intensity;
  return (
    <>
      <directionalLight position={[-4, 8, 6]} intensity={1.2 * intensity} color="#fff3e2" />
      <directionalLight position={[6, 2, -6]} intensity={1.6 * rim * intensity} color="#ffd9a0" />
    </>
  );
};

/** Camera rig: sets the default camera every frame. */
export const Rig: React.FC<{pos: [number, number, number]; target: [number, number, number]; fov: number; roll?: number}> = ({pos, target, fov, roll = 0}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...pos);
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(...target);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.near = 0.05;
  camera.far = 200;
  return null;
};
