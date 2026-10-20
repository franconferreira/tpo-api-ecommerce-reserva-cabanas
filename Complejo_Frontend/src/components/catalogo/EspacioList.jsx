import React, { useState, useEffect } from 'react'
import EspacioCard from './EspacioCard'
import { apiFetch } from '../../utils/api'
import './EspacioList.css'

function EspacioList({ idioma, onAbrirDetalle }) {
  const [espacios, setEspacios] = useState([])

  useEffect(() => {
    apiFetch('/api/espacios', { auth: false })
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
