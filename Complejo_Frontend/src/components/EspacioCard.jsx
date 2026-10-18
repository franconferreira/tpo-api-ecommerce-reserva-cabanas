import React from 'react'
import './EspacioCard.css'

function EspacioCard({ id, nombre, descripcion, precioBase, tipo, imagenes, onVerDetalle }) {
  const imagenPrincipal = imagenes && imagenes.length > 0 ? imagenes[0] : ''

  const handleClick = () => {
    onVerDetalle({
      id: id,
      nombre: nombre,
      descripcion: descripcion,
      precioBase: precioBase,
      tipo: tipo,
      imagenes: imagenes
    })
  }

  return (
    <div className="espacio-card" onClick={handleClick}>
      <div className="ec-image-wrapper">
        <img src={imagenPrincipal} alt={nombre} className="ec-image" />
        <div className="ec-tag-top-left">
          <span>🌲 Whispering Pines</span>
        </div>
      </div>

      <div className="ec-content">
        <div className="ec-header">
          <h3 className="ec-title">{nombre}</h3>
          <span className="ec-category-tag">{tipo}</span>
        </div>

        <p className="ec-desc">{descripcion}</p>
      </div>

      <div className="ec-footer">
        <div className="ec-price-block">
          <span className="ec-price-from">From </span>
          <span className="ec-price-value">${precioBase}</span>
          <span className="ec-price-suffix"> / night</span>
        </div>
        <span className="ec-action-link">Explore Space ➔</span>
      </div>
    </div>
  )
}

export default EspacioCard
