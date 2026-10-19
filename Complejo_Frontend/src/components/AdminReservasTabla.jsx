import React from 'react'
import AdminReservaRow from './AdminReservaRow'

function AdminReservasTabla({ idioma, reservas, onCancelar }) {
  const es = idioma === 'es'

  return (
    <div className="admin-res-table-container">
      <table className="admin-res-table">
        <thead>
          <tr>
            <th>{es ? 'ID RESERVA' : 'BOOKING ID'}</th>
            <th>{es ? 'HUÉSPED' : 'GUEST'}</th>
            <th>{es ? 'ESPACIOS Y FECHAS' : 'RESERVED SPACES & DATES'}</th>
            <th>TOTAL</th>
            <th>{es ? 'ESTADO' : 'STATUS'}</th>
            <th>{es ? 'ACCIONES / MOTIVO' : 'ACTIONS / REASON'}</th>
          </tr>
        </thead>
        <tbody>
          {reservas.length === 0 ? (
            <tr>
              <td colSpan="6" className="admin-res-empty">
                {es ? 'No hay reservas registradas aún.' : 'No reservations registered yet.'}
              </td>
            </tr>
          ) : (
            reservas.map((reserva) => (
              <AdminReservaRow
                idioma={idioma}
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
