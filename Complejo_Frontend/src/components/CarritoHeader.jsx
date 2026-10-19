import React from 'react'

function CarritoHeader({ idioma, cantidad, onClose }) {
  const es = idioma === 'es'

  return (
    <div className="carrito-header">
      <div className="ch-title-block">
        <span className="ch-icon">🛍️</span>
        <div>
          <h2 className="ch-title">{es ? 'Tu Carrito de Reserva' : 'Your Sanctuary Cart'}</h2>
          <span className="ch-subtitle">
            {es ? `${cantidad} espacios seleccionados` : `${cantidad} spaces selected`}
          </span>
        </div>
      </div>
      <button type="button" className="ch-close-btn" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

export default CarritoHeader
