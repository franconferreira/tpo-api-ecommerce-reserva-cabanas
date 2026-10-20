import React from 'react'
import EspacioList from '../components/catalogo/EspacioList'
import textos from '../i18n/textos'
import './CatalogoView.css'

function CatalogoView({ idioma, onAbrirDetalle }) {
  const t = textos[idioma].catalogo

  return (
    <div className="catalogo-wrapper">
      <div className="catalogo-hero-mapa">
        <div className="catalogo-hero-overlay">
          <span className="catalogo-overline">{t.overline}</span>
          <h1 className="catalogo-title">{t.titulo}</h1>
          <p className="catalogo-subtitle">{t.subtitulo}</p>
        </div>
      </div>

      <EspacioList idioma={idioma} onAbrirDetalle={onAbrirDetalle} />
    </div>
  )
}

export default CatalogoView
