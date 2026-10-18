import React, { useState, useEffect } from 'react'
import EspacioCard from './EspacioCard'
import './EspacioList.css'

function EspacioList({ onAbrirDetalle }) {
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
    <div className="catalogo-wrapper">
      <div className="catalogo-hero-mapa">
        <div className="catalogo-hero-overlay">
          <span className="catalogo-overline">WHISPERING PINES SANCTUARY</span>
          <h1 className="catalogo-title">Woodland Dwellings & Gathering Spaces</h1>
          <p className="catalogo-subtitle">
            20% OFF automatic discount on low-season nights (May, June & August) + 15% OFF Multi-Space Pack (2+ spaces).
          </p>
        </div>
      </div>

      <div className="catalogo-grid">
        {espacios.map((espacio) => (
          <EspacioCard
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
    </div>
  )
}

export default EspacioList
