import React from 'react'
import { Link } from 'react-router-dom'
import EspacioList from '../components/catalogo/EspacioList'
import { MarcoVentana, Divisor, Voluta, TituloSeccion, LatigosFondo } from '../components/ornamentos/Ornamentos'
import textos from '../i18n/textos'
import './CatalogoView.css'

function CatalogoView({ idioma, onAbrirDetalle }) {
  const t = textos[idioma].catalogo

  return (
    <div className="catalogo-wrapper">
      <section className="catalogo-hero">
        <LatigosFondo />
        <MarcoVentana />
        <div className="catalogo-hero-texto">
          <span className="catalogo-overline">{t.overline}</span>
          <h1 className="catalogo-title">{t.titulo}</h1>
          <Divisor />
          <p className="catalogo-subtitle">{t.subtitulo}</p>
          <div className="catalogo-acciones">
            <a href="#espacios" className="boton-tema">
              <Voluta />
              {t.verEspacios}
              <Voluta derecha />
            </a>
            <Link to="/mapa-3d" className="catalogo-link-sec">
              {t.recorrido}
            </Link>
          </div>
        </div>
      </section>

      <TituloSeccion titulo={t.seccion} />

      <div id="espacios">
        <EspacioList idioma={idioma} onAbrirDetalle={onAbrirDetalle} />
      </div>
    </div>
  )
}

export default CatalogoView
