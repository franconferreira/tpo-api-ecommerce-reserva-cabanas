import React from 'react'
import AdminReservaRow from './AdminReservaRow'

function AdminReservasTabla({ reservas, onCancelar }) {
  return (
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
                onCancelar={onCancelar}
                key={reserva.id}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AdminReservasTabla
