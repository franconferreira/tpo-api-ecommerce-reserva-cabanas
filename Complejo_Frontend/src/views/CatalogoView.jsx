import React from 'react'
import { Link } from 'react-router-dom'
import EspacioList from '../components/catalogo/EspacioList'
import { MarcoVentana, Divisor, Voluta, TituloSeccion, LatigosFondo } from '../components/ornamentos/Ornamentos'
import textos from '../i18n/textos'
import './CatalogoView.css'
import { capturarPagina } from '../mapa3d/posterPagina'

function CatalogoView({ idioma, onAbrirDetalle }) {
  const t = textos[idioma].catalogo

  // "Ver espacios" baja hasta las tarjetas con un desplazamiento suave (acelera y frena) en vez de saltar
  const irAEspacios = (e) => {
    e.preventDefault()
    document.getElementById('espacios').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
            <a href="#espacios" className="boton-tema" onClick={irAEspacios}>
              <Voluta />
              {t.verEspacios}
              <Voluta derecha />
            </a>
            <Link to="/mapa-3d" className="catalogo-link-sec" onClick={capturarPagina}>
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
