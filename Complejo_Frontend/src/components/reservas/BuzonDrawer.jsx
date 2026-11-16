import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BuzonItem from './BuzonItem'
import textos from '../../i18n/textos'
import { leerNotificacion } from '../../Redux/reservasSlice'
import './BuzonDrawer.css'

function BuzonDrawer({ idioma, isOpen, onClose }) {
  const dispatch = useDispatch()
  const mensajes = useSelector((state) => state.reservas.notificaciones)
  const t = textos[idioma].buzon

  const handleDescartar = (id) => {
    dispatch(leerNotificacion(id))
  }

  return (
    // siempre montado: al abrir y cerrar el panel se desliza desde la derecha (ver BuzonDrawer.css)
    <div className={`buzon-backdrop ${isOpen ? 'abierto' : ''}`} aria-hidden={!isOpen}>
      <div className="buzon-panel">
        <div className="buzon-header">
          <div className="bh-title-block">
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
                onDescartar={handleDescartar}
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
