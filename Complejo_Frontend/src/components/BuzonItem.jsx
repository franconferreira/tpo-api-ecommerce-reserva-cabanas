import React from 'react'

function BuzonItem({ idioma, reserva, onDescartar }) {
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
            <div className="td-detalle-line" key={`${det.nombreEspacio}-${det.checkIn}`}>
              <strong>{det.nombreEspacio}</strong>
              <span> ({det.checkIn} {es ? 'al' : 'to'} {det.checkOut})</span>
            </div>
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
          onClick={() => onDescartar(reserva.id)}
        >
          {es ? '✓ Marcar como leído' : '✓ Mark as read'}
        </button>
      </div>
    </div>
  )
}

export default BuzonItem
