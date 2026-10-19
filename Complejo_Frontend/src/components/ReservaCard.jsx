import React from 'react'
import ReservaDetalleItem from './ReservaDetalleItem'

function ReservaCard({ idioma, reserva, index, onCancelar, onOcultarReserva }) {
  const es = idioma === 'es'
  const isCancelada = reserva.estado === 'CANCELADA'

  return (
    <div className="mr-card">
      <div className="mr-card-top">
        <div>
          <span className={isCancelada ? 'mr-status-pill cancelled' : 'mr-status-pill'}>
            ● {reserva.estado}
          </span>
          <strong className="mr-conf-code">
            {es ? ` Reserva #${reserva.id}` : ` Booking #${reserva.id}`}
          </strong>
        </div>
        <div className="mr-totals">
          {reserva.descuentoPackPorcentaje > 0 && (
            <span className="mr-pack-badge">
              {es
                ? `Pack ${reserva.descuentoPackPorcentaje}% OFF Aplicado`
                : `Pack ${reserva.descuentoPackPorcentaje}% OFF Applied`}
            </span>
          )}
          <strong className="mr-total-price">${reserva.total} USD</strong>
        </div>
      </div>

      {isCancelada && reserva.mensajeCancelacion && (
        <div className="mr-cancel-notice">
          <strong>
            {es
              ? '⚠️ Aviso de Cancelación del Administrador:'
              : '⚠️ Administrator Cancellation Notice:'}
          </strong>
          <p>{reserva.mensajeCancelacion}</p>
        </div>
      )}

      <div className="mr-detalles-list">
        {reserva.detalles &&
          reserva.detalles.map((detalle) => (
            <ReservaDetalleItem idioma={idioma} detalle={detalle} key={`${detalle.nombreEspacio}-${detalle.checkIn}`} />
          ))}
      </div>

      <div className="mr-card-footer">
        {isCancelada ? (
          <button
            type="button"
            className="mr-dismiss-btn"
            onClick={() => onOcultarReserva(reserva.id, index)}
          >
            {es ? '✕ Ocultar de mi vista' : '✕ Dismiss / Remove'}
          </button>
        ) : (
          <button
            type="button"
            className="mr-cancel-btn"
            onClick={() => onCancelar(reserva.id, index)}
          >
            {es ? '⊗ Cancelar Reserva' : '⊗ Cancel Reservation'}
          </button>
        )}
      </div>
    </div>
  )
}

export default ReservaCard
