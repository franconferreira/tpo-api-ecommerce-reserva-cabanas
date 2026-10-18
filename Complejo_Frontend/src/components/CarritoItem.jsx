import React from 'react'

function CarritoItem({ item, index, onEliminar }) {
  return (
    <div className="carrito-item">
      <div className="ci-header">
        <div className="ci-info">
          <div className="ci-texts">
            <h3>{item.espacio ? item.espacio.nombre : 'Space'}</h3>
            <p className="ci-dates">
              📅 {item.checkIn} to {item.checkOut}
            </p>
            <span className="ci-type-tag">
              {item.espacio ? item.espacio.tipo : ''}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="ci-delete-btn"
          onClick={() => onEliminar(item.id, index)}
        >
          🗑️
        </button>
      </div>

      <div className="ci-footer">
        <span className="ci-calc">
          Base: ${item.espacio ? item.espacio.precioBase : 0} / night
        </span>
        <span className="ci-price">${item.subtotal}</span>
      </div>
    </div>
  )
}

export default CarritoItem
