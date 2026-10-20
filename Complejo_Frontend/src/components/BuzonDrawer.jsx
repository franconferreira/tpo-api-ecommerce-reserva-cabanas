import React from 'react'
import BuzonItem from './BuzonItem'
import './BuzonDrawer.css'

function BuzonDrawer({ idioma, mensajes, onDescartar, isOpen, onClose }) {
  const es = idioma === 'es'

  if (!isOpen) {
    return null
  }

  return (
    <div className="buzon-backdrop">
      <div className="buzon-panel">
        <div className="buzon-header">
          <div className="bh-title-block">
            <span className="bh-icon">📬</span>
            <div>
              <h2 className="bh-title">
                {es ? 'Buzón de Notificaciones' : 'Notifications Inbox'}
              </h2>
              <span className="bh-subtitle">
                {es
                  ? `${mensajes.length} avisos de administración`
                  : `${mensajes.length} administration notices`}
              </span>
            </div>
          </div>
          <button type="button" className="bh-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="buzon-body">
          {mensajes.length === 0 ? (
            <div className="buzon-empty">
              <p>
                {es
                  ? 'No tienes notificaciones pendientes.'
                  : 'You have no pending notifications.'}
              </p>
              <span>
                {es
                  ? 'Aquí aparecerán los avisos si el administrador cancela alguna reserva.'
                  : 'Notices will appear here if an administrator cancels a reservation.'}
              </span>
            </div>
          ) : (
            mensajes.map((reserva) => (
              <BuzonItem
                idioma={idioma}
                reserva={reserva}
                onDescartar={onDescartar}
                key={reserva.id}
              />
            ))
          )}
        </div>

        <div className="buzon-footer">
          <button type="button" className="bf-close-btn" onClick={onClose}>
            {es ? 'Cerrar Buzón' : 'Close Inbox'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuzonDrawer
