import React from 'react'
import './EspacioCard.css'

function EspacioCard({ idioma, id, nombre, descripcion, precioBase, tipo, imagenes, onVerDetalle }) {
  const es = idioma === 'es'
  const imagenPorDefecto = 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800'
  const imagenPrincipal =
    imagenes && imagenes.length > 0 && imagenes[0] && imagenes[0].trim() !== ''
      ? imagenes[0]
      : imagenPorDefecto

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
        <img
          src={imagenPrincipal}
          alt={nombre}
          className="ec-image"
        />
      </div>

      <div className="ec-content">
        <div className="ec-header">
          <h3 className="ec-title">{nombre}</h3>
        </div>

        <p className="ec-desc">{descripcion}</p>
      </div>

      <div className="ec-footer">
        <div className="ec-price-block">
          <span className="ec-price-from">{es ? 'Desde ' : 'From '}</span>
          <span className="ec-price-value">${precioBase}</span>
          <span className="ec-price-suffix">{es ? ' / noche' : ' / night'}</span>
        </div>
        <span className="ec-action-link">
          {es ? 'Ver Espacio ➔' : 'Explore Space ➔'}
        </span>
      </div>
    </div>
  )
}

export default EspacioCard
