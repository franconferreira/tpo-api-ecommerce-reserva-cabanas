import React, { useState, useEffect } from 'react'
import EspacioCard from './EspacioCard'

function EspacioList({ idioma, onAbrirDetalle }) {
  const [espacios, setEspacios] = useState([])
  const URL = 'http://localhost:8080'

  useEffect(() => {
    fetch(`${URL}/api/espacios`)
      .then((response) => response.json())
      .then((data) => {
        setEspacios(data)
      })
      .catch((error) => {
        console.error('Error al mostrar los espacios: ', error)
      })
  }, [])

  return (
    <div className="catalogo-grid">
      {espacios.map((espacio) => (
        <EspacioCard
          idioma={idioma}
          id={espacio.id}
          nombre={espacio.nombre}
          descripcion={espacio.descripcion}
          precioBase={espacio.precioBase}
          tipo={espacio.tipo}
          imagenes={espacio.imagenes}
          onVerDetalle={onAbrirDetalle}
          key={espacio.id}
        />
      ))}
    </div>
  )
}

export default EspacioList
