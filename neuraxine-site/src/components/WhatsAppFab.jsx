import { site } from '../site'
import BrandIcon from './BrandIcon'

// Floating "Chat on WhatsApp" button, bottom-right on every screen.
export default function WhatsAppFab({ show }) {
  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`
  return (
    <a className={`wa-fab ${show ? 'is-in' : ''}`} href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with Neuraxine on WhatsApp" data-cursor="Chat">
      <span className="wa-fab__label">Chat on WhatsApp</span>
      <span className="wa-fab__btn">
        <BrandIcon name="siWhatsapp" size={28} color="#fff" />
      </span>
    </a>
  )
}
