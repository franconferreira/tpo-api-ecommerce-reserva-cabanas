import React from 'react'
import textos from '../../i18n/textos'

function ReservaCard({ idioma, reserva, index, onCancelar, onOcultarReserva }) {
  const t = textos[idioma].misReservas
  const comun = textos[idioma].comun
  const isCancelada = reserva.estado === 'CANCELADA'

  return (
    <div className="mr-card">
      <div className="mr-card-top">
        <div>
          <span className={isCancelada ? 'mr-status-pill cancelled' : 'mr-status-pill'}>
            ● {reserva.estado}
          </span>
          <strong className="mr-conf-code">{t.codigo(reserva.id)}</strong>
        </div>
        <div className="mr-totals">
          {reserva.descuentoPackPorcentaje > 0 && (
            <span className="mr-pack-badge">{t.pack(reserva.descuentoPackPorcentaje)}</span>
          )}
          <strong className="mr-total-price">${reserva.total} USD</strong>
        </div>
      </div>

      {isCancelada && reserva.mensajeCancelacion && (
        <div className="mr-cancel-notice">
          <strong>{t.avisoCancelacion}</strong>
          <p>{reserva.mensajeCancelacion}</p>
        </div>
      )}

      <div className="mr-detalles-list">
        {reserva.detalles &&
          reserva.detalles.map((detalle) => (
            <div className="mr-detalle-item" key={`${detalle.nombreEspacio}-${detalle.checkIn}`}>
              <div>
                <strong>🏠 {detalle.nombreEspacio}</strong>
                <span className="mr-detalle-dates">
                  📅 {detalle.checkIn} {comun.al} {detalle.checkOut}
                </span>
              </div>
              <span className="mr-detalle-rate">
                ${detalle.subtotal} {comun.porNoche}
              </span>
            </div>
          ))}
      </div>

      <div className="mr-card-footer">
        {isCancelada ? (
          <button
            type="button"
            className="mr-dismiss-btn"
            onClick={() => onOcultarReserva(reserva.id, index)}
          >
            {t.ocultar}
          </button>
        ) : (
          <button
            type="button"
            className="mr-cancel-btn"
            onClick={() => onCancelar(reserva.id, index)}
          >
            {t.cancelar}
          </button>
        )}
      </div>
    </div>
  )
}

export default ReservaCard
