import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DetalleEspacio from '../components/DetalleEspacio'
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad'
import ReservaWidgetForm from '../components/ReservaWidgetForm'
import '../components/DetalleEspacio.css'

function DetalleEspacioView({ idioma, espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  const navigate = useNavigate()
  const es = idioma === 'es'

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
            <DetalleEspacio idioma={idioma} espacio={espacio} />
            <CalendarioDisponibilidad idioma={idioma} espacioId={espacio.id} />
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

export default DetalleEspacioView
