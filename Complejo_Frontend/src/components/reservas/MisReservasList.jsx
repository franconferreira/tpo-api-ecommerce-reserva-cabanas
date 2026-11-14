import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReservaCard from './ReservaCard'
import textos from '../../i18n/textos'
import { fetchMisReservas, cancelarReserva, ocultarReserva } from '../../Redux/reservasSlice'
import './MisReservasList.css'

function MisReservasList({ idioma }) {
  const dispatch = useDispatch()
  const { items: reservas, ocultasIds, errorCancelar } = useSelector((state) => state.reservas)
  const t = textos[idioma].misReservas

  useEffect(() => {
    dispatch(fetchMisReservas())
  }, [dispatch])

  const reservasVisibles = reservas.filter((r) => !ocultasIds.includes(r.id))

  const handleOcultarReserva = (id) => {
    dispatch(ocultarReserva(id))
  }

  const handleCancelar = (id) => {
    dispatch(cancelarReserva(id))
  }

  return (
    <>
      {errorCancelar && <p className="mr-error">{t.errorCancelar}</p>}

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
