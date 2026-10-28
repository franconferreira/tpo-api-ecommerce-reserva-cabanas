import React from 'react'
import textos from '../../i18n/textos'

function CarritoItem({ idioma, item, index, onEliminar }) {
  const t = textos[idioma].comun

  return (
    <div className="carrito-item">
      <div className="ci-header">
        <div className="ci-info">
          <div className="ci-texts">
            <h3>{item.espacio ? item.espacio.nombre : t.espacio}</h3>
            <p className="ci-dates">
              📅 {item.checkIn} {t.al} {item.checkOut}
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
          {textos[idioma].carrito.base} USD ${item.espacio ? item.espacio.precioBase : 0} {t.porNoche}
        </span>
        <span className="ci-price">USD ${item.subtotal}</span>
      </div>
    </div>
  )
}

export default CarritoItem
