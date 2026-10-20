import React from 'react'
import { Link } from 'react-router-dom'
import MisReservasList from '../components/MisReservasList'
import '../components/MisReservasList.css'

function MisReservasView({ idioma, ocultasIds, setOcultasIds }) {
  const es = idioma === 'es'

  return (
    <div className="mr-wrapper">
      <div className="mr-container">
        <div className="mr-header-row">
          <div>
            <h1 className="mr-title">
              {es ? 'Mis Reservas en el Complejo' : 'My Sanctuary Reservations'}
            </h1>
            <p className="mr-subtitle">
              {es
                ? 'Revisa y gestiona tus estadías reservadas en el bosque.'
                : 'Review and manage your active woodland retreats.'}
            </p>
          </div>
          <Link to="/catalogo" className="mr-btn-new">
            {es ? '+ Nueva Reserva' : '+ Plan New Getaway'}
          </Link>
        </div>

        <MisReservasList
          idioma={idioma}
          ocultasIds={ocultasIds}
          setOcultasIds={setOcultasIds}
        />
      </div>
    </div>
  )
}

export default MisReservasView
