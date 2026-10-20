import React from 'react'
import EspacioList from '../components/EspacioList'
import '../components/EspacioList.css'

function CatalogoView({ idioma, onAbrirDetalle }) {
  const es = idioma === 'es'

  return (
    <div className="catalogo-wrapper">
      <div className="catalogo-hero-mapa">
        <div className="catalogo-hero-overlay">
          <span className="catalogo-overline">
            {es ? 'COMPLEJO WHISPERING PINES' : 'WHISPERING PINES SANCTUARY'}
          </span>
          <h1 className="catalogo-title">
            {es ? 'Cabañas del Bosque y Espacios de Eventos' : 'Woodland Dwellings & Gathering Spaces'}
          </h1>
          <p className="catalogo-subtitle">
            {es
              ? '20% OFF automático en noches de temporada baja (Mayo, Junio y Agosto) + 15% OFF en Pack Multi-Espacio (2 o más espacios).'
              : '20% OFF automatic discount on low-season nights (May, June & August) + 15% OFF Multi-Space Pack (2+ spaces).'}
          </p>
        </div>
      </div>

      <EspacioList idioma={idioma} onAbrirDetalle={onAbrirDetalle} />
    </div>
  )
}

export default CatalogoView
