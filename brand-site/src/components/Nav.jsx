import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { brand, products } from '../brand'
import { scrollTo, stopScroll, startScroll } from '../lib/smooth'
import Magnetic from './Magnetic'

const ease = [0.76, 0, 0.24, 1]
const targets = { Maison: '#story', Collection: '#collection', Atelier: '#details', Journal: '#statement' }

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('EN')

  useEffect(() => {
    open ? stopScroll() : startScroll()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (hash) => {
    setOpen(false)
    setTimeout(() => scrollTo(hash), open ? 700 : 0)
  }

  return (
    <>
      <header className={`nav ${open ? 'is-open' : ''}`}>
        <button className="nav__logo" onClick={() => go(0)} data-cursor="Top">
          {brand.name}
        </button>
        <nav className="nav__links" aria-label="Primary">
          {brand.nav.map((l, i) => (
            <button key={l} onClick={() => go(targets[l])}>
              <sup>0{i + 1}</sup>
              <span data-text={l}>{l}</span>
            </button>
          ))}
        </nav>
        <div className="nav__right">
          <div className="nav__lang" role="group" aria-label="Language">
            {['EN', 'FR'].map((l) => (
              <button key={l} className={lang === l ? 'is-active' : ''} onClick={() => setLang(l)}>
                {l}
              </button>
            ))}
          </div>
          <Magnetic as="button" className="nav__bag" aria-label="Bag, 0 items" strength={0.5}>
            <span>0</span>
          </Magnetic>
          <Magnetic
            as="button"
            className="nav__menu"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            strength={0.5}
          >
            <i />
            <i />
          </Magnetic>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 52px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 52px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 52px) 44px)' }}
            transition={{ duration: 1.0, ease }}
          >
            <div className="menu__inner">
              <ul className="menu__list">
                {brand.nav.map((l, i) => (
                  <li key={l}>
                    <motion.button
                      onClick={() => go(targets[l])}
                      initial={{ y: '110%' }}
                      animate={{ y: '0%' }}
                      exit={{ y: '110%' }}
                      transition={{ duration: 0.9, ease, delay: 0.25 + i * 0.07 }}
                      data-cursor="Go"
                    >
                      <sup>0{i + 1}</sup>
                      {l}
                    </motion.button>
                  </li>
                ))}
              </ul>
              <motion.aside
                className="menu__aside"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.8 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <span className="label">The extraits</span>
                <ol>
                  {products.map((p) => (
                    <li key={p.id}>
                      <i style={{ background: p.liquid }} />
                      N°{p.no} {p.name}
                    </li>
                  ))}
                </ol>
                <span className="label">Atelier</span>
                <p>14 Rue de Charonne<br />75011 {brand.city}</p>
              </motion.aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
