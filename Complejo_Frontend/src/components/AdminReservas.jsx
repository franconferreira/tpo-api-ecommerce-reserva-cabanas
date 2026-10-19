import React, { useState, useEffect } from 'react'
import AdminReservasTabla from './AdminReservasTabla'
import './AdminReservas.css'

function AdminReservas({ idioma }) {
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

  const handleCancelarReserva = (id, mensajeCancelacion) => {
    const token = localStorage.getItem('jwtToken')
    const datosAEnviar = {
      mensajeCancelacion: mensajeCancelacion
    }
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datosAEnviar)
    }

    fetch(`${URL}/api/admin/reservas/${id}`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mensaje) {
          setReservas(
            reservas.map((r) =>
              r.id === id
                ? { ...r, estado: 'CANCELADA', mensajeCancelacion: mensajeCancelacion }
                : r
            )
          )
          setError('')
        } else {
          console.error('Error al cancelar reserva: ', data)
          setError(es ? 'No se pudo cancelar la reserva' : 'Could not cancel reservation')
        }
      })
      .catch((err) => {
        console.error('Error al cancelar reserva: ', err)
        setError(es ? 'No se pudo cancelar la reserva' : 'Could not cancel reservation')
      })
  }

  return (
    <div className="admin-res-wrapper">
      <div className="admin-res-container">
        <div className="admin-res-header">
          <div>
            <span className="admin-res-overline">
              {es ? 'REGISTRO Y OPERACIONES DE RESERVAS' : 'BOOKING LEDGER & OPERATIONS'}
            </span>
            <h1 className="admin-res-title">
              {es ? 'Reservas de Huéspedes' : 'All Guest Reservations'}
            </h1>
            <p className="admin-res-subtitle">
              {es
                ? 'Supervisa las reservas activas, fechas de ingreso y cancelaciones administrativas con aviso al cliente.'
                : 'Monitor active bookings, check-in schedules, and administrative cancellations across the sanctuary.'}
            </p>
          </div>
        </div>

        {error && <p className="admin-res-error">{error}</p>}

        <AdminReservasTabla
          idioma={idioma}
          reservas={reservas}
          onCancelar={handleCancelarReserva}
        />
      </div>
    </div>
  )
}

export default AdminReservas
