import * as THREE from 'three'
import { brand } from '../brand'

// Glass materials register here so the scene can thin them out on dark sections.
export const glassMaterials = new Set()

export function makeGlass(tint = '#f3ece2', side = THREE.FrontSide) {
  const m = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    ior: 1.5,
    specularIntensity: 1,
    envMapIntensity: 2.2,
    transparent: true,
    opacity: side === THREE.BackSide ? 0.18 : 0.26,
    depthWrite: false,
    side,
  })
  m.userData.baseOpacity = m.opacity
  glassMaterials.add(m)
  return m
}

export const makeLiquid = (color) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.16,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    sheen: 0.4,
    sheenColor: new THREE.Color(color).offsetHSL(0, 0, 0.2),
    envMapIntensity: 1.2,
  })

export const brass = new THREE.MeshPhysicalMaterial({
  color: '#b8925a',
  metalness: 1,
  roughness: 0.26,
  clearcoat: 0.3,
  envMapIntensity: 1.5,
})

export const lacquer = new THREE.MeshPhysicalMaterial({
  color: '#16130f',
  roughness: 0.18,
  metalness: 0.1,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.4,
})

export const travertine = new THREE.MeshStandardMaterial({ color: '#d6cab8', roughness: 0.92, metalness: 0 })
export const marble = new THREE.MeshPhysicalMaterial({ color: '#efebe4', roughness: 0.32, clearcoat: 0.4 })

// Paper label drawn into a canvas. Redrawn once the web fonts are ready.
export function makeLabelTexture(product, { width = 512, height = 320 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const draw = () => {
    const c = canvas.getContext('2d')
    c.fillStyle = '#f1ebe1'
    c.fillRect(0, 0, width, height)
    c.strokeStyle = 'rgba(21,19,15,0.55)'
    c.lineWidth = 2
    c.strokeRect(14, 14, width - 28, height - 28)
    c.fillStyle = '#15130f'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    const k = width / 512
    c.font = `500 ${15 * k}px "Inter Tight", sans-serif`
    c.letterSpacing = `${4 * k}px`
    c.fillText(`N°${product.no}`, width / 2, height * 0.2)
    c.font = `${74 * k}px "Instrument Serif", serif`
    c.letterSpacing = `${6 * k}px`
    c.fillText(brand.name, width / 2, height * 0.45)
    c.font = `italic ${34 * k}px "Instrument Serif", serif`
    c.letterSpacing = '0px'
    c.fillText(product.name, width / 2, height * 0.66)
    c.font = `500 ${12 * k}px "Inter Tight", sans-serif`
    c.letterSpacing = `${3 * k}px`
    c.fillText(`EXTRAIT DE PARFUM · ${product.size.toUpperCase()}`, width / 2, height * 0.83)
    tex.needsUpdate = true
  }
  draw()
  if (document.fonts) {
    Promise.all([
      document.fonts.load('74px "Instrument Serif"'),
      document.fonts.load('italic 34px "Instrument Serif"'),
      document.fonts.load('500 15px "Inter Tight"'),
    ])
      .then(draw)
      .catch(() => {})
  }
  return tex
}
