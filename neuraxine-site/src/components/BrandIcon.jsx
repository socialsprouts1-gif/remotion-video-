import * as icons from 'simple-icons'

// Official brand marks from Simple Icons (CC0). `name` is the export, e.g. "siWhatsapp".
export default function BrandIcon({ name, size = 20, color, title }) {
  const icon = icons[name]
  if (!icon) return null
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={icon.path} fill={color || `#${icon.hex}`} />
    </svg>
  )
}

export const brandHex = (name) => (icons[name] ? `#${icons[name].hex}` : '#fff')
export const brandPath = (name) => icons[name]?.path
