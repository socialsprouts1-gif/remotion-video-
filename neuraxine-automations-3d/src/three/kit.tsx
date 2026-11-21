// A small kit of real 3D objects for the film (three.js through @remotion/three):
// studio lighting, image textures, logos extruded from their official SVGs, a phone, cards, stars,
// coins, chat bubbles and soft contact shadows. Everything is a pure function of the props it is given.
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {useThree, type ThreeElements} from '@react-three/fiber';
import * as THREE from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ---------- lighting ---------- */

/** Soft studio: an image-based room environment for reflections, plus a key and a fill light. */
export const Studio: React.FC<{key?: number}> = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    gl.toneMapping = THREE.NoToneMapping;
  }, [gl, scene]);
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.4} />
      <directionalLight position={[-4, 2, 3]} intensity={0.5} />
    </>
  );
};

/* ---------- textures ---------- */

const texCache = new Map<string, THREE.Texture>();
/** Image texture from public/, loaded once; the render waits for it. */
export const useTex = (url: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(() => texCache.get(url) ?? null);
  const [handle] = useState(() => (texCache.has(url) ? null : delayRender(`texture ${url}`)));
  useEffect(() => {
    if (tex) return;
    new THREE.TextureLoader().load(
      staticFile(url),
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        texCache.set(url, t);
        setTex(t);
        if (handle !== null) continueRender(handle);
      },
      undefined,
      () => handle !== null && continueRender(handle),
    );
  }, [url, tex, handle]);
  return tex;
};

/** Soft round shadow texture for a contact shadow on the white floor. */
const shadowTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(0,0,0,0.38)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

export const Shadow: React.FC<{position?: [number, number, number]; w?: number; d?: number; opacity?: number}> = ({position = [0, -1.6, 0], w = 2.4, d = 0.9, opacity = 1}) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial map={shadowTex()} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
  </mesh>
);

/* ---------- logos from SVG ---------- */

type SvgLayer = {shapes: THREE.Shape[]; color: string};
const svgCache = new Map<string, {layers: SvgLayer[]; w: number; h: number}>();

const gradientColor = (text: string, id: string) => {
  const block = text.split(`id="${id}"`)[1] ?? '';
  const stops = [...block.split('</linearGradient>')[0].matchAll(/stop-color="([^"]+)"/g)].map((m) => m[1]);
  return stops[Math.floor(stops.length / 2)] ?? '#888888';
};

/** Parse an SVG file into coloured shape layers (gradients become their middle colour). */
export const useSvg = (url: string) => {
  const [data, setData] = useState(() => svgCache.get(url) ?? null);
  const [handle] = useState(() => (svgCache.has(url) ? null : delayRender(`svg ${url}`)));
  useEffect(() => {
    if (data) return;
    fetch(staticFile(url))
      .then((r) => r.text())
      .then((text) => {
        const parsed = new SVGLoader().parse(text);
        const vb = (text.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 256 256').split(/\s+/).map(Number);
        const layers: SvgLayer[] = parsed.paths
          .map((p) => {
            const fill = String((p.userData as {style?: {fill?: string}})?.style?.fill ?? p.color.getStyle());
            const color = fill.startsWith('url(') ? gradientColor(text, fill.slice(5, -1)) : fill === 'none' ? '' : fill;
            return {shapes: SVGLoader.createShapes(p), color};
          })
          .filter((l) => l.color);
        const d = {layers, w: vb[2], h: vb[3]};
        svgCache.set(url, d);
        setData(d);
        if (handle !== null) continueRender(handle);
      })
      .catch(() => handle !== null && continueRender(handle));
  }, [url, data, handle]);
  return data;
};

/** A brand logo extruded into a glossy 3D badge, every colour layer at its own depth. */
export const Logo3D: React.FC<{url: string; size?: number; depth?: number} & ThreeElements['group']> = ({url, size = 2, depth = 0.12, ...props}) => {
  const svg = useSvg(url);
  const geos = useMemo(() => {
    if (!svg) return [];
    const s = size / Math.max(svg.w, svg.h);
    return svg.layers.map((l, i) => {
      const g = new THREE.ExtrudeGeometry(l.shapes, {
        depth: (depth / s) * (i === 0 ? 1 : 0.35),
        bevelEnabled: true,
        bevelThickness: (depth / s) * 0.12,
        bevelSize: (depth / s) * 0.08,
        bevelSegments: 4,
        curveSegments: 24,
      });
      g.translate(-svg.w / 2, -svg.h / 2, i * (depth / s) * 0.55);
      return {g, color: l.color, s};
    });
  }, [svg, size, depth]);
  if (!svg) return null;
  return (
    <group {...props}>
      {geos.map(({g, color, s}, i) => (
        <mesh key={i} geometry={g} scale={[s, -s, s]}>
          <meshPhysicalMaterial color={color} roughness={0.35} metalness={0} clearcoat={0.5} clearcoatRoughness={0.25} envMapIntensity={0.45} />
        </mesh>
      ))}
    </group>
  );
};

/* ---------- phone ---------- */

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
};

/** A flat rounded rectangle whose UVs span 0..1 (for screens and image cards). */
const roundedPlane = (w: number, h: number, r: number) => {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 12);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + w / 2) / w;
    uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
};

export const PHONE = {w: 1, h: 2.14, d: 0.085};

/** A modern phone: titanium-black body, glass screen showing `screen` (an image in public/). */
export const Phone: React.FC<{screen: string; screen2?: string; mix2?: number} & ThreeElements['group']> = ({screen, screen2, mix2 = 0, ...props}) => {
  const tex = useTex(screen);
  const tex2 = useTex(screen2 ?? screen);
  const body = useMemo(() => new RoundedBoxGeometry(PHONE.w, PHONE.h, PHONE.d, 8, 0.13), []);
  const glass = useMemo(() => roundedPlane(PHONE.w - 0.06, PHONE.h - 0.06, 0.1), []);
  const island = useMemo(() => roundedPlane(0.26, 0.07, 0.035), []);
  const bump = useMemo(() => new RoundedBoxGeometry(0.42, 0.42, 0.04, 4, 0.09), []);
  return (
    <group {...props}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#1A1C1E" metalness={0.75} roughness={0.32} clearcoat={0.6} />
      </mesh>
      {tex && (
        <mesh geometry={glass} position={[0, 0, PHONE.d / 2 + 0.002]}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      )}
      {tex2 && mix2 > 0 && (
        <mesh geometry={glass} position={[0, 0, PHONE.d / 2 + 0.003]}>
          <meshBasicMaterial map={tex2} toneMapped={false} transparent opacity={mix2} />
        </mesh>
      )}
      <mesh geometry={island} position={[0, PHONE.h / 2 - 0.1, PHONE.d / 2 + 0.004]}>
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh geometry={bump} position={[-0.22, PHONE.h / 2 - 0.3, -PHONE.d / 2 - 0.015]}>
        <meshPhysicalMaterial color="#222426" metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  );
};

/* ---------- cards, stars, coins, bubbles ---------- */

/** A thin card with an image on its face (real posts, calendar page, invoice…). */
export const Card3D: React.FC<{img: string; w: number; h: number; r?: number; d?: number} & ThreeElements['group']> = ({img, w, h, r = 0.06, d = 0.03, ...props}) => {
  const tex = useTex(img);
  const body = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, d / 2)), [w, h, d, r]);
  const face = useMemo(() => roundedPlane(w - 0.01, h - 0.01, r), [w, h, r]);
  return (
    <group {...props}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.5} clearcoat={0.3} />
      </mesh>
      {tex && (
        <mesh geometry={face} position={[0, 0, d / 2 + 0.002]}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

const starShape = (() => {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? 0.5 : 0.22;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
})();

/** Google's review star in 3D. */
export const Star3D: React.FC<ThreeElements['group']> = (props) => {
  const g = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(starShape, {depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 5});
    geo.center();
    return geo;
  }, []);
  return (
    <group {...props}>
      <mesh geometry={g}>
        <meshPhysicalMaterial color="#FBBC04" roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.2} envMapIntensity={0.5} />
      </mesh>
    </group>
  );
};

/** A green coin with a face image (₹). */
export const Coin3D: React.FC<{face: string} & ThreeElements['group']> = ({face, ...props}) => {
  const tex = useTex(face);
  return (
    <group {...props}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 64]} />
        <meshPhysicalMaterial color="#0FA958" metalness={0.3} roughness={0.3} clearcoat={0.8} envMapIntensity={0.6} />
      </mesh>
      {tex && (
        <mesh position={[0, 0, 0.061]}>
          <circleGeometry args={[0.44, 64]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

const bubbleShape = (w: number, h: number, tailRight: boolean) => {
  const s = roundedRect(w, h, Math.min(0.18, h / 2));
  const t = new THREE.Shape();
  const x = tailRight ? w / 2 - 0.22 : -w / 2 + 0.22;
  t.moveTo(x - 0.12, -h / 2 + 0.02);
  t.lineTo(x + (tailRight ? 0.22 : -0.22), -h / 2 - 0.2);
  t.lineTo(x + 0.12, -h / 2 + 0.02);
  t.closePath();
  return [s, t];
};

/** A glossy chat bubble with typing dots or skeleton lines. */
export const Bubble3D: React.FC<{w?: number; h?: number; green?: boolean; dots?: boolean} & ThreeElements['group']> = ({w = 1.4, h = 0.6, green, dots, ...props}) => {
  const g = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(bubbleShape(w, h, !!green), {depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4});
    return geo;
  }, [w, h, green]);
  const col = green ? '#25D366' : '#FFFFFF';
  const ink = green ? '#FFFFFF' : '#C9CDCB';
  return (
    <group {...props}>
      <mesh geometry={g} position={[0, 0, -0.06]}>
        <meshPhysicalMaterial color={col} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.2} envMapIntensity={0.5} />
      </mesh>
      {dots
        ? [-1, 0, 1].map((i) => (
            <mesh key={i} position={[i * 0.2, 0, 0.11]}>
              <sphereGeometry args={[0.065, 24, 24]} />
              <meshStandardMaterial color={green ? '#FFFFFF' : '#9AA09D'} />
            </mesh>
          ))
        : [0.55, 0.35].map((k, i) => (
            <mesh key={i} position={[-w / 2 + 0.2 + (w * k) / 2, h * (0.14 - i * 0.28), 0.11]}>
              <boxGeometry args={[w * k, 0.07, 0.02]} />
              <meshStandardMaterial color={ink} />
            </mesh>
          ))}
    </group>
  );
};

/* ---------- preload ---------- */

const loadTex = (url: string) =>
  new Promise<void>((resolve) => {
    if (texCache.has(url)) return resolve();
    new THREE.TextureLoader().load(
      staticFile(url),
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        texCache.set(url, t);
        resolve();
      },
      undefined,
      () => resolve(),
    );
  });

const loadSvg = (url: string) =>
  svgCache.has(url)
    ? Promise.resolve()
    : fetch(staticFile(url))
        .then((r) => r.text())
        .then((text) => {
          const parsed = new SVGLoader().parse(text);
          const vb = (text.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 256 256').split(/\s+/).map(Number);
          const layers = parsed.paths
            .map((p) => {
              const fill = String((p.userData as {style?: {fill?: string}})?.style?.fill ?? p.color.getStyle());
              const color = fill.startsWith('url(') ? gradientColor(text, fill.slice(5, -1)) : fill === 'none' ? '' : fill;
              return {shapes: SVGLoader.createShapes(p), color};
            })
            .filter((l) => l.color);
          svgCache.set(url, {layers, w: vb[2], h: vb[3]});
        })
        .catch(() => undefined);

export const TEXTURES = [
  ...['lock12', 'lock8', 's1a', 's1b', 's3a', 's3b', 's4a', 's4b', 's5a', 's5b', 'cal', 'coin', 'nx'].map((n) => `tex/${n}.png`),
  'posts/p1.png',
  'posts/p2.png',
  'posts/p3.png',
  'posts/p5.png',
  'screens/profile.png',
];
export const SVGS = ['icons/whatsapp-icon.svg', 'icons/meta-icon.svg', 'icons/google-gmail.svg', 'icons/google-g.svg', 'icons/instagram-icon.svg'];

/** Load every texture and logo before any 3D scene mounts, so first frames are never blank. */
export const preloadAll = () => Promise.all([...TEXTURES.map(loadTex), ...SVGS.map(loadSvg)]);
