import React from 'react'
import BuzonItem from './BuzonItem'
import textos from '../../i18n/textos'
import './BuzonDrawer.css'

function BuzonDrawer({ idioma, mensajes, onDescartar, isOpen, onClose }) {
  const t = textos[idioma].buzon

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
              <h2 className="bh-title">{t.titulo}</h2>
              <span className="bh-subtitle">{t.avisos(mensajes.length)}</span>
            </div>
          </div>
          <button type="button" className="bh-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="buzon-body">
          {mensajes.length === 0 ? (
            <div className="buzon-empty">
              <p>{t.vacio}</p>
              <span>{t.vacioTexto}</span>
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
            {t.cerrar}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuzonDrawer
