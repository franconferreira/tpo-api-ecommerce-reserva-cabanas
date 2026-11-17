import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import DetalleEspacio from './DetalleEspacio'
import ReservaWidgetForm from './ReservaWidgetForm'
import textos from '../../i18n/textos'
import './DetalleEspacioModal.css'

function DetalleEspacioModal({ idioma, espacio, onClose }) {
  const carritoAbierto = useSelector((state) => state.carrito.abierto)
  const t = textos[idioma].detalle

  // Cuando se agrega un espacio al carrito, el slice abre el carrito: el modal se cierra para mostrarlo
  useEffect(() => {
    if (carritoAbierto) {
      onClose()
    }
  }, [carritoAbierto, onClose])

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
            <ReservaWidgetForm idioma={idioma} espacio={espacio} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleEspacioModal
