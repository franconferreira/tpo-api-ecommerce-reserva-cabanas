import React, { useState, useEffect } from 'react'
import AdminReservaRow from './AdminReservaRow'
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
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al cancelar reserva')
        }
        return res.json()
      })
      .then(() => {
        setReservas(
          reservas.map((r) =>
            r.id === id ? { ...r, estado: 'CANCELADA' } : r
          )
        )
        setError('')
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

        <div className="admin-res-table-container">
          <table className="admin-res-table">
            <thead>
              <tr>
                <th>BOOKING ID</th>
                <th>GUEST</th>
                <th>RESERVED SPACES & DATES</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-res-empty">
                    No reservations registered yet.
                  </td>
                </tr>
              ) : (
                reservas.map((reserva) => (
                  <AdminReservaRow
                    reserva={reserva}
                    onCancelar={handleCancelarReserva}
                    key={reserva.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminReservas
