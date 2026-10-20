import React from 'react'
import textos from '../../i18n/textos'

function CarritoHeader({ idioma, cantidad, onClose }) {
  const t = textos[idioma].carrito

  return (
    <div className="carrito-header">
      <div className="ch-title-block">
        <span className="ch-icon">🛍️</span>
        <div>
          <h2 className="ch-title">{t.titulo}</h2>
          <span className="ch-subtitle">{t.seleccionados(cantidad)}</span>
        </div>
      </div>
      <button type="button" className="ch-close-btn" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

export default CarritoHeader
