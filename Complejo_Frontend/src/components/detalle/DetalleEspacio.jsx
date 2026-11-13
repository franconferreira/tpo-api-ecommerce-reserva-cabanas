import React, { useState } from 'react'
import FotoMiniatura from './FotoMiniatura'
import ReservaWidgetInfo from './ReservaWidgetInfo'
import textos from '../../i18n/textos'
import { IMAGEN_POR_DEFECTO } from '../../utils/constantes'
import './DetalleEspacio.css'

function DetalleEspacio({ idioma, espacio }) {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(0)
  const t = textos[idioma].detalle
  const tWidget = textos[idioma].widget

  const fotosValidas = espacio.imagenes
    ? espacio.imagenes.filter((img) => img && img.trim() !== '')
    : []
  const fotos = fotosValidas.length > 0 ? fotosValidas : [IMAGEN_POR_DEFECTO]

  const renderBadgeTipo = () => {
    if (espacio.tipo === 'CABANA') return t.badgeCabana
    if (espacio.tipo === 'HABITACION_CASA_PRINCIPAL') return t.badgeHabitacion
    if (espacio.tipo === 'GALPON_FIESTAS') return t.badgeGalpon
    if (espacio.tipo === 'SALON_COMIDA_CASA_PRINCIPAL') return t.badgeSalon
    return null
  }

  return (
    <>
      <div className="detalle-galeria">
        <div className="detalle-img-wrapper">
          <img
            src={fotos[fotoSeleccionada]}
            alt={espacio.nombre}
            className="detalle-img-main"
          />
          <span className="detalle-badge-tipo">
            {renderBadgeTipo()}
          </span>
        </div>

        {fotos.length > 1 && (
          <div className="galeria-miniaturas">
            {fotos.map((foto, indice) => (
              <FotoMiniatura
                foto={foto}
                indice={indice}
                nombre={espacio.nombre}
                activa={indice === fotoSeleccionada}
                onSeleccionar={setFotoSeleccionada}
                key={indice}
              />
            ))}
          </div>
        )}
      </div>

      <div className="di-textos">
        <h2 className="di-subtitulo">{t.sobre}</h2>
        <p className="di-parrafo">{espacio.descripcion}</p>

        {espacio.tipo === 'HABITACION_CASA_PRINCIPAL' && (
          <div className="di-casa-principal-card">
            <h4>{t.infoHabitacionTitulo}</h4>
            <p style={{ whiteSpace: 'pre-line' }}>{t.infoHabitacionTexto}</p>
          </div>
        )}

        {espacio.tipo === 'SALON_COMIDA_CASA_PRINCIPAL' && (
          <div className="di-casa-principal-card">
            <h4>{t.infoSalonTitulo}</h4>
            <p>{t.infoSalonTexto}</p>
          </div>
        )}
      </div>

      <div className="di-promos">
        <div>
          <span className="wr-promo-tag">{tWidget.promo}</span>
        </div>
        <ReservaWidgetInfo idioma={idioma} />
      </div>
    </>
  )
}

export default DetalleEspacio
