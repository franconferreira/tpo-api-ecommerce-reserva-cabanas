import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReservaCard from './ReservaCard'
import './MisReservasList.css'

function MisReservasList() {
  const [reservas, setReservas] = useState([])
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'

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

  const handleCancelar = (id, indice) => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/reservas/${id}`, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al cancelar reserva')
        }
        return res.json()
      })
      .then(() => {
        const nuevasReservas = [...reservas]
        nuevasReservas.splice(indice, 1)
        setReservas(nuevasReservas)
        setError('')
      })
      .catch((err) => {
        console.error('Error al cancelar: ', err)
        setError('No se pudo cancelar la reserva')
      })
  }

  return (
    <div className="mr-wrapper">
      <div className="mr-container">
        <div className="mr-header-row">
          <div>
            <h1 className="mr-title">My Sanctuary Reservations</h1>
            <p className="mr-subtitle">Review and manage your active woodland retreats.</p>
          </div>
          <Link to="/catalogo" className="mr-btn-new">
            + Plan New Getaway
          </Link>
        </div>

        {error && <p className="mr-error">{error}</p>}

        <div className="mr-list">
          {reservas.length === 0 ? (
            <div className="mr-empty-state">
              <h3>No active reservations found.</h3>
              <p>Explore our catalog to book your next stay at Whispering Pines.</p>
            </div>
          ) : (
            reservas.map((reserva, index) => (
              <ReservaCard
                reserva={reserva}
                index={index}
                onCancelar={handleCancelar}
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
