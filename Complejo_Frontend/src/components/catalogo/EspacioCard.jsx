import React from 'react'
import textos from '../../i18n/textos'
import { imagenPrincipal } from '../../utils/constantes'
import { Medallon, RinceauTarjeta } from '../ornamentos/Ornamentos'
import './EspacioCard.css'

function EspacioCard({ idioma, id, nombre, descripcion, precioBase, tipo, imagenes, variante, onVerDetalle }) {
  const t = textos[idioma].catalogo
  const tDetalle = textos[idioma].detalle

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

  const renderBadgeCapacidad = () => {
    if (tipo === 'CABANA') return t.capacidadCabana
    if (tipo === 'HABITACION_CASA_PRINCIPAL') return t.capacidadHabitacion
    if (tipo === 'GALPON_FIESTAS') return t.capacidadGalpon
    if (tipo === 'SALON_COMIDA_CASA_PRINCIPAL') return t.capacidadSalon
    return null
  }

  return (
    <div className="espacio-card" onClick={handleClick}>
      <Medallon />
      <RinceauTarjeta variante={variante} />

      <div className="ec-image-wrapper">
        <img
          src={imagenPrincipal(imagenes)}
          alt={nombre}
          className="ec-image"
        />
      </div>

      <div className="ec-content">
        <h3 className="ec-title">{nombre}</h3>
        <span className="ec-capacidad">{renderBadgeCapacidad()}</span>
        <p className="ec-desc">{descripcion}</p>
      </div>

      <div className="ec-footer">
        <div className="ec-price-block">
          {tipo === 'SALON_COMIDA_CASA_PRINCIPAL' ? (
            <span className="ec-comunal-incluido">
              {tDetalle.comunalIncluido || 'Área Comunal'}
            </span>
          ) : (
            <>
              <span className="ec-price-from">{t.desde}</span>
              <span className="ec-price-value">USD ${precioBase}</span>
              <span className="ec-price-suffix">{textos[idioma].comun.porNocheSufijo}</span>
            </>
          )}
        </div>
        <span className="ec-action-link">{t.verEspacio}</span>
      </div>
    </div>
  )
}

export default EspacioCard
