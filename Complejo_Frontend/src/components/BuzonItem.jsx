import React from 'react'
import AdminReservaDetalleLine from './AdminReservaDetalleLine'

function BuzonItem({ idioma, reserva, index, onDescartar }) {
  const es = idioma === 'es'

  return (
    <div className="buzon-item">
      <div className="bi-header">
        <div>
          <span className="bi-badge">
            {es ? '⚠️ RESERVA CANCELADA' : '⚠️ CANCELLED BOOKING'}
          </span>
          <strong className="bi-code"> #WP-{reserva.id}</strong>
        </div>
      </div>

      <div className="bi-spaces">
        {reserva.detalles &&
          reserva.detalles.map((det) => (
            <AdminReservaDetalleLine idioma={idioma} detalle={det} key={`${det.nombreEspacio}-${det.checkIn}`} />
          ))}
      </div>

      <div className="bi-message-box">
        <strong>
          {es ? 'Mensaje del Administrador:' : 'Administrator Message:'}
        </strong>
        <p>{reserva.mensajeCancelacion}</p>
      </div>

      <div className="bi-footer">
        <button
          type="button"
          className="bi-dismiss-btn"
          onClick={() => onDescartar(index)}
        >
          {es ? '✓ Marcar como leído' : '✓ Mark as read'}
        </button>
      </div>
    </div>
  )
}

export default BuzonItem
