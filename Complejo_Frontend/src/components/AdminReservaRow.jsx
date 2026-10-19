import React from 'react'
import AdminReservaDetalleLine from './AdminReservaDetalleLine'
import AdminCancelarForm from './AdminCancelarForm'

function AdminReservaRow({ idioma, reserva, onCancelar }) {
  const isCancelled = reserva.estado === 'CANCELADA'
  const es = idioma === 'es'

  return (
    <tr className={isCancelled ? 'row-cancelled' : ''}>
      <td>
        <strong>#WP-{reserva.id}</strong>
      </td>
      <td>
        <div className="td-guest">
          <strong className={isCancelled ? 'strikethrough' : ''}>
            {reserva.nombreUsuario || (es ? 'Huésped' : 'Guest')}
          </strong>
          <span>{reserva.emailUsuario}</span>
        </div>
      </td>
      <td>
        <div className="td-detalles">
          {reserva.detalles &&
            reserva.detalles.map((det) => (
              <AdminReservaDetalleLine idioma={idioma} detalle={det} key={`${det.nombreEspacio}-${det.checkIn}`} />
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
        {!isCancelled ? (
          <AdminCancelarForm
            idioma={idioma}
            reservaId={reserva.id}
            onCancelar={onCancelar}
          />
        ) : (
          reserva.mensajeCancelacion && (
            <span className="admin-cancel-reason">
              {reserva.mensajeCancelacion}
            </span>
          )
        )}
      </td>
    </tr>
  )
}

export default AdminReservaRow
