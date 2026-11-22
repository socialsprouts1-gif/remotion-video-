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
export const Logo3D: React.FC<{url: string; size?: number; depth?: number; tint?: string} & ThreeElements['group']> = ({url, size = 2, depth = 0.12, tint, ...props}) => {
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
          <meshPhysicalMaterial color={tint ?? color} roughness={0.35} metalness={0} clearcoat={0.5} clearcoatRoughness={0.25} envMapIntensity={0.45} />
        </mesh>
      ))}
    </group>
  );
};

/* ---------- phone ---------- */

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};

/** A flat rounded rectangle whose UVs span 0..1 (for screens and image cards). */
const roundedPlane = (w: number, h: number, r: number) => {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 32);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + w / 2) / w;
    uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
};

export const PHONE = {w: 1, h: 2.06, d: 0.09, r: 0.17};

/** An iPhone-style phone: titanium frame with true rounded corners, glass front, Dynamic Island,
 *  side buttons and a triple-lens camera plateau on the back. `screen` is an image in public/. */
export const Phone: React.FC<{screen: string; screen2?: string; mix2?: number} & ThreeElements['group']> = ({screen, screen2, mix2 = 0, ...props}) => {
  const tex = useTex(screen);
  const tex2 = useTex(screen2 ?? screen);
  const {w, h, d, r} = PHONE;
  const body = useMemo(() => {
    const bevel = 0.022;
    const g = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, r - bevel), {
      depth: d - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 8,
      curveSegments: 40,
    });
    g.translate(0, 0, -(d - bevel * 2) / 2);
    return g;
  }, [w, h, d, r]);
  const glass = useMemo(() => roundedPlane(w - 0.03, h - 0.03, r - 0.015), [w, h, r]);
  const scr = useMemo(() => roundedPlane(w - 0.075, h - 0.075, r - 0.04), [w, h, r]);
  const island = useMemo(() => roundedPlane(0.27, 0.075, 0.0375), []);
  const plateau = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(0.44, 0.46, 0.11), {depth: 0.012, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 4, curveSegments: 24});
    return g;
  }, []);
  const z = d / 2;
  const lens = (x: number, y: number) => (
    <group position={[x, y, -z - 0.03]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.085, 0.085, 0.04, 40]} />
        <meshPhysicalMaterial color="#8C8C90" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.021, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.005, 40]} />
        <meshPhysicalMaterial color="#05070A" roughness={0.05} clearcoat={1} />
      </mesh>
    </group>
  );
  return (
    <group {...props}>
      {/* titanium frame */}
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#4A4744" metalness={0.92} roughness={0.32} clearcoat={0.4} envMapIntensity={1.1} />
      </mesh>
      {/* front glass (black border) */}
      <mesh geometry={glass} position={[0, 0, z + 0.001]}>
        <meshPhysicalMaterial color="#050505" roughness={0.08} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {tex && (
        <mesh geometry={scr} position={[0, 0, z + 0.002]}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      )}
      {tex2 && mix2 > 0 && (
        <mesh geometry={scr} position={[0, 0, z + 0.003]}>
          <meshBasicMaterial map={tex2} toneMapped={false} transparent opacity={mix2} />
        </mesh>
      )}
      <mesh geometry={island} position={[0, h / 2 - 0.1, z + 0.004]}>
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* side buttons */}
      <mesh position={[-w / 2 - 0.006, h / 2 - 0.42, 0]}>
        <boxGeometry args={[0.014, 0.09, 0.035]} />
        <meshPhysicalMaterial color="#5A5652" metalness={0.9} roughness={0.3} />
      </mesh>
      {[0.6, 0.8].map((k) => (
        <mesh key={k} position={[-w / 2 - 0.006, h / 2 - k, 0]}>
          <boxGeometry args={[0.014, 0.15, 0.035]} />
          <meshPhysicalMaterial color="#5A5652" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[w / 2 + 0.006, h / 2 - 0.68, 0]}>
        <boxGeometry args={[0.014, 0.24, 0.035]} />
        <meshPhysicalMaterial color="#5A5652" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* back glass + camera */}
      <mesh geometry={glass} position={[0, 0, -z - 0.001]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial color="#2A2826" roughness={0.45} clearcoat={0.6} />
      </mesh>
      <mesh geometry={plateau} position={[0.2, h / 2 - 0.3, -z - 0.012]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial color="#33302D" roughness={0.3} clearcoat={0.8} />
      </mesh>
      {lens(0.11, h / 2 - 0.19)}
      {lens(0.11, h / 2 - 0.41)}
      {lens(0.29, h / 2 - 0.3)}
    </group>
  );
};

/** An app-icon tile in 3D: thick rounded glass body with an image on its face (Instagram, alerts, …). */
export const Tile3D: React.FC<{img: string; size?: number; d?: number} & ThreeElements['group']> = ({img, size = 0.5, d = 0.1, ...props}) => {
  const tex = useTex(img);
  const r = size * 0.225;
  const body = useMemo(() => {
    const bevel = Math.min(d * 0.35, r * 0.4);
    const g = new THREE.ExtrudeGeometry(roundedRect(size - bevel * 2, size - bevel * 2, r - bevel), {depth: d - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 32});
    g.translate(0, 0, -(d - bevel * 2) / 2);
    return g;
  }, [size, d, r]);
  const face = useMemo(() => roundedPlane(size - 0.004, size - 0.004, r), [size, r]);
  return (
    <group {...props}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#F4F1EC" roughness={0.3} clearcoat={0.8} envMapIntensity={0.6} />
      </mesh>
      {tex && (
        <mesh geometry={face} position={[0, 0, d / 2 + 0.002]}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

/** A gold crescent moon. */
export const Moon3D: React.FC<{color?: string} & ThreeElements['group']> = ({color = '#D9B25C', ...props}) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    const a1 = (56.9 * Math.PI) / 180;
    s.absarc(0, 0, 0.5, a1, Math.PI * 2 - a1, false);
    const b1 = (85.5 * Math.PI) / 180;
    s.absarc(0.24, 0, 0.42, Math.PI * 2 - b1, b1, true);
    const geo = new THREE.ExtrudeGeometry(s, {depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 6, curveSegments: 48});
    geo.center();
    return geo;
  }, []);
  return (
    <group {...props}>
      <mesh geometry={g}>
        <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.28} clearcoat={0.6} />
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
  ...['call', 'search', 'mail', 'phone', 'warn', 'chat', 'db', 'bolt', 'nx'].map((n) => `tex/${n}.png`),
  'screens/profile.png',
];
export const SVGS = ['icons/linkedin.svg', 'icons/gmail.svg'];

/** Load every texture and logo before any 3D scene mounts, so first frames are never blank. */
export const preloadAll = () => Promise.all([...TEXTURES.map(loadTex), ...SVGS.map(loadSvg)]);

/* ---------- hero props (lathe-turned) ---------- */

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
type Mat = {color: string; metalness?: number; roughness?: number};
const Metal: React.FC<Mat> = ({color, metalness = 0.92, roughness = 0.22}) => <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={0.6} clearcoatRoughness={0.15} envMapIntensity={1.2} />;

/** A chess king (centre at its base). */
export const ChessKing: React.FC<{color: string} & ThreeElements['group']> = ({color, ...props}) => {
  const body = useMemo(
    () =>
      lathe([
        [0, 0], [0.46, 0], [0.46, 0.07], [0.4, 0.11], [0.4, 0.16], [0.3, 0.22], [0.22, 0.3], [0.17, 0.42], [0.14, 0.7], [0.13, 0.92],
        [0.24, 0.98], [0.24, 1.03], [0.15, 1.06], [0.17, 1.12], [0.25, 1.32], [0.27, 1.38], [0.2, 1.42], [0.12, 1.45], [0, 1.46],
      ]),
    [],
  );
  return (
    <group {...props}>
      <mesh geometry={body}>
        <Metal color={color} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <Metal color={color} />
      </mesh>
      <mesh position={[0, 1.64, 0]}>
        <boxGeometry args={[0.2, 0.07, 0.07]} />
        <Metal color={color} />
      </mesh>
    </group>
  );
};

/** A chess pawn. */
export const ChessPawn: React.FC<{color: string} & ThreeElements['group']> = ({color, ...props}) => {
  const body = useMemo(() => lathe([[0, 0], [0.4, 0], [0.4, 0.07], [0.34, 0.1], [0.34, 0.15], [0.24, 0.22], [0.15, 0.34], [0.11, 0.56], [0.2, 0.6], [0.2, 0.64], [0.1, 0.67], [0, 0.68]]), []);
  return (
    <group {...props}>
      <mesh geometry={body}>
        <Metal color={color} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.17, 48, 48]} />
        <Metal color={color} />
      </mesh>
    </group>
  );
};

/** A chrome trophy cup with handles. */
export const Trophy: React.FC<ThreeElements['group']> = (props) => {
  const cup = useMemo(
    () =>
      lathe([
        [0, 0], [0.36, 0], [0.36, 0.08], [0.3, 0.1], [0.3, 0.2], [0.12, 0.26], [0.07, 0.5], [0.1, 0.58], [0.16, 0.64], [0.3, 0.78], [0.44, 1.02], [0.5, 1.3], [0.47, 1.31], [0.41, 1.06], [0.28, 0.86], [0.1, 0.8], [0, 0.8],
      ]),
    [],
  );
  return (
    <group {...props}>
      <mesh geometry={cup}>
        <meshPhysicalMaterial color="#E3E6EA" metalness={1} roughness={0.14} clearcoat={1} envMapIntensity={1.4} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.5, 1.02, 0]} rotation={[0, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2]}>
          <torusGeometry args={[0.17, 0.035, 16, 48, Math.PI]} />
          <meshPhysicalMaterial color="#E3E6EA" metalness={1} roughness={0.14} clearcoat={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.8, 0.24, 0.8]} />
        <meshPhysicalMaterial color="#1C1C1C" roughness={0.35} clearcoat={0.8} />
      </mesh>
    </group>
  );
};

/** A glass light bulb; `on` 0..1 lights the filament. */
export const Bulb: React.FC<{on?: number} & ThreeElements['group']> = ({on = 0, ...props}) => {
  const glass = useMemo(() => {
    const curve = new THREE.SplineCurve([[0.17, 0.14], [0.2, 0.3], [0.29, 0.46], [0.43, 0.63], [0.5, 0.85], [0.48, 1.04], [0.39, 1.2], [0.22, 1.32], [0, 1.36]].map(([x, y]) => new THREE.Vector2(x, y)));
    return new THREE.LatheGeometry([new THREE.Vector2(0, 0.14), ...curve.getPoints(48)], 96);
  }, []);
  const screw = useMemo(() => lathe([[0, -0.18], [0.1, -0.18], [0.15, -0.12], [0.18, -0.1], [0.18, 0.14], [0.17, 0.14], [0, 0.14]]), []);
  return (
    <group {...props}>
      <mesh geometry={glass}>
        <meshPhysicalMaterial color="#FFFFFF" metalness={0} roughness={0.05} transparent opacity={0.16 + on * 0.14} clearcoat={1} envMapIntensity={1.6} side={THREE.DoubleSide} depthWrite={false} emissive="#FFE9A8" emissiveIntensity={on * 0.45} />
      </mesh>
      <mesh geometry={screw}>
        <Metal color="#B9B4AA" roughness={0.3} />
      </mesh>
      {[-0.06, 0, 0.06].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.185, 0.012, 8, 48]} />
          <Metal color="#9C978D" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* filament + supports */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.55, 8]} />
          <meshStandardMaterial color="#777" />
        </mesh>
      ))}
      <mesh position={[0, 0.78, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.07, 0.008, 8, 32, Math.PI]} />
        <meshStandardMaterial color={on > 0.3 ? '#FFD36B' : '#8A7A5A'} emissive="#FFC94A" emissiveIntensity={on * 4} toneMapped={false} />
      </mesh>
      {on > 0 && <pointLight position={[0, 0.85, 0.2]} intensity={on * 3} distance={4} color="#FFE2A0" />}
    </group>
  );
};

/** An hourglass; `t` 0..1 moves the sand from top to bottom. */
export const Hourglass: React.FC<{t?: number; sand?: string} & ThreeElements['group']> = ({t = 0, sand = '#D9B878', ...props}) => {
  const glass = useMemo(() => lathe([[0.02, 0], [0.3, 0.04], [0.38, 0.2], [0.32, 0.42], [0.06, 0.6], [0.06, 0.62], [0.32, 0.8], [0.38, 1.02], [0.3, 1.18], [0.02, 1.22]]), []);
  const top = Math.max(0.001, 1 - t);
  const bot = Math.max(0.001, t);
  return (
    <group {...props}>
      <mesh geometry={glass}>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.05} transparent opacity={0.25} clearcoat={1} envMapIntensity={1.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* sand: top cone shrinks, bottom pile grows, a thin stream between */}
      <mesh position={[0, 0.62 + 0.18 * top, 0]} rotation={[Math.PI, 0, 0]} scale={[top ** 0.5, top, top ** 0.5]}>
        <coneGeometry args={[0.3, 0.36, 48]} />
        <meshStandardMaterial color={sand} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.06 + 0.14 * bot, 0]} scale={[Math.max(0.2, bot ** 0.4), bot, Math.max(0.2, bot ** 0.4)]}>
        <coneGeometry args={[0.32, 0.3, 48]} />
        <meshStandardMaterial color={sand} roughness={0.9} />
      </mesh>
      {t > 0.02 && t < 0.98 && (
        <mesh position={[0, 0.33, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.56, 8]} />
          <meshStandardMaterial color={sand} />
        </mesh>
      )}
      {[-0.03, 1.25].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.08, 48]} />
          <meshPhysicalMaterial color="#2A1D14" roughness={0.45} clearcoat={0.5} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.4, 0.61, Math.sin(a) * 0.4]}>
            <cylinderGeometry args={[0.022, 0.022, 1.26, 12]} />
            <meshPhysicalMaterial color="#2A1D14" roughness={0.45} />
          </mesh>
        );
      })}
    </group>
  );
};

/** A dartboard (rings) with a dart in the bullseye; `hit` 0..1 flies the dart in. */
export const Target3D: React.FC<{hit?: number} & ThreeElements['group']> = ({hit = 1, ...props}) => {
  const rings = ['#F4F1EA', '#E0482A', '#F4F1EA', '#E0482A', '#169A52'];
  return (
    <group {...props}>
      {rings.map((c, i) => (
        <mesh key={i} position={[0, 0, i * 0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6 - i * 0.12, 0.6 - i * 0.12, 0.08, 64]} />
          <meshPhysicalMaterial color={c} roughness={0.5} clearcoat={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.64, 0.64, 0.06, 64]} />
        <meshPhysicalMaterial color="#1C1C1C" roughness={0.4} />
      </mesh>
      <group position={[0, 0, 0.1 + (1 - hit) * 3]} rotation={[0, 0, 0]}>
        <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.36, 12]} />
          <meshPhysicalMaterial color="#C9CDD2" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.03, 0.12, 16]} />
          <meshPhysicalMaterial color="#C9CDD2" metalness={0.9} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} position={[0, 0, 0.36]} rotation={[0, 0, (k * Math.PI) / 2]}>
            <boxGeometry args={[0.14, 0.005, 0.12]} />
            <meshStandardMaterial color="#B5F12A" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** A paper envelope. */
export const Envelope3D: React.FC<{color?: string} & ThreeElements['group']> = ({color = '#F4F1EA', ...props}) => {
  const flap = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-0.5, 0.32);
    sh.lineTo(0.5, 0.32);
    sh.lineTo(0, -0.05);
    sh.closePath();
    return new THREE.ShapeGeometry(sh);
  }, []);
  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[1, 0.64, 0.04]} />
        <meshPhysicalMaterial color={color} roughness={0.6} clearcoat={0.2} />
      </mesh>
      <mesh geometry={flap} position={[0, 0, 0.022]}>
        <meshStandardMaterial color="#E2DDD2" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.05, 0.024]}>
        <circleGeometry args={[0.07, 24]} />
        <meshStandardMaterial color="#E0482A" />
      </mesh>
    </group>
  );
};
