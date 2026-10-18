import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FechasOcupadasLista from './FechasOcupadasLista'
import ReservaWidgetForm from './ReservaWidgetForm'
import './DetalleEspacio.css'

function DetalleEspacio({ espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  const navigate = useNavigate()
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  const URL = 'http://localhost:8080'

  useEffect(() => {
    if (espacio && espacio.id) {
      fetch(`${URL}/api/espacios/${espacio.id}/fechas-ocupadas`)
        .then((response) => response.json())
        .then((data) => {
          setFechasOcupadas(data)
        })
        .catch((err) => {
          console.error('Error al cargar fechas ocupadas: ', err)
        })
    }
  }, [])

  if (!espacio) {
    return (
      <div className="detalle-empty">
        <h2>No space selected</h2>
        <p>Please select an accommodation from the catalog first.</p>
        <Link to="/catalogo" className="detalle-back-btn">
          ← Return to Catalog
        </Link>
      </div>
    )
  }

  const imagenPrincipal = espacio.imagenes && espacio.imagenes.length > 0 ? espacio.imagenes[0] : ''

  return (
    <div className="detalle-wrapper">
      <div className="detalle-card">
        <div className="detalle-header">
          <div className="dh-info">
            <h1 className="dh-title">{espacio.nombre}</h1>
            <span className="dh-tag">{espacio.tipo}</span>
          </div>
          <button type="button" className="dh-close-btn" onClick={() => navigate('/catalogo')}>
            ← Back to Catalog
          </button>
        </div>

        <div className="detalle-body">
          <div className="detalle-panel-izq">
            {imagenPrincipal && (
              <img src={imagenPrincipal} alt={espacio.nombre} className="detalle-img-main" />
            )}

            <div className="di-textos">
              <h2 className="di-subtitulo">About this Sanctuary Space</h2>
              <p className="di-parrafo">{espacio.descripcion}</p>
            </div>

            {fechasOcupadas.length > 0 && (
              <FechasOcupadasLista fechas={fechasOcupadas} />
            )}
          </div>

          <div className="detalle-panel-der">
            <ReservaWidgetForm
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
