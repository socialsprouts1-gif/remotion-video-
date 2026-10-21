import * as THREE from 'three';
import {rand} from '../anim';

// Tortoiseshell acetate: layered amber/brown blobs painted onto a canvas.
const tortoiseTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const g = c.getContext('2d')!;
    g.fillStyle = '#5a2f12';
    g.fillRect(0, 0, 512, 512);
    const tones = ['#2a1206', '#1a0a03', '#8a4a1a', '#b8732c', '#3d1b08', '#a0612a'];
    for (let i = 0; i < 420; i++) {
      const x = rand(i * 1.7) * 512;
      const y = rand(i * 3.1 + 2) * 512;
      const r = 6 + rand(i * 5.3) * 46;
      const col = tones[Math.floor(rand(i * 7.9) * tones.length)];
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, col + 'ee');
      grd.addColorStop(1, col + '00');
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(x, y, r * 1.6, r, rand(i) * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(0.35, 0.35);
    return tex;
  };
})();

export type MatName = 'black' | 'tortoise' | 'gold' | 'goldSatin' | 'clear' | 'sun' | 'pad' | 'tip';

const cache: Partial<Record<MatName, THREE.Material>> = {};

export const mat = (name: MatName): THREE.Material => {
  if (cache[name]) return cache[name]!;
  let m: THREE.Material;
  switch (name) {
    case 'black':
      m = new THREE.MeshPhysicalMaterial({color: '#060607', roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1});
      break;
    case 'tortoise':
      m = new THREE.MeshPhysicalMaterial({map: tortoiseTexture(), roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03});
      break;
    case 'gold':
      m = new THREE.MeshPhysicalMaterial({color: '#e2c38e', roughness: 0.2, metalness: 1});
      break;
    case 'goldSatin':
      m = new THREE.MeshPhysicalMaterial({color: '#d6b98a', roughness: 0.34, metalness: 1});
      break;
    case 'clear':
      m = new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.02, metalness: 0, transparent: true, opacity: 0.07, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.2, depthWrite: false, side: THREE.DoubleSide});
      break;
    case 'sun':
      m = new THREE.MeshPhysicalMaterial({color: '#4a3420', roughness: 0.03, metalness: 0.45, transparent: true, opacity: 0.84, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.6, side: THREE.DoubleSide});
      break;
    case 'pad':
      m = new THREE.MeshPhysicalMaterial({color: '#f1ece2', roughness: 0.25, transparent: true, opacity: 0.55, clearcoat: 1});
      break;
    case 'tip':
      m = new THREE.MeshPhysicalMaterial({color: '#0a0a0b', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05});
      break;
  }
  cache[name] = m;
  return m;
};
