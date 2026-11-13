import React, { useEffect } from 'react'
import DetalleEspacio from './DetalleEspacio'
import ReservaWidgetForm from './ReservaWidgetForm'
import textos from '../../i18n/textos'
import './DetalleEspacioModal.css'

function DetalleEspacioModal({
  idioma,
  espacio,
  onClose,
  isLogged,
  setCarritoData,
  onAbrirCarrito,
  onCuentaDesactivada
}) {
  const t = textos[idioma].detalle

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!espacio) {
    return null
  }

  const handleAgregarAlCarrito = () => {
    onClose()
    onAbrirCarrito()
  }

  return (
    <div className="detalle-modal-backdrop" onClick={onClose}>
      <div className="detalle-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="detalle-modal-header">
          <div className="dmh-info">
            <h1 className="dmh-title">{espacio.nombre}</h1>
          </div>
          <div className="dmh-actions">
            <button type="button" className="dmh-close-btn" onClick={onClose}>
              {t.volver}
            </button>
            <button
              type="button"
              className="dmh-btn-x"
              onClick={onClose}
              title={t.volver}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="detalle-modal-body">
          <div className="detalle-modal-panel-izq">
            <DetalleEspacio idioma={idioma} espacio={espacio} />
          </div>

          <div className="detalle-modal-panel-der">
            <ReservaWidgetForm
              idioma={idioma}
              espacio={espacio}
              isLogged={isLogged}
              setCarritoData={setCarritoData}
              onAbrirCarrito={handleAgregarAlCarrito}
              onCuentaDesactivada={onCuentaDesactivada}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleEspacioModal
