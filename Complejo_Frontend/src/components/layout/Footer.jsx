import React from 'react'
import textos from '../../i18n/textos'
import './Footer.css'

function Footer({ idioma }) {
  const t = textos[idioma].footer

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <strong>🌲 Whispering Pines Sanctuary</strong>
          <span>{t.lema}</span>
        </div>
        <p className="footer-copy">{t.derechos}</p>
      </div>
    </footer>
  )
}

export default Footer
