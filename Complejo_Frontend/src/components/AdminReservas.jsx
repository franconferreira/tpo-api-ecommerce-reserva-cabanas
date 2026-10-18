import React, { useState, useEffect } from 'react'
import AdminReservasTabla from './AdminReservasTabla'
import './AdminReservas.css'

function AdminReservas() {
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

    fetch(`${URL}/api/admin/reservas`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setReservas(data)
        }
      })
      .catch((err) => {
        console.error('Error al cargar reservas admin: ', err)
      })
  }, [])

  const handleCancelarReserva = (id) => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/admin/reservas/${id}`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mensaje) {
          setReservas(
            reservas.map((r) =>
              r.id === id ? { ...r, estado: 'CANCELADA' } : r
            )
          )
          setError('')
        } else {
          console.error('Error al cancelar reserva: ', data)
          setError('No se pudo cancelar la reserva')
        }
      })
      .catch((err) => {
        console.error('Error al cancelar reserva: ', err)
        setError('No se pudo cancelar la reserva')
      })
  }

  return (
    <div className="admin-res-wrapper">
      <div className="admin-res-container">
        <div className="admin-res-header">
          <div>
            <span className="admin-res-overline">BOOKING LEDGER & OPERATIONS</span>
            <h1 className="admin-res-title">All Guest Reservations</h1>
            <p className="admin-res-subtitle">
              Monitor active bookings, check-in schedules, and administrative cancellations across the sanctuary.
            </p>
          </div>
        </div>

        {error && <p className="admin-res-error">{error}</p>}

        <AdminReservasTabla reservas={reservas} onCancelar={handleCancelarReserva} />
      </div>
    </div>
  )
}

export default AdminReservas
