import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReservaCard from './ReservaCard'
import './MisReservasList.css'

function MisReservasList({ idioma, ocultasIds, setOcultasIds }) {
  const [reservas, setReservas] = useState([])
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/reservas/mis-reservas`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setReservas(data)
        }
      })
      .catch((err) => {
        console.error('Error al obtener mis reservas: ', err)
      })
  }, [])

  let reservasVisibles = []
  reservas.map((r) => {
    let estaOculta = false
    ocultasIds.map((idOculta) => {
      if (idOculta === r.id) {
        estaOculta = true
      }
    })
    if (!estaOculta) {
      reservasVisibles = [...reservasVisibles, r]
    }
  })

  const handleOcultarReserva = (id, indice) => {
    setOcultasIds([...ocultasIds, id])
    const nuevasReservas = [...reservasVisibles]
    nuevasReservas.splice(indice, 1)
    setReservas(nuevasReservas)
  }

  const handleCancelar = (id, indice) => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/reservas/${id}`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mensaje) {
          const nuevasReservas = [...reservasVisibles]
          nuevasReservas.splice(indice, 1)
          setReservas(nuevasReservas)
          setError('')
        } else {
          console.error('Error al cancelar: ', data)
          setError(es ? 'No se pudo cancelar la reserva' : 'Could not cancel reservation')
        }
      })
      .catch((err) => {
        console.error('Error al cancelar: ', err)
        setError(es ? 'No se pudo cancelar la reserva' : 'Could not cancel reservation')
      })
  }

  return (
    <div className="mr-wrapper">
      <div className="mr-container">
        <div className="mr-header-row">
          <div>
            <h1 className="mr-title">
              {es ? 'Mis Reservas en el Complejo' : 'My Sanctuary Reservations'}
            </h1>
            <p className="mr-subtitle">
              {es
                ? 'Revisa y gestiona tus estadías reservadas en el bosque.'
                : 'Review and manage your active woodland retreats.'}
            </p>
          </div>
          <Link to="/catalogo" className="mr-btn-new">
            {es ? '+ Nueva Reserva' : '+ Plan New Getaway'}
          </Link>
        </div>

        {error && <p className="mr-error">{error}</p>}

        <div className="mr-list">
          {reservasVisibles.length === 0 ? (
            <div className="mr-empty-state">
              <h3>
                {es ? 'No se encontraron reservas activas.' : 'No active reservations found.'}
              </h3>
              <p>
                {es
                  ? 'Explora nuestro catálogo para reservar tu próxima estadía en Whispering Pines.'
                  : 'Explore our catalog to book your next stay at Whispering Pines.'}
              </p>
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
      </div>
    </div>
  )
}

export default MisReservasList
