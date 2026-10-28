import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DetalleEspacio from '../components/detalle/DetalleEspacio'
import ReservaWidgetForm from '../components/detalle/ReservaWidgetForm'
import textos from '../i18n/textos'
import './DetalleEspacioView.css'

function DetalleEspacioView({
  idioma,
  espacio,
  isLogged,
  setCarritoData,
  onAbrirCarrito,
  onCuentaDesactivada
}) {
  const navigate = useNavigate()
  const t = textos[idioma].detalle

  if (!espacio) {
    return (
      <div className="detalle-empty">
        <h2>{t.vacioTitulo}</h2>
        <p>{t.vacioTexto}</p>
        <Link to="/catalogo" className="detalle-back-btn">
          {t.vacioVolver}
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
            {t.volver}
          </button>
        </div>

        <div className="detalle-body">
          <div className="detalle-panel-izq">
            <DetalleEspacio idioma={idioma} espacio={espacio} />
          </div>

          <div className="detalle-panel-der">
            <ReservaWidgetForm
              idioma={idioma}
              espacio={espacio}
              isLogged={isLogged}
              setCarritoData={setCarritoData}
              onAbrirCarrito={onAbrirCarrito}
              onCuentaDesactivada={onCuentaDesactivada}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleEspacioView
