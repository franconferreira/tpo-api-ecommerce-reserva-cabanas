import React, { useState } from 'react'
import FotoMiniatura from './FotoMiniatura'

function DetalleEspacio({ idioma, espacio }) {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(0)
  const es = idioma === 'es'
  const imagenPorDefecto = 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800'

  const fotosValidas = espacio.imagenes
    ? espacio.imagenes.filter((img) => img && img.trim() !== '')
    : []
  const fotos = fotosValidas.length > 0 ? fotosValidas : [imagenPorDefecto]

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
        <h2 className="di-subtitulo">
          {es ? 'Sobre este Espacio del Complejo' : 'About this Sanctuary Space'}
        </h2>
        <p className="di-parrafo">{espacio.descripcion}</p>
      </div>
    </>
  )
}

export default DetalleEspacio
