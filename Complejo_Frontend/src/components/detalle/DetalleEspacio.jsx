import React, { useState } from 'react'
import FotoMiniatura from './FotoMiniatura'
import textos from '../../i18n/textos'
import { IMAGEN_POR_DEFECTO } from '../../utils/constantes'
import './DetalleEspacio.css'

function DetalleEspacio({ idioma, espacio }) {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(0)
  const t = textos[idioma].detalle

  const fotosValidas = espacio.imagenes
    ? espacio.imagenes.filter((img) => img && img.trim() !== '')
    : []
  const fotos = fotosValidas.length > 0 ? fotosValidas : [IMAGEN_POR_DEFECTO]

  return (
    <>
      <div className="detalle-galeria">
        <img
          src={fotos[fotoSeleccionada]}
          alt={espacio.nombre}
          className="detalle-img-main"
        />

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
      </div>
    </>
  )
}

export default DetalleEspacio
