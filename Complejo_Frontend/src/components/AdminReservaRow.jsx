import React from 'react'
import AdminReservaDetalleLine from './AdminReservaDetalleLine'

function AdminReservaRow({ reserva, onCancelar }) {
  const isCancelled = reserva.estado === 'CANCELADA'

  return (
    <tr className={isCancelled ? 'row-cancelled' : ''}>
      <td>
        <strong>#WP-{reserva.id}</strong>
      </td>
      <td>
        <div className="td-guest">
          <strong className={isCancelled ? 'strikethrough' : ''}>
            {reserva.nombreUsuario || 'Guest'}
          </strong>
          <span>{reserva.emailUsuario}</span>
        </div>
      </td>
      <td>
        <div className="td-detalles">
          {reserva.detalles &&
            reserva.detalles.map((det, idx) => (
              <AdminReservaDetalleLine detalle={det} key={idx} />
            ))}
        </div>
      </td>
      <td>
        <div className="td-payment">
          <strong>${reserva.total}</strong>
          {reserva.descuentoPackPorcentaje > 0 && (
            <span className="pack-tag">
              Pack {reserva.descuentoPackPorcentaje}% OFF
            </span>
          )}
        </div>
      </td>
      <td>
        <span
          className={
            isCancelled
              ? 'status-pill status-cancelled'
              : 'status-pill status-confirmed'
          }
        >
          {reserva.estado}
        </span>
      </td>
      <td>
        {!isCancelled && (
          <button
            type="button"
            className="btn-cancel-admin"
            onClick={() => onCancelar(reserva.id)}
          >
            ⊗ Cancel Reservation
          </button>
        )}
      </td>
    </tr>
  )
}

export default AdminReservaRow
