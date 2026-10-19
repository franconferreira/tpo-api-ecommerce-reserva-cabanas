import React, { useState, useEffect } from 'react'
import EspacioCard from './EspacioCard'
import './EspacioList.css'

function EspacioList({ idioma, onAbrirDetalle }) {
  const [espacios, setEspacios] = useState([])
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'

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
          <span className="catalogo-overline">
            {es ? 'COMPLEJO WHISPERING PINES' : 'WHISPERING PINES SANCTUARY'}
          </span>
          <h1 className="catalogo-title">
            {es ? 'Cabañas del Bosque y Espacios de Eventos' : 'Woodland Dwellings & Gathering Spaces'}
          </h1>
          <p className="catalogo-subtitle">
            {es
              ? '20% OFF automático en noches de temporada baja (Mayo, Junio y Agosto) + 15% OFF en Pack Multi-Espacio (2 o más espacios).'
              : '20% OFF automatic discount on low-season nights (May, June & August) + 15% OFF Multi-Space Pack (2+ spaces).'}
          </p>
        </div>
      </div>

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
    </div>
  )
}

export default EspacioList
