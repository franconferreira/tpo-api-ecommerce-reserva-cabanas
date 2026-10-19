import React from 'react'

function CarritoItem({ idioma, item, index, onEliminar }) {
  const es = idioma === 'es'

  return (
    <div className="carrito-item">
      <div className="ci-header">
        <div className="ci-info">
          <div className="ci-texts">
            <h3>{item.espacio ? item.espacio.nombre : es ? 'Espacio' : 'Space'}</h3>
            <p className="ci-dates">
              📅 {item.checkIn} {es ? 'al' : 'to'} {item.checkOut}
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
          {es ? 'Base:' : 'Base:'} ${item.espacio ? item.espacio.precioBase : 0} {es ? '/ noche' : '/ night'}
        </span>
        <span className="ci-price">${item.subtotal}</span>
      </div>
    </div>
  )
}

export default CarritoItem
