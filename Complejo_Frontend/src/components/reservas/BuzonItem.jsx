import React from 'react'
import textos from '../../i18n/textos'

function BuzonItem({ idioma, reserva, onDescartar }) {
  const t = textos[idioma].buzon

  return (
    <div className="buzon-item">
      <div className="bi-header">
        <div>
          <span className="bi-badge">{t.badge}</span>
          <strong className="bi-code"> #WP-{reserva.id}</strong>
        </div>
      </div>

      <div className="bi-spaces">
        {reserva.detalles &&
          reserva.detalles.map((det) => (
            <div className="td-detalle-line" key={`${det.nombreEspacio}-${det.checkIn}`}>
              <strong>{det.nombreEspacio}</strong>
              <span> ({det.checkIn} {textos[idioma].comun.al} {det.checkOut})</span>
            </div>
          ))}
      </div>

      <div className="bi-message-box">
        <strong>{t.mensaje}</strong>
        <p>{reserva.mensajeCancelacion}</p>
      </div>

      <div className="bi-footer">
        <button
          type="button"
          className="bi-dismiss-btn"
          onClick={() => onDescartar(reserva.id)}
        >
          {t.marcarLeido}
        </button>
      </div>
    </div>
  )
}

export default BuzonItem
