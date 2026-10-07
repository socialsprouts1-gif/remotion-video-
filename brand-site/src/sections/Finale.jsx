import { brand } from '../brand'
import { scrollTo } from '../lib/smooth'
import Magnetic from '../components/Magnetic'
import { SplitWords } from '../components/Reveal'

export default function Finale() {
  return (
    <section id="finale" className="finale" data-theme="dark">
      <div className="finale__main">
        <span className="label">(06) — Visit</span>
        <SplitWords as="h2" className="display finale__title" text={brand.finale.title} />
        <p className="finale__note">{brand.finale.note}</p>
        <Magnetic className="finale__cta" strength={0.3}>
          <button className="big-btn" data-cursor="Book">
            <span className="big-btn__fill" />
            <span className="big-btn__text">{brand.finale.action}</span>
          </button>
        </Magnetic>
      </div>

      <footer className="footer">
        <form className="footer__news" onSubmit={(e) => e.preventDefault()}>
          <label className="label" htmlFor="news">Letters from the atelier</label>
          <div>
            <input id="news" type="email" placeholder="Your email" />
            <button type="submit" aria-label="Subscribe">⟶</button>
          </div>
        </form>
        <ul className="footer__links">
          <li>Instagram</li>
          <li>Stockists</li>
          <li>Care</li>
          <li>Contact</li>
        </ul>
        <div className="footer__base">
          <span className="label muted">© 2026 {brand.name} — {brand.descriptor}</span>
          <button className="label" onClick={() => scrollTo(0, { duration: 3 })} data-cursor="Up">Back to top ↑</button>
        </div>
        <div className="footer__mark under" aria-hidden="true">{brand.name}</div>
      </footer>
    </section>
  )
}
