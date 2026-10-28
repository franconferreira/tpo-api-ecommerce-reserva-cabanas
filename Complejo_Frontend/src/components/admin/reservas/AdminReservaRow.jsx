import React from 'react'
import textos from '../../../i18n/textos'

function AdminReservaRow({ idioma, reserva, onCambiarMotivo, onCancelar }) {
  const t = textos[idioma].adminReservas
  const comun = textos[idioma].comun
  const isCancelled = reserva.estado === 'CANCELADA'

  return (
    <tr className={isCancelled ? 'row-cancelled' : ''}>
      <td>
        <strong>#WP-{reserva.id}</strong>
      </td>
      <td>
        <div className="td-guest">
          <strong className={isCancelled ? 'strikethrough' : ''}>
            {reserva.nombreUsuario || comun.huesped}
          </strong>
          <span>{reserva.emailUsuario}</span>
        </div>
      </td>
      <td>
        <div className="td-detalles">
          {reserva.detalles &&
            reserva.detalles.map((det) => (
              <div className="td-detalle-line" key={`${det.nombreEspacio}-${det.checkIn}`}>
                <strong>{det.nombreEspacio}</strong>
                <span> ({det.checkIn} {comun.al} {det.checkOut})</span>
              </div>
            ))}
        </div>
      </td>
      <td>
        <div className="td-payment">
          <strong>USD ${reserva.total}</strong>
          {reserva.descuentoPackPorcentaje > 0 && (
            <span className="pack-tag">
              Pack {reserva.descuentoPackPorcentaje}% OFF
            </span>
          )}
        </div>
      </td>
      <td>
        <span className={isCancelled ? 'status-pill status-cancelled' : 'status-pill status-confirmed'}>
          {reserva.estado}
        </span>
      </td>
      <td>
        {!isCancelled ? (
          <form onSubmit={(e) => e.preventDefault()} className="admin-cancel-form">
            <input
              type="text"
              name="mensajeCancelacion"
              className="admin-cancel-input"
              placeholder={t.motivoPlaceholder}
              value={reserva.mensajeCancelacion || ''}
              onChange={(e) => onCambiarMotivo(reserva.id, e.target.value)}
            />
            <button type="submit" className="btn-cancel-admin" onClick={() => onCancelar(reserva)}>
              {t.cancelar}
            </button>
          </form>
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
