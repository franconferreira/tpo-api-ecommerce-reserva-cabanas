import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CalendarioDisponibilidad from './CalendarioDisponibilidad'
import ReservaWidgetForm from './ReservaWidgetForm'
import './DetalleEspacio.css'

function DetalleEspacio({ idioma, espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  const navigate = useNavigate()
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'
  const imagenPorDefecto = 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800'
  const espacioId = espacio ? espacio.id : null

  useEffect(() => {
    if (espacioId) {
      fetch(`${URL}/api/espacios/${espacioId}/fechas-ocupadas`)
        .then((response) => response.json())
        .then((data) => {
          setFechasOcupadas(data)
        })
        .catch((err) => {
          console.error('Error al cargar fechas ocupadas: ', err)
        })
    }
  }, [espacioId])

  if (!espacio) {
    return (
      <div className="detalle-empty">
        <h2>{es ? 'Ningún espacio seleccionado' : 'No space selected'}</h2>
        <p>
          {es
            ? 'Por favor selecciona un alojamiento desde el catálogo.'
            : 'Please select an accommodation from the catalog first.'}
        </p>
        <Link to="/catalogo" className="detalle-back-btn">
          {es ? '← Volver al Catálogo' : '← Return to Catalog'}
        </Link>
      </div>
    )
  }

  const imagenPrincipal =
    espacio.imagenes && espacio.imagenes.length > 0 && espacio.imagenes[0] && espacio.imagenes[0].trim() !== ''
      ? espacio.imagenes[0]
      : imagenPorDefecto

  return (
    <div className="detalle-wrapper">
      <div className="detalle-card">
        <div className="detalle-header">
          <div className="dh-info">
            <h1 className="dh-title">{espacio.nombre}</h1>
          </div>
          <button type="button" className="dh-close-btn" onClick={() => navigate('/catalogo')}>
            {es ? '← Volver al Catálogo' : '← Back to Catalog'}
          </button>
        </div>

        <div className="detalle-body">
          <div className="detalle-panel-izq">
            <img
              src={imagenPrincipal}
              alt={espacio.nombre}
              className="detalle-img-main"
            />

            <div className="di-textos">
              <h2 className="di-subtitulo">
                {es ? 'Sobre este Espacio del Complejo' : 'About this Sanctuary Space'}
              </h2>
              <p className="di-parrafo">{espacio.descripcion}</p>
            </div>

            <CalendarioDisponibilidad idioma={idioma} fechasOcupadas={fechasOcupadas} />
          </div>

          <div className="detalle-panel-der">
            <ReservaWidgetForm
              idioma={idioma}
              espacio={espacio}
              isLogged={isLogged}
              setCarritoData={setCarritoData}
              onAbrirCarrito={onAbrirCarrito}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleEspacio
