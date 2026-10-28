import React, { useState, useEffect } from 'react'
import ReservaCard from './ReservaCard'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import './MisReservasList.css'

function MisReservasList({ idioma, ocultasIds, setOcultasIds, onCuentaDesactivada }) {
  const [reservas, setReservas] = useState([])
  const [error, setError] = useState('')
  const t = textos[idioma].misReservas

  useEffect(() => {
    apiFetch('/api/reservas/mis-reservas')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setReservas(data)
        }
      })
      .catch((err) => {
        console.error('Error al obtener mis reservas: ', err)
      })
  }, [])

  const reservasVisibles = reservas.filter((r) => !ocultasIds.includes(r.id))

  const handleOcultarReserva = (id, indice) => {
    setOcultasIds([...ocultasIds, id])
    const nuevasReservas = [...reservasVisibles]
    nuevasReservas.splice(indice, 1)
    setReservas(nuevasReservas)
  }

  const handleCancelar = (id, indice) => {
    apiFetch(`/api/reservas/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
        if (data && data.mensaje) {
          const nuevasReservas = [...reservasVisibles]
          nuevasReservas.splice(indice, 1)
          setReservas(nuevasReservas)
          setError('')
        } else {
          console.error('Error al cancelar: ', data)
          setError(t.errorCancelar)
        }
      })
      .catch((err) => {
        console.error('Error al cancelar: ', err)
        setError(t.errorCancelar)
      })
  }

  return (
    <>
      {error && <p className="mr-error">{error}</p>}

      <div className="mr-list">
        {reservasVisibles.length === 0 ? (
          <div className="mr-empty-state">
            <h3>{t.vacioTitulo}</h3>
            <p>{t.vacioTexto}</p>
          </div>
        ) : (
          reservasVisibles.map((reserva, index) => (
            <ReservaCard
              idioma={idioma}
              reserva={reserva}
              index={index}
              onCancelar={handleCancelar}
              onOcultarReserva={handleOcultarReserva}
              key={reserva.id}
            />
          ))
        )}
      </div>
    </>
  )
}

export default MisReservasList
