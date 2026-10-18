import React from 'react'
import ReservaDetalleItem from './ReservaDetalleItem'

function ReservaCard({ reserva, index, onCancelar }) {
  return (
    <div className="mr-card">
      <div className="mr-card-top">
        <div>
          <span className="mr-status-pill">● {reserva.estado}</span>
          <strong className="mr-conf-code"> Booking #{reserva.id}</strong>
        </div>
        <div className="mr-totals">
          {reserva.descuentoPackPorcentaje > 0 && (
            <span className="mr-pack-badge">
              Pack {reserva.descuentoPackPorcentaje}% OFF Applied
            </span>
          )}
          <strong className="mr-total-price">${reserva.total} USD</strong>
        </div>
      </div>

      <div className="mr-detalles-list">
        {reserva.detalles &&
          reserva.detalles.map((detalle, detIndex) => (
            <ReservaDetalleItem detalle={detalle} key={detIndex} />
          ))}
      </div>

      <div className="mr-card-footer">
        <button
          type="button"
          className="mr-cancel-btn"
          onClick={() => onCancelar(reserva.id, index)}
        >
          ⊗ Cancel Reservation
        </button>
      </div>
    </div>
  )
}

export default ReservaCard
