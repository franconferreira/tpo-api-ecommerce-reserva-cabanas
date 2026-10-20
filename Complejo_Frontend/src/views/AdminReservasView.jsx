import React from 'react'
import AdminReservas from '../components/AdminReservas'
import '../components/AdminReservas.css'

function AdminReservasView({ idioma }) {
  const es = idioma === 'es'

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

        <AdminReservas idioma={idioma} />
      </div>
    </div>
  )
}

export default AdminReservasView
