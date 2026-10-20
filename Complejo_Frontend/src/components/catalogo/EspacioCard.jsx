import React from 'react'
import textos from '../../i18n/textos'
import { imagenPrincipal } from '../../utils/constantes'
import './EspacioCard.css'

function EspacioCard({ idioma, id, nombre, descripcion, precioBase, tipo, imagenes, onVerDetalle }) {
  const t = textos[idioma].catalogo

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
          src={imagenPrincipal(imagenes)}
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
          <span className="ec-price-from">{t.desde}</span>
          <span className="ec-price-value">${precioBase}</span>
          <span className="ec-price-suffix">{textos[idioma].comun.porNocheSufijo}</span>
        </div>
        <span className="ec-action-link">{t.verEspacio}</span>
      </div>
    </div>
  )
}

export default EspacioCard
