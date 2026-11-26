import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { faqs } from '../site'

const ease = [0.16, 1, 0.3, 1]

export default function Faq() {
  const [open, setOpen] = useState(0)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <section id="faq" className="faq">
      <div className="faq__head">
        <span className="eyebrow">FAQ</span>
        <h2 className="h2">Questions, <em className="serif">answered.</em></h2>
        <p className="lead">Still unsure? Ask us on WhatsApp, the button is bottom right.</p>
      </div>
      <div className="faq__list">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
              <button id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{f.q}</span>
                <Plus size={20} className="faq__plus" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="faq__a"
                  >
                    <p>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </section>
  )
}
