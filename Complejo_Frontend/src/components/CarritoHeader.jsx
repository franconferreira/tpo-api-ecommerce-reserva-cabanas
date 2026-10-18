import React from 'react'

function CarritoHeader({ cantidad, onClose }) {
  return (
    <div className="carrito-header">
      <div className="ch-title-block">
        <span className="ch-icon">🛍️</span>
        <div>
          <h2 className="ch-title">Your Sanctuary Cart</h2>
          <span className="ch-subtitle">{cantidad} spaces selected</span>
        </div>
      </div>
      <button type="button" className="ch-close-btn" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

export default CarritoHeader
